module.exports = (_app, _plugin) => {
  return {
    pgns: [128259],
    title: "Speed (128259)",
    optionKey: "SPEED",
    keys: ["navigation.speedThroughWater"],

    callback: (speed) => {
      try {
        return [
          {
            prio: 2,
            pgn: 128259,
            dst: 255,
            fields: {
              speedWaterReferenced: speed,
            },
          },
        ];
      } catch (err) {
        console.error(err);
      }
    },
    tests: [
      {
        input: [3],
        expected: [
          {
            prio: 2,
            pgn: 128259,
            dst: 255,
            fields: {
              speedWaterReferenced: 3,
            },
          },
        ],
      },
    ],
  };
};
