module.exports = (_app, _plugin) => {
  return {
    pgn: 127252,
    title: "Heave (127252)",
    optionKey: "HEAVE",
    keys: ["navigation.heave"],
    timeouts: [1000], // 1 second for responsive motion data
    callback: (heave) => {
      if (heave == null) {
        return null;
      }

      return [
        {
          prio: 2,
          pgn: 127252,
          dst: 255,
          fields: {
            sid: 0,
            heave: heave,
          },
        },
      ];
    },
    tests: [
      {
        input: [0.15], // 15cm heave up
        expected: [
          {
            prio: 2,
            pgn: 127252,
            dst: 255,
            fields: {
              sid: 0,
              heave: 0.15,
            },
          },
        ],
      },
      {
        input: [-0.08], // 8cm heave down
        expected: [
          {
            prio: 2,
            pgn: 127252,
            dst: 255,
            fields: {
              sid: 0,
              heave: -0.08,
            },
          },
        ],
      },
    ],
  };
};
