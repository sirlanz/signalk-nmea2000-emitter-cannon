module.exports = (_app, _plugin) => {
  return {
    title: "Set/Drift (129291)",
    optionKey: "SET_DRIFT",
    keys: ["environment.current.setTrue", "environment.current.drift"],
    callback: (set, drift) => {
      try {
        return [
          {
            prio: 2,
            pgn: 129291,
            dst: 255,
            fields: {
              set: set,
              drift: drift,
              setReference: "True",
            },
          },
        ];
      } catch (err) {
        console.error(err);
      }
    },

    tests: [
      {
        input: [2.0944, 1.2],
        expected: [
          {
            pgn: 129291,
            dst: 255,
            prio: 2,
            fields: {
              drift: 1.2,
              set: 2.0944,
              setReference: "True",
            },
          },
        ],
      },
      {
        input: [1.0944, 1.5],
        expected: [
          {
            pgn: 129291,
            dst: 255,
            prio: 2,
            fields: {
              drift: 1.5,
              set: 1.0944,
              setReference: "True",
            },
          },
        ],
      },
    ],
  };
};
