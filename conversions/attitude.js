module.exports = (_app, _plugin) => {
  return {
    pgn: 127257,
    title: "Attitude (127257)",
    optionKey: "ATTITUDE",
    keys: ["navigation.attitude"],
    callback: (attitude) => {
      return [
        {
          prio: 2,
          pgn: 127257,
          dst: 255,
          fields: {
            sid: 87,
            pitch: attitude.pitch,
            yaw: attitude.yaw,
            roll: attitude.roll,
          },
        },
      ];
    },
    tests: [
      {
        input: [
          {
            yaw: 1.8843,
            pitch: 0.042,
            roll: 0.042,
          },
        ],
        expected: [
          {
            dst: 255,
            fields: {
              pitch: 0.042,
              roll: 0.042,
              sid: 87,
              yaw: 1.8843,
            },
            pgn: 127257,
            prio: 2,
          },
        ],
      },
    ],
  };
};
