const _ = require("lodash");

module.exports = (app, _plugin) => {
  return {
    title: "Depth (128267)",
    optionKey: "DEPTH",
    keys: ["environment.depth.belowTransducer"],
    callback: (belowTransducer) => {
      var surfaceToTransducer = app.getSelfPath("environment.depth.surfaceToTransducer.value");
      var transducerToKeel = app.getSelfPath("environment.depth.transducerToKeel.value");
      var offset = _.isUndefined(surfaceToTransducer)
        ? _.isUndefined(transducerToKeel)
          ? 0
          : transducerToKeel
        : surfaceToTransducer;
      try {
        return [
          {
            pgn: 128267,
            SID: 0xff,
            Depth: belowTransducer,
            Offset: offset,
          },
        ];
      } catch (err) {
        console.error(err);
      }
    },
    tests: [
      {
        input: [4.5],
        skSelfData: {
          "environment.depth.surfaceToTransducer.value": 1,
        },
        expected: [
          {
            prio: 2,
            pgn: 128267,
            dst: 255,
            fields: {
              depth: 4.5,
              offset: 1,
            },
          },
        ],
      },
      {
        input: [2.1],
        skSelfData: {
          "environment.depth.transducerToKeel.value": 3,
        },
        expected: [
          {
            prio: 2,
            pgn: 128267,
            dst: 255,
            fields: {
              depth: 2.1,
              offset: 3,
            },
          },
        ],
      },
    ],
  };
};
