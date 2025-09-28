const _ = require("lodash");

module.exports = (_app, _plugin) => {
  return {
    pgn: 130577,
    title: "Direction Data (130577)",
    optionKey: "DIRECTION_DATA",
    keys: [
      "navigation.courseOverGroundTrue",
      "navigation.courseOverGroundMagnetic",
      "navigation.headingTrue",
      "navigation.headingMagnetic",
      "navigation.courseRhumbline.nextPoint.bearingTrue",
      "navigation.courseRhumbline.nextPoint.bearingMagnetic",
      "navigation.courseGreatCircle.nextPoint.bearingTrue",
      "navigation.courseGreatCircle.nextPoint.bearingMagnetic",
    ],
    callback: (
      cogTrue,
      cogMagnetic,
      headingTrue,
      headingMagnetic,
      _rhumbBearingTrue,
      _rhumbBearingMagnetic,
      _gcBearingTrue,
      _gcBearingMagnetic
    ) => {
      // Send direction data if we have at least one direction value
      if (
        cogTrue == null &&
        cogMagnetic == null &&
        headingTrue == null &&
        headingMagnetic == null
      ) {
        return null;
      }

      return [
        {
          prio: 2,
          pgn: 130577,
          dst: 255,
          fields: {
            dataMode: "Autonomous", // Could be made configurable
            cogReference:
              cogTrue != null ? "True" : cogMagnetic != null ? "Magnetic" : "Unavailable",
            sidForCog: 0,
            cog: cogTrue || cogMagnetic,
            sogReference: "Unavailable", // Would need SOG data source info
            sidForSog: 0,
            sog: null, // This PGN focuses on direction, not speed
            headingReference:
              headingTrue != null ? "True" : headingMagnetic != null ? "Magnetic" : "Unavailable",
            sidForHeading: 0,
            heading: headingTrue || headingMagnetic,
            speedThroughWaterReference: "Unavailable",
            sidForStw: 0,
            speedThroughWater: null,
            set: null, // Current set - not typically available
            drift: null, // Current drift - not typically available
          },
        },
      ];
    },
    tests: [
      {
        input: [1.571, null, 1.396, null, 0.785, null, null, null], // 90° COG true, 80° heading true, 45° rhumb bearing
        expected: [
          {
            prio: 2,
            pgn: 130577,
            dst: 255,
            fields: {
              dataMode: "Autonomous",
              cogReference: "True",
              sidForCog: 0,
              cog: 1.571,
              sogReference: "Unavailable",
              sidForSog: 0,
              sog: null,
              headingReference: "True",
              sidForHeading: 0,
              heading: 1.396,
              speedThroughWaterReference: "Unavailable",
              sidForStw: 0,
              speedThroughWater: null,
              set: null,
              drift: null,
            },
          },
        ],
      },
      {
        input: [null, 1.047, null, 0.698, null, null, null, null], // 60° COG magnetic, 40° heading magnetic
        expected: [
          {
            prio: 2,
            pgn: 130577,
            dst: 255,
            fields: {
              dataMode: "Autonomous",
              cogReference: "Magnetic",
              sidForCog: 0,
              cog: 1.047,
              sogReference: "Unavailable",
              sidForSog: 0,
              sog: null,
              headingReference: "Magnetic",
              sidForHeading: 0,
              heading: 0.698,
              speedThroughWaterReference: "Unavailable",
              sidForStw: 0,
              speedThroughWater: null,
              set: null,
              drift: null,
            },
          },
        ],
      },
    ],
  };
};
