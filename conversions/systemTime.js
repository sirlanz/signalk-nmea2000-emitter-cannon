module.exports = (_app, _plugin) => {
  return {
    title: "System Time (126992)",
    sourceType: "timer",
    interval: 1000,
    optionKey: "SYSTEM_TIME",
    callback: (_app, inputDate) => {
      var dateObj = inputDate ? inputDate : new Date();
      var date = Math.trunc(dateObj.getTime() / 86400 / 1000);
      var time =
        dateObj.getUTCHours() * (60 * 60) + dateObj.getUTCMinutes() * 60 + dateObj.getUTCSeconds();

      return [
        {
          prio: 2,
          pgn: 126992,
          dst: 255,
          fields: {
            date: date,
            time: time,
          },
        },
      ];
    },
    tests: [
      {
        input: [undefined, new Date("2017-04-15T14:59:53.123Z")],
        expected: [
          {
            prio: 2,
            pgn: 126992,
            dst: 255,
            fields: {
              date: 17266,
              time: 53993,
            },
          },
        ],
      },
    ],
  };
};
