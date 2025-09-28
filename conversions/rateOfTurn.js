const _ = require("lodash");

module.exports = (_app, _plugin) => {
  return {
    pgn: 127251,
    title: "Rate of Turn (127251)",
    optionKey: "RATE_OF_TURN",
    keys: ["navigation.rateOfTurn"],
    callback: (rateOfTurn) => {
      if (rateOfTurn == null) {
        return null;
      }

      return [
        {
          prio: 2,
          pgn: 127251,
          dst: 255,
          fields: {
            sid: 0,
            rate: rateOfTurn, // Rate of turn in rad/s
            reserved: 16777215,
          },
        },
      ];
    },
    tests: [
      {
        input: [0.0175], // 1 degree per second
        expected: [
          {
            prio: 2,
            pgn: 127251,
            dst: 255,
            fields: {
              sid: 0,
              rate: 0.0175,
              reserved: 16777215,
            },
          },
        ],
      },
      {
        input: [-0.0349], // 2 degrees per second, port turn
        expected: [
          {
            prio: 2,
            pgn: 127251,
            dst: 255,
            fields: {
              sid: 0,
              rate: -0.0349,
              reserved: 16777215,
            },
          },
        ],
      },
    ],
  };
};
