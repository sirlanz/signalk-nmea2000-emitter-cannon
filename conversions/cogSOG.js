const _ = require("lodash");

module.exports = (_app, _plugin) => {
  var _lastUpdate = null;

  return {
    title: "COG & SOG (129026)",
    optionKey: "COG_SOG",
    keys: ["navigation.courseOverGroundTrue", "navigation.speedOverGround"],
    callback: (course, speed) => {
      try {
        return [
          {
            prio: 2,
            pgn: 129026,
            dst: 255,
            fields: {
              cogReference: "True",
              cog: course,
              sog: speed,
            },
          },
        ];
      } catch (err) {
        console.error(err);
      }
    },
    tests: [
      {
        input: [2.1, 9],
        expected: [
          {
            prio: 2,
            pgn: 129026,
            dst: 255,
            fields: {
              cogReference: "True",
              cog: 2.1,
              sog: 9,
            },
          },
        ],
      },
    ],
  };
};
