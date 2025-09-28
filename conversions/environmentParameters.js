module.exports = (_app, _plugin) => {
  return {
    pgns: [130311],
    title: "Atmospheric Pressure (130311)",
    optionKey: "ENVIRONMENT_PARAMETERS",
    keys: ["environment.outside.pressure"],

    callback: (pressure) => {
      try {
        return [
          {
            prio: 2,
            pgn: 130311,
            dst: 255,
            fields: {
              atmosphericPressure: pressure,
            },
          },
        ];
      } catch (err) {
        console.error(err);
      }
    },
    tests: [
      {
        input: [3507100],
        expected: [
          {
            prio: 2,
            pgn: 130311,
            dst: 255,
            fields: {
              atmosphericPressure: 3507100,
            },
          },
        ],
      },
    ],
  };
};
