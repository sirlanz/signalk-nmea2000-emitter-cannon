module.exports = (_app, _plugin) => {
  return {
    title: "Wind (130306)",
    optionKey: "WIND",
    keys: ["environment.wind.angleApparent", "environment.wind.speedApparent"],
    callback: (angle, speed) => {
      try {
        return [
          {
            prio: 2,
            pgn: 130306,
            dst: 255,
            fields: {
              windSpeed: speed,
              windAngle: angle < 0 ? angle + Math.PI * 2 : angle,
              reference: "Apparent",
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
            pgn: 130306,
            dst: 255,
            prio: 2,
            fields: {
              windSpeed: 1.2,
              windAngle: 2.0944,
              reference: "Apparent",
            },
          },
        ],
      },
      {
        input: [-2.0944, 1.5],
        expected: [
          {
            pgn: 130306,
            dst: 255,
            prio: 2,
            fields: {
              windSpeed: 1.5,
              windAngle: 4.1888,
              reference: "Apparent",
            },
          },
        ],
      },
    ],
  };
};
