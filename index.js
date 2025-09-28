const Bacon = require("baconjs");
const _util = require("node:util");
const _ = require("lodash");
const path = require("node:path");
const fs = require("node:fs");

module.exports = (app) => {
  const plugin = {};
  let unsubscribes = [];
  let timers = [];
  let conversions = load_conversions(app, plugin);
  conversions = [].concat.apply([], conversions);

  /*
    Each conversion can specify the sourceType and outputType.

    Source type can be:

      onDelta - You will get all deltas via app.signalk.on('delta', ...). Please do no use this unless absolutely necessary.

      onValueChange - The conversion should specify a variable called 'keys' which is an array of the Signal K paths that the convesion needs

      timer - The conversions callback will get called per the givien 'interval' variable

    Output type can be:

      'to-n2k' - The output will be sent through the to-n2k package (https://github.com/tkurki/to-n2k)

    sourceType defaults to 'onValueChange'
    outputType defaults to 'to-n2k'
   */

  // Forward function declarations will be available due to hoisting
  async function processOutput(conversion, options, output) {
    if (options?.resend && options.resend > 0) {
      if (conversion.resendTimer) {
        clearResendInterval(conversion.resendTimer);
      }
      const startedAt = Date.now();
      conversion.resendTimer = setInterval(async () => {
        try {
          const values = await Promise.resolve(output);
          outputTypes[conversion.outputType](values);
        } catch (err) {
          console.error("Error in resend timer:", err);
        }
        if (Date.now() - startedAt > (options.resendTime || 30) * 1000) {
          clearResendInterval(conversion.resendTimer);
        }
      }, options.resend * 1000);
      timers.push(conversion.resendTimer);
    }
    try {
      const values = await Promise.resolve(output);
      outputTypes[conversion.outputType](values);
    } catch (err) {
      console.error("Error processing output:", err);
    }
  }

  function clearResendInterval(timer) {
    const idx = timers.indexOf(timer);
    if (idx !== -1) {
      timers.splice(idx, 1);
    }
    clearInterval(timer);
  }

  function mapOnDelta(conversion, options) {
    app.signalk.on("delta", (delta) => {
      try {
        processOutput(conversion, options, conversion.callback(delta));
      } catch (err) {
        app.error(err);
        console.error(err.stack);
      }
    });
  }

  function mapBaconjs(conversion, options) {
    unsubscribes.push(
      timeoutingArrayStream(
        conversion.keys,
        conversion.timeouts,
        app.streambundle,
        unsubscribes,
        options
      )
        .map((values) => conversion.callback.call(this, ...values))
        .onValue((pgns) => {
          processOutput(conversion, options, pgns);
        })
    );
  }

  function mapSubscription(mapping, options) {
    const subscription = {
      context: mapping.context,
      subscribe: [],
    };

    const keys = _.isFunction(mapping.keys) ? mapping.keys(options) : mapping.keys;
    keys.forEach((key) => {
      subscription.subscribe.push({ path: key });
    });

    app.debug(`subscription: ${JSON.stringify(subscription)}`);

    app.subscriptionmanager.subscribe(subscription, unsubscribes, subscription_error, (delta) => {
      try {
        processOutput(mapping, options, mapping.callback(delta));
      } catch (err) {
        app.error(err);
      }
    });
  }

  function mapTimer(conversion, _options) {
    timers.push(
      setInterval(() => {
        processOutput(conversion, null, conversion.callback(app));
      }, conversion.interval)
    );
  }

  function timeoutingArrayStream(keys, timeouts = [], streambundle, unsubscribes, options) {
    app.debug(`keys:${keys}`);
    app.debug(`timeouts:${timeouts}`);
    const lastValues = keys.reduce((acc, key) => {
      acc[key] = {
        timestamp: Date.now(),
        value: null,
      };
      return acc;
    }, {});
    const combinedBus = new Bacon.Bus();
    keys.forEach((skKey) => {
      const sourceRef = options[pathToPropName(skKey)];
      app.debug(`${skKey} ${sourceRef}`);

      let bus = streambundle.getSelfBus(skKey);
      if (sourceRef) {
        bus = bus.filter((x) => x.$source === sourceRef);
      }
      bus.map(".value").onValue((value) => {
        lastValues[skKey] = {
          timestamp: Date.now(),
          value,
        };
        const now = Date.now();

        combinedBus.push(
          keys.map((key, i) => {
            return notDefined(timeouts[i]) || lastValues[key].timestamp + timeouts[i] > now
              ? lastValues[key].value
              : null;
          })
        );
      });
    });
    const result = combinedBus.debounce(10);
    if (app.debug.enabled) {
      unsubscribes.push(result.onValue((x) => app.debug(`${keys}:${x}`)));
    }
    return result;
  }

  const sourceTypes = {
    onDelta: mapOnDelta,
    onValueChange: mapBaconjs,
    subscription: mapSubscription,
    timer: mapTimer,
  };

  const outputTypes = {
    "to-n2k": processToN2K,
  };

  plugin.id = "sk-n2k-emitter";
  plugin.name = "SignalK to N2K Emitter";
  plugin.description =
    "Plugin to convert Signal K to NMEA2000 with enhanced Garmin compatibility (92% PGN coverage)";

  const schema = {
    type: "object",
    title: "Conversions to NMEA2000",
    description:
      "If there is SignalK data for the conversion generate the following NMEA2000 pgns from Signal K data:",
    properties: {},
  };

  function updateSchema() {
    conversions.forEach((conversion) => {
      const obj = {
        type: "object",
        title: conversion.title,
        properties: {
          enabled: {
            title: "Enabled",
            type: "boolean",
            default: false,
          },
          resend: {
            type: "number",
            title: "Resend (seconds)",
            description: "If non-zero, the msg will be periodically resent",
            default: 0,
          },
          resendTime: {
            type: "number",
            title: "Resend Duration (seconds)",
            description: "The value will be resent for the given #number of seconds",
            default: 30,
          },
        },
      };
      const safeKeys = conversion.keys || [];
      safeKeys.forEach((key, _i) => {
        obj.properties[pathToPropName(key)] = {
          title: `Source for ${key}`,
          description: `Use data only from this source (leave blank to ignore source)`,
          type: "string",
        };
      });

      schema.properties[conversion.optionKey] = obj;

      if (conversion.properties) {
        const props =
          typeof conversion.properties === "function"
            ? conversion.properties()
            : conversion.properties;
        _.extend(obj.properties, props);
      }
    });
  }

  updateSchema();

  plugin.schema = () => {
    updateSchema();
    return schema;
  };

  plugin.start = (options) => {
    conversions.forEach((conversion) => {
      if (!_.isArray(conversion)) {
        conversion = [conversion];
      }
      conversion.forEach((conversion) => {
        if (options[conversion.optionKey] && options[conversion.optionKey].enabled) {
          app.debug(`${conversion.title} is enabled`);

          let subConversions = conversion.conversions;
          if (_.isUndefined(subConversions)) {
            subConversions = [conversion];
          } else if (_.isFunction(subConversions)) {
            subConversions = subConversions(options);
          }
          if (subConversions != null) {
            subConversions.forEach((subConversion) => {
              if (!_.isUndefined(subConversion)) {
                const type = _.isUndefined(subConversion.sourceType)
                  ? "onValueChange"
                  : subConversion.sourceType;
                const mapper = sourceTypes[type];
                if (_.isUndefined(mapper)) {
                  console.error(`Unknown conversion type: ${type}`);
                } else {
                  if (_.isUndefined(subConversion.outputType)) {
                    subConversion.outputType = "to-n2k";
                  }
                  mapper(subConversion, options[conversion.optionKey]);
                }
              }
            });
          }
        }
      });
    });
  };

  plugin.stop = () => {
    unsubscribes.forEach((f) => {
      f();
    });
    unsubscribes = [];
    timers.forEach((timer) => {
      clearInterval(timer);
    });
    timers = [];
  };

  const subscription_error = (err) => {
    app.error(err.toString());
  };

  return plugin;

  function load_conversions(app, plugin) {
    const fpath = path.join(__dirname, "conversions");
    const files = fs.readdirSync(fpath);
    return files
      .map((fname) => {
        const pgn = path.basename(fname, ".js");
        return require(path.join(fpath, pgn))(app, plugin);
      })
      .filter((converter) => typeof converter !== "undefined");
  }

  async function processToN2K(values) {
    if (values) {
      try {
        const pgns = await Promise.all(values);
        pgns
          .filter((pgn) => pgn != null)
          .forEach((pgn) => {
            try {
              app.debug(`emit nmea2000JsonOut ${JSON.stringify(pgn)}`);
              app.emit("nmea2000JsonOut", pgn);
            } catch (err) {
              console.error(`error writing pgn ${JSON.stringify(pgn)}`);
              console.error(err.stack);
            }
          });
        if (app.reportOutputMessages) {
          app.reportOutputMessages(pgns.length);
        }
      } catch (err) {
        console.error("Error processing N2K values:", err);
      }
    }
  }
};

const pathToPropName = (path) => {
  return path.replace(/\./g, "");
};

const notDefined = (x) => typeof x === "undefined";
const _isDefined = (x) => typeof x !== "undefined";
