module.exports = (_app, _plugin) => {
  return [
    {
      pgn: 129283,
      title: "Cross Track Error (129283)",
      optionKey: "CROSS_TRACK_ERROR",
      keys: ["navigation.course.calcValues.crossTrackError"],
      callback: (XTE) => [
        {
          prio: 2,
          pgn: 129283,
          dst: 255,
          fields: {
            xte: XTE,
            xteMode: "Autonomous",
            navigationTerminated: "No",
          },
        },
      ],
      tests: [
        {
          input: [0.12],
          expected: [
            {
              prio: 2,
              pgn: 129283,
              dst: 255,
              fields: {
                xteMode: "Autonomous",
                navigationTerminated: "No",
                xte: 0.12,
              },
            },
          ],
        },
      ],
    },
    {
      pgn: 129284,
      title: "Navigation Data (129284)",
      optionKey: "NAVIGATION_DATA",
      keys: [
        "navigation.course.calcValues.distance",
        "navigation.course.calcValues.bearingTrue",
        "navigation.course.calcValues.bearingTrackTrue",
        "navigation.course.nextPoint",
        "navigation.course.calcValues.velocityMadeGood",
        "notifications.navigation.arrivalCircleEntered",
        "notifications.navigation.perpendicularPassed",
        "navigation.course.activeRoute",
      ],
      timeouts: [10000, 10000, 10000, 10000, 10000, undefined, undefined, 10000],
      callback: (distToDest, bearingToDest, bearingOriginToDest, destPos, WCV, ace, pp, rte) => {
        var dateObj = new Date();
        var secondsToGo = Math.trunc(distToDest / WCV);
        var etaDate = Math.trunc((dateObj.getTime() / 1000 + secondsToGo) / 86400);
        var etaTime =
          (dateObj.getUTCHours() * (60 * 60) +
            dateObj.getUTCMinutes() * 60 +
            dateObj.getUTCSeconds() +
            secondsToGo) %
          86400;
        const wpid = rte && typeof rte?.pointIndex === "number" ? rte.pointIndex + 1 : 0;
        return [
          {
            prio: 2,
            pgn: 129284,
            dst: 255,
            fields: {
              sid: 0x88,
              distanceToWaypoint: distToDest,
              courseBearingReference: "True",
              perpendicularCrossed: pp != null ? "Yes" : "No",
              arrivalCircleEntered: ace != null ? "Yes" : "No",
              calculationType: "Rhumbline",
              etaTime: WCV > 0 ? etaTime : undefined,
              etaDate: WCV > 0 ? etaDate : undefined,
              bearingOriginToDestinationWaypoint: bearingOriginToDest,
              bearingPositionToDestinationWaypoint: bearingToDest,
              originWaypointNumber: undefined,
              destinationWaypointNumber: parseInt(wpid, 10),
              destinationLatitude: destPos?.position?.latitude,
              destinationLongitude: destPos?.position?.longitude,
              waypointClosingVelocity: WCV,
            },
          },
        ];
      },
      tests: [
        {
          input: [
            12,
            1.23,
            3.1,
            { position: { longitude: -75.487264, latitude: 32.0631296 } },
            4.0,
            null,
            1,
            { pointIndex: 5 },
          ],
          expected: [
            {
              __preprocess__: (testResult) => {
                //these change every time
                delete testResult.fields.etaDate;
                delete testResult.fields.etaTime;
              },
              prio: 2,
              pgn: 129284,
              dst: 255,
              fields: {
                sid: 136,
                distanceToWaypoint: 12,
                courseBearingReference: "True",
                perpendicularCrossed: "Yes",
                arrivalCircleEntered: "No",
                calculationType: "Rhumbline",
                bearingOriginToDestinationWaypoint: 3.1,
                bearingPositionToDestinationWaypoint: 1.23,
                destinationWaypointNumber: 6,
                destinationLatitude: 32.0631296,
                destinationLongitude: -75.487264,
                waypointClosingVelocity: 4,
              },
            },
          ],
        },
      ],
    },
    {
      pgn: 129284,
      title: "Navigation Data Great Circle (129284)",
      optionKey: "NAVIGATION_DATA_GREAT_CIRCLE",
      keys: [
        "navigation.course.calcValues.distance",
        "navigation.course.calcValues.bearingTrue",
        "navigation.course.calcValues.bearingTrackTrue",
        "navigation.course.nextPoint",
        "navigation.course.calcValues.velocityMadeGood",
        "notifications.navigation.arrivalCircleEntered",
        "notifications.navigation.perpendicularPassed",
        "navigation.course.activeRoute",
      ],
      timeouts: [10000, 10000, 10000, 10000, 10000, undefined, undefined, 10000],
      callback: (distToDest, bearingToDest, bearingOriginToDest, dest, WCV, ace, pp, rte) => {
        var dateObj = new Date();
        var secondsToGo = Math.trunc(distToDest / WCV);
        var etaDate = Math.trunc((dateObj.getTime() / 1000 + secondsToGo) / 86400);
        var etaTime =
          (dateObj.getUTCHours() * (60 * 60) +
            dateObj.getUTCMinutes() * 60 +
            dateObj.getUTCSeconds() +
            secondsToGo) %
          86400;
        const wpid = rte && typeof rte?.pointIndex === "number" ? rte.pointIndex + 1 : 0;
        return [
          {
            prio: 2,
            pgn: 129284,
            dst: 255,
            fields: {
              sid: 0x88,
              distanceToWaypoint: distToDest,
              courseBearingReference: "True",
              perpendicularCrossed: pp != null ? "Yes" : "No",
              arrivalCircleEntered: ace != null ? "Yes" : "No",
              calculationType: "Great Circle",
              etaTime: WCV > 0 ? etaTime : undefined,
              etaDate: WCV > 0 ? etaDate : undefined,
              bearingOriginToDestinationWaypoint: bearingOriginToDest,
              bearingPositionToDestinationWaypoint: bearingToDest,
              originWaypointNumber: undefined,
              destinationWaypointNumber: parseInt(wpid, 10),
              destinationLatitude: dest?.position?.latitude,
              destinationLongitude: dest?.position?.longitude,
              waypointClosingVelocity: WCV,
            },
          },
        ];
      },
      tests: [
        {
          input: [
            12,
            1.23,
            3.1,
            { position: { longitude: -75.487264, latitude: 32.0631296 } },
            4.0,
            null,
            1,
            { pointIndex: 5 },
          ],
          expected: [
            {
              __preprocess__: (testResult) => {
                //these change every time
                delete testResult.fields.etaDate;
                delete testResult.fields.etaTime;
              },
              prio: 2,
              pgn: 129284,
              dst: 255,
              fields: {
                sid: 136,
                distanceToWaypoint: 12,
                courseBearingReference: "True",
                perpendicularCrossed: "Yes",
                arrivalCircleEntered: "No",
                calculationType: "Great Circle",
                bearingOriginToDestinationWaypoint: 3.1,
                bearingPositionToDestinationWaypoint: 1.23,
                destinationWaypointNumber: 6,
                destinationLatitude: 32.0631296,
                destinationLongitude: -75.487264,
                waypointClosingVelocity: 4,
              },
            },
          ],
        },
      ],
    },
  ];
};
