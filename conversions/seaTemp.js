module.exports = (_app, _plugin) => {
  return {
    title: "Sea/Air Temp (130310)",
    optionKey: "SEA_TEMPERATURE",
    keys: [
      "environment.water.temperature",
      "environment.outside.temperature",
      "environment.outside.pressure",
    ],
    callback: (water, air, pressure) => {
      try {
        return [
          {
            prio: 2,
            pgn: 130310,
            dst: 255,
            fields: {
              sid: 0xff,
              waterTemperature: water,
              outsideAmbientAirTemperature: air,
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
        input: [281.2, 291, 20100],
        expected: [
          {
            prio: 2,
            pgn: 130310,
            dst: 255,
            fields: {
              sid: 0xff,
              waterTemperature: 281.2,
              outsideAmbientAirTemperature: 291,
              atmosphericPressure: 20100,
            },
          },
        ],
      },
    ],
  };
};
