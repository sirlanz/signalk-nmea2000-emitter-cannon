module.exports = (_app, _plugin) => {
  return {
    pgn: 129302,
    title: "Bearing and Distance Between Two Marks (129302)",
    optionKey: "BEARING_DISTANCE_MARKS",
    keys: [
      "navigation.course.nextPoint.bearingMagnetic",
      "navigation.course.nextPoint.distance",
      "navigation.course.previousPoint.bearingMagnetic",
      "navigation.course.previousPoint.distance",
      "navigation.course.nextPoint.type",
      "navigation.course.previousPoint.type",
    ],
    timeouts: [5000, 5000, 5000, 5000, 5000, 5000], // 5 seconds
    callback: (nextBearing, nextDistance, prevBearing, prevDistance, nextType, prevType) => {
      if (
        nextBearing == null &&
        nextDistance == null &&
        prevBearing == null &&
        prevDistance == null
      ) {
        return null;
      }

      return [
        {
          prio: 2,
          pgn: 129302,
          dst: 255,
          fields: {
            sid: 0,
            bearingOriginToDestination: nextBearing,
            distanceToMark: nextDistance,
            bearingPositionToMark: prevBearing,
            distancePositionToMark: prevDistance,
            originMarkType: prevType === "waypoint" ? "Waypoint" : "Mark",
            destinationMarkType: nextType === "waypoint" ? "Waypoint" : "Mark",
          },
        },
      ];
    },
    tests: [
      {
        input: [1.2217, 2000, 0.7854, 1500, "waypoint", "waypoint"], // 70° to next WP (2km), 45° from prev WP (1.5km)
        expected: [
          {
            prio: 2,
            pgn: 129302,
            dst: 255,
            fields: {
              sid: 0,
              bearingOriginToDestination: 1.2217,
              distanceToMark: 2000,
              bearingPositionToMark: 0.7854,
              distancePositionToMark: 1500,
              originMarkType: "Waypoint",
              destinationMarkType: "Waypoint",
            },
          },
        ],
      },
      {
        input: [2.0944, 5000, null, null, "mark", null], // 120° to mark, 5km away
        expected: [
          {
            prio: 2,
            pgn: 129302,
            dst: 255,
            fields: {
              sid: 0,
              bearingOriginToDestination: 2.0944,
              distanceToMark: 5000,
              destinationMarkType: "Mark",
            },
          },
        ],
      },
    ],
  };
};
