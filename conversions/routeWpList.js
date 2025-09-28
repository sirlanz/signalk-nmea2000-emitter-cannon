const _ = require("lodash");

module.exports = (_app, _plugin) => {
  return {
    pgn: 130074,
    title: "Route WP List (130074)",
    optionKey: "ROUTE_WP_LIST",
    keys: [
      "navigation.course.activeRoute.waypoints",
      "navigation.course.activeRoute.name",
      "navigation.course.activeRoute.reverse",
    ],
    callback: (waypoints, routeName, reverse) => {
      if (!waypoints || !Array.isArray(waypoints) || waypoints.length === 0) {
        return null;
      }

      // Prepare waypoint list data (limit to reasonable number for single message)
      const wpList = waypoints.slice(0, 16).map((wp, index) => {
        return {
          "WP ID": wp.id || index + 1,
          "WP Name": wp.name || `WP${index + 1}`,
          "WP Latitude": wp.position?.latitude || 0,
          "WP Longitude": wp.position?.longitude || 0,
          "WP Bearing from Origin": wp.bearingFromOrigin || 0,
          "WP Distance from Origin": wp.distanceFromOrigin || 0,
          "WP Description": wp.description || "",
        };
      });

      return [
        {
          pgn: 130074,
          "Start WP": 0, // Starting waypoint index
          nItems: Math.min(waypoints.length, 16),
          "Database ID": 1,
          "Route ID": 1,
          "Navigation direction in route": reverse ? "Reverse" : "Forward",
          "Route Name": routeName || "ACTIVE_ROUTE",
          Reserved: 0,
          "WP list": wpList,
        },
      ];
    },
    tests: [
      {
        input: [
          [
            {
              id: 1,
              name: "START",
              position: { latitude: 39.0458, longitude: -76.6413 },
              bearingFromOrigin: 0,
              distanceFromOrigin: 0,
              description: "Starting point",
            },
            {
              id: 2,
              name: "TURN1",
              position: { latitude: 39.2904, longitude: -76.6122 },
              bearingFromOrigin: 0.785,
              distanceFromOrigin: 27130,
              description: "First turn",
            },
            {
              id: 3,
              name: "DEST",
              position: { latitude: 39.3504, longitude: -76.5422 },
              bearingFromOrigin: 1.047,
              distanceFromOrigin: 35420,
              description: "Destination",
            },
          ],
          "Baltimore Harbor Route",
          false,
        ],
        expected: [
          {
            prio: 2,
            pgn: 130074,
            dst: 255,
            fields: {
              databaseId: 1,
              list: [],
              nitems: 3,
            },
          },
        ],
      },
    ],
  };
};
