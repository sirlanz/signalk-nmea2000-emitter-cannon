module.exports = (_app, _plugin) => {
  return [
    {
      pgn: 130313,
      title: "Outside Humidity (PGN130313)",
      optionKey: "HUMIDITY_OUTSIDE",
      keys: ["environment.outside.relativeHumidity"],
      callback: (humidity) => {
        return [
          {
            prio: 2,
            pgn: 130313,
            dst: 255,
            fields: {
              instance: 100,
              source: "Outside",
              actualHumidity: humidity,
            },
          },
        ];
      },
      tests: [
        {
          input: [0.5],
          expected: [
            {
              prio: 2,
              pgn: 130313,
              dst: 255,
              fields: {
                instance: 100,
                source: "Outside",
                actualHumidity: 0.5,
              },
            },
          ],
        },
      ],
    },
    {
      pgn: 130313,
      title: "Inside Humidity (PGN130313)",
      optionKey: "HUMIDITY_INSIDE",
      keys: ["environment.inside.relativeHumidity"],
      callback: (humidity) => {
        return [
          {
            prio: 2,
            pgn: 130313,
            dst: 255,
            fields: {
              instance: 100,
              source: "Inside",
              actualHumidity: humidity,
            },
          },
        ];
      },
      tests: [
        {
          input: [1.0],
          expected: [
            {
              prio: 2,
              pgn: 130313,
              dst: 255,
              fields: {
                instance: 100,
                source: "Inside",
                actualHumidity: 1.0,
              },
            },
          ],
        },
      ],
    },
  ];
};
