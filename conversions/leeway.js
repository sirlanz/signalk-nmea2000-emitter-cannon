module.exports = (_app, _plugin) => {
  return {
    pgns: [128000],
    title: "Leeway (128000)",
    optionKey: "LEEWAY",
    keys: ["performance.leeway"],

    callback: (leeway) => {
      try {
        return [
          {
            prio: 2,
            pgn: 128000,
            dst: 255,
            fields: {
              leewayAngle: leeway,
            },
          },
        ];
      } catch (err) {
        console.error(err);
      }
    },
    tests: [
      {
        input: [0.24],
        expected: [
          {
            prio: 2,
            pgn: 128000,
            dst: 255,
            fields: {
              leewayAngle: 0.24,
            },
          },
        ],
      },
    ],
  };
};
