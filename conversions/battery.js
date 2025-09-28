const _ = require("lodash");

module.exports = (_app, _plugin) => {
  const batteryKeys = [
    "voltage",
    "current",
    "temperature",
    "Temperature1",
    "capacity.stateOfCharge",
    "capacity.timeRemaining",
    "capacity.remaining",
    "capacity.actual",
    "capacity.stateOfHealth",
    "ripple",
  ];

  return {
    title: "Battery (127506 & 127508)",
    optionKey: "BATTERY",
    context: "vessels.self",
    properties: {
      batteries: {
        title: "Battery Mapping",
        type: "array",
        items: {
          type: "object",
          properties: {
            signalkId: {
              title: "Signal K battery id",
              type: "string",
            },
            instanceId: {
              title: "NMEA2000 Battery Instance Id",
              type: "number",
            },
          },
        },
      },
    },

    testOptions: {
      BATTERY: {
        batteries: [
          {
            signalkId: 0,
            instanceId: 1,
          },
        ],
      },
    },

    conversions: (options) => {
      if (!_.get(options, "BATTERY.batteries")) {
        return null;
      }
      return options.BATTERY.batteries.map((battery) => ({
        keys: batteryKeys.map((key) => `electrical.batteries.${battery.signalkId}.${key}`),
        timeouts: batteryKeys.map((_key) => 60000),
        callback: (
          voltage,
          current,
          temperature,
          temperature1,
          stateOfCharge,
          timeRemaining,
          capacityRemaining,
          capacityActual,
          stateOfHealth,
          ripple
        ) => {
          const res = [];

          // Prefer 'temperature' if available; otherwise fall back to 'Temperature1' (both are Kelvin)
          const tempOut = temperature != null ? temperature : temperature1;

          if (voltage != null || current != null || tempOut != null) {
            res.push({
              prio: 2,
              pgn: 127508,
              dst: 255,
              fields: {
                instance: battery.instanceId,
                voltage: voltage,
                current: current,
                temperature: tempOut,
              },
            });
          }

          // Compute timeRemaining if not provided: remaining [C] / discharge current [A] → seconds
          let computedTR;
          if (timeRemaining == null) {
            // Prefer remainingC; if not available, derive from actual * SoC
            const remainingC =
              capacityRemaining != null
                ? Number(capacityRemaining)
                : capacityActual != null && stateOfCharge != null
                  ? Number(capacityActual) * Number(stateOfCharge)
                  : undefined;

            // Determine discharge current magnitude supporting either convention:
            // - positive current = discharging
            // - negative current = discharging
            let dischargeCurrentA;
            if (current != null && Number.isFinite(Number(current))) {
              const a = Number(current);
              const threshold = 0.1;
              if (a > threshold) {
                dischargeCurrentA = a; // positive discharging
              } else if (a < -threshold) {
                dischargeCurrentA = -a; // negative discharging
              }
            }

            if (
              Number.isFinite(remainingC) &&
              Number.isFinite(dischargeCurrentA) &&
              dischargeCurrentA > 0
            ) {
              let seconds = Math.round(remainingC / dischargeCurrentA); // C / A = s
              const max = 30 * 24 * 3600; // cap at 30 days
              if (seconds < 0) seconds = 0;
              if (seconds > max) seconds = max;
              computedTR = seconds;
            }
          }

          if (
            stateOfCharge != null ||
            timeRemaining != null ||
            computedTR != null ||
            stateOfHealth != null ||
            ripple != null
          ) {
            const adjustedStateOfCharge =
              _.isUndefined(stateOfCharge) || stateOfCharge == null
                ? undefined
                : stateOfCharge * 100;
            const adjustedStateOfHealth =
              _.isUndefined(stateOfHealth) || stateOfHealth == null
                ? undefined
                : stateOfHealth * 100;

            res.push({
              prio: 2,
              pgn: 127506,
              dst: 255,
              fields: {
                instance: battery.instanceId,
                dcType: "Battery",
                stateOfCharge: adjustedStateOfCharge,
                stateOfHealth: adjustedStateOfHealth,
                timeRemaining: timeRemaining != null ? timeRemaining : computedTR,
                rippleVoltage: ripple,
              },
            });
          }
          return res;
        },
        tests: [
          // Explicit timeRemaining provided; Temperature from 'temperature'
          {
            input: [12.5, 23.1, 290.15, null, 0.93, 12340, 378000, null, 0.6, 12.0],
            expected: [
              {
                prio: 2,
                pgn: 127508,
                dst: 255,
                fields: {
                  instance: 1,
                  voltage: 12.5,
                  current: 23.1,
                  temperature: 290.15,
                },
              },
              {
                prio: 2,
                pgn: 127506,
                dst: 255,
                fields: {
                  instance: 1,
                  dcType: "Battery",
                  stateOfCharge: 93,
                  stateOfHealth: 60,
                  timeRemaining: 12340,
                  rippleVoltage: 12,
                },
              },
            ],
          },
          // Derived timeRemaining from remaining C and positive discharge current; Temperature from 'Temperature1'
          {
            input: [13.63, 20, null, 293.5, 1.0, null, 378000, null, null, null],
            expected: [
              {
                prio: 2,
                pgn: 127508,
                dst: 255,
                fields: {
                  instance: 1,
                  voltage: 13.63,
                  current: 20,
                  temperature: 293.5,
                },
              },
              {
                prio: 2,
                pgn: 127506,
                dst: 255,
                fields: {
                  instance: 1,
                  dcType: "Battery",
                  stateOfCharge: 100,
                  timeRemaining: 18900,
                },
              },
            ],
          },
          // Derived timeRemaining with negative-discharge convention (current = -20 A)
          {
            input: [13.63, -20, null, 293.5, 1.0, null, 378000, null, null, null],
            expected: [
              {
                prio: 2,
                pgn: 127508,
                dst: 255,
                fields: {
                  instance: 1,
                  voltage: 13.63,
                  current: -20,
                  temperature: 293.5,
                },
              },
              {
                prio: 2,
                pgn: 127506,
                dst: 255,
                fields: {
                  instance: 1,
                  dcType: "Battery",
                  stateOfCharge: 100,
                  timeRemaining: 18900,
                },
              },
            ],
          },
        ],
      }));
    },
  };
};
