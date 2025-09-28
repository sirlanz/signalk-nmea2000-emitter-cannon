const pressMessage = (pres, src) => {
  return [
    {
      prio: 2,
      pgn: 130314,
      dst: 255,
      fields: {
        instance: 100,
        source: src,
        pressure: pres,
      },
    },
  ];
};

module.exports = (_app, _plugin) => {
  return [
    {
      pgn: 130314,
      title: "Atmospheric Pressure (130314)",
      optionKey: "PRESSURE_ATMOSPHERIC",
      keys: ["environment.outside.pressure"],
      callback: (pressure) => {
        return pressMessage(pressure, "Atmospheric");
      },
      tests: [
        {
          input: [103047.8],
          expected: [
            {
              prio: 2,
              pgn: 130314,
              dst: 255,
              fields: {
                instance: 100,
                source: "Atmospheric",
                pressure: 103047.8,
              },
            },
          ],
        },
      ],
    },
  ];
};
