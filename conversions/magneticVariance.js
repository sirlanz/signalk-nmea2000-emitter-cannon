const _ = require("lodash");

module.exports = (_app, _plugin) => {
  return {
    pgn: 127258,
    title: "Magnetic Variance (127258)",
    optionKey: "MAGNETIC_VARIANCE",
    keys: ["navigation.magneticVariation", "navigation.magneticVariationAgeOfService"],
    callback: (magneticVariation, ageOfService) => {
      if (magneticVariation == null) {
        return null;
      }

      return [
        {
          prio: 2,
          pgn: 127258,
          dst: 255,
          fields: {
            sid: 0,
            variationSource: "Table",
            ageOfService: ageOfService || 0,
            variation: magneticVariation,
          },
        },
      ];
    },
    tests: [
      {
        input: [0.0349, 30], // 2 degrees east, 30 days old
        expected: [
          {
            prio: 2,
            pgn: 127258,
            dst: 255,
            fields: {
              ageOfService: 30,
              sid: 0,
              variationSource: "Table",
              variation: 0.0349,
            },
          },
        ],
      },
      {
        input: [-0.0524, null], // 3 degrees west, unknown age
        expected: [
          {
            prio: 2,
            pgn: 127258,
            dst: 255,
            fields: {
              ageOfService: 0,
              sid: 0,
              variationSource: "Table",
              variation: -0.0524,
            },
          },
        ],
      },
    ],
  };
};
