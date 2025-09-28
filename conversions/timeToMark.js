module.exports = (_app, _plugin) => {
  return {
    pgn: 129301,
    title: "Time to/from Mark (129301)",
    optionKey: "TIME_TO_MARK",
    keys: [
      "navigation.course.nextPoint.timeToGo",
      "navigation.course.previousPoint.timeSince",
      "navigation.course.nextPoint.type",
    ],
    timeouts: [5000, 5000, 5000], // 5 seconds
    callback: (timeToGo, timeSince, markType) => {
      if (timeToGo == null && timeSince == null) {
        return null;
      }

      return [
        {
          prio: 2,
          pgn: 129301,
          dst: 255,
          fields: {
            sid: 0,
            timeToMark: timeToGo,
            markType: markType === "waypoint" ? "Waypoint" : "Mark",
            timeSinceMark: timeSince,
          },
        },
      ];
    },
    tests: [
      {
        input: [1800, null, "waypoint"], // 30 minutes to waypoint
        expected: [
          {
            prio: 2,
            pgn: 129301,
            dst: 255,
            fields: {
              sid: 0,
              timeToMark: 1800,
              markType: "Waypoint",
            },
          },
        ],
      },
      {
        input: [null, 900, "mark"], // 15 minutes since mark
        expected: [
          {
            prio: 2,
            pgn: 129301,
            dst: 255,
            fields: {
              sid: 0,
              timeSinceMark: 900,
              markType: "Mark",
            },
          },
        ],
      },
    ],
  };
};
