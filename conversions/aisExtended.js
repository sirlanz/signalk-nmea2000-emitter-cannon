const _ = require("lodash");

module.exports = (_app, _plugin) => {
  return {
    title: "Extended AIS Messages (129039, 129040, 129798, 129802)",
    optionKey: "AIS_EXTENDED",
    context: "vessels.self",

    conversions: () => {
      return [
        // AIS Class B Position Report (PGN 129039)
        {
          keys: [
            "sensors.ais.class",
            "navigation.position",
            "navigation.courseOverGroundTrue",
            "navigation.speedOverGround",
            "navigation.headingTrue",
            "sensors.ais.fromCenter",
            "sensors.ais.fromBow",
            "design.length",
            "design.beam",
          ],
          timeouts: [10000, 10000, 10000, 10000, 10000, 10000, 10000, 10000, 10000], // 10 seconds
          callback: (
            aisClass,
            position,
            cog,
            sog,
            heading,
            fromCenter,
            _fromBow,
            _length,
            beam
          ) => {
            if (aisClass !== "B" || !position || !position.latitude || !position.longitude) {
              return null;
            }

            // Calculate position reference points
            let _fromStarboard = null;
            if (beam != null && fromCenter != null) {
              _fromStarboard = beam / 2 + fromCenter;
            }

            return [
              {
                prio: 2,
                pgn: 129039,
                dst: 255,
                fields: {
                  messageId: "Standard Class B position report",
                  repeatIndicator: "Initial",
                  userId: 123456789, // Should be derived from MMSI
                  longitude: position.longitude,
                  latitude: position.latitude,
                  positionAccuracy: "Low",
                  raim: "not in use",
                  timeStamp: "0",
                  cog: cog,
                  sog: sog,
                  aisTransceiverInformation: "Channel A VDL reception",
                  heading: heading,
                  regionalApplication: 0,
                  unitType: "SOTDMA",
                  integratedDisplay: "No",
                  dsc: "Yes",
                  band: "Top 525 kHz of marine band",
                  canHandleMsg22: "Yes",
                  aisMode: "Assigned",
                  aisCommunicationState: "SOTDMA",
                },
              },
            ];
          },
          tests: [
            {
              input: [
                "B",
                { latitude: 39.1296, longitude: -76.3947 },
                1.501,
                0.05,
                5.6199,
                0,
                9,
                30,
                7,
              ],
              expected: [
                {
                  prio: 2,
                  pgn: 129039,
                  dst: 255,
                  fields: {
                    aisCommunicationState: "SOTDMA",
                    aisMode: "Assigned",
                    aisTransceiverInformation: "Channel A VDL reception",
                    band: "Top 525 kHz of marine band",
                    canHandleMsg22: "Yes",
                    cog: 1.501,
                    dsc: "Yes",
                    heading: 5.6199,
                    integratedDisplay: "No",
                    latitude: 39.1296,
                    longitude: -76.3947,
                    messageId: "Standard Class B position report",
                    positionAccuracy: "Low",
                    raim: "not in use",
                    regionalApplication: 0,
                    repeatIndicator: "Initial",
                    sog: 0.05,
                    timeStamp: "0",
                    unitType: "SOTDMA",
                    userId: 123456789,
                  },
                },
              ],
            },
          ],
        },

        // AIS Class B Extended Position Report (PGN 129040)
        {
          keys: [
            "sensors.ais.class",
            "navigation.position",
            "navigation.courseOverGroundTrue",
            "navigation.speedOverGround",
            "navigation.headingTrue",
            "design.aisShipType",
            "sensors.ais.fromCenter",
            "sensors.ais.fromBow",
            "design.length",
            "design.beam",
          ],
          timeouts: [10000, 10000, 10000, 10000, 10000, 10000, 10000, 10000, 10000, 10000],
          callback: (
            aisClass,
            position,
            cog,
            sog,
            heading,
            shipType,
            fromCenter,
            fromBow,
            length,
            beam
          ) => {
            if (aisClass !== "B" || !position || !position.latitude || !position.longitude) {
              return null;
            }

            // Calculate position reference points
            let fromStarboard = null;
            if (beam != null && fromCenter != null) {
              fromStarboard = beam / 2 + fromCenter;
            }

            return [
              {
                prio: 2,
                pgn: 129040,
                dst: 255,
                fields: {
                  messageId: "Extended Class B position report",
                  repeatIndicator: "Initial",
                  userId: 123456789, // Should be derived from MMSI
                  longitude: position.longitude,
                  latitude: position.latitude,
                  positionAccuracy: "Low",
                  raim: "not in use",
                  timeStamp: "0",
                  cog: cog,
                  sog: sog,
                  aisTransceiverInformation: "Channel A VDL reception",
                  heading: heading,
                  typeOfShip: shipType?.name || "Sailing",
                  length: length,
                  beam: beam,
                  positionReferenceFromStarboard: fromStarboard,
                  positionReferenceFromBow: fromBow,
                  name: "UNKNOWN", // Should be derived from vessel data
                  dte: "Available",
                  aisMode: "Assigned",
                },
              },
            ];
          },
          tests: [
            {
              input: [
                "B",
                { latitude: 39.1296, longitude: -76.3947 },
                1.501,
                0.05,
                5.6199,
                { id: 36, name: "Sailing" },
                0,
                9,
                30,
                7,
              ],
              expected: [
                {
                  prio: 2,
                  pgn: 129040,
                  dst: 255,
                  fields: {
                    aisMode: "Assigned",
                    aisTransceiverInformation: "Channel A VDL reception",
                    beam: 7,
                    cog: 1.501,
                    dte: "Available",
                    latitude: 39.1296,
                    length: 30,
                    longitude: -76.3947,
                    messageId: "Extended Class B position report",
                    name: "UNKNOWN",
                    positionAccuracy: "Low",
                    positionReferenceFromBow: 9,
                    positionReferenceFromStarboard: 3.5,
                    raim: "not in use",
                    repeatIndicator: "Initial",
                    sog: 0.05,
                    timeStamp: "0",
                    typeOfShip: "Sailing",
                    userId: 123456789,
                  },
                },
              ],
            },
          ],
        },

        // AIS SAR Aircraft Position Report (PGN 129798)
        {
          keys: [
            "sensors.ais.class",
            "navigation.position",
            "navigation.courseOverGroundTrue",
            "navigation.speedOverGround",
            "navigation.altitude",
          ],
          timeouts: [5000, 5000, 5000, 5000, 5000], // 5 seconds for aircraft
          callback: (aisClass, position, cog, sog, altitude) => {
            if (aisClass !== "SAR" || !position || !position.latitude || !position.longitude) {
              return null;
            }

            return [
              {
                prio: 2,
                pgn: 129798,
                dst: 255,
                fields: {
                  messageId: "Standard SAR aircraft position report",
                  repeatIndicator: "Initial",
                  userId: 111000001, // SAR aircraft MMSI format
                  longitude: position.longitude,
                  latitude: position.latitude,
                  positionAccuracy: "High",
                  raim: "in use",
                  timeStamp: "0",
                  cog: cog,
                  sog: sog,
                  aisTransceiverInformation: "Channel A VDL reception",
                  altitude: altitude || 0,
                  dte: "Available",
                },
              },
            ];
          },
          tests: [
            {
              input: [
                "SAR",
                { latitude: 40.7128, longitude: -74.006 },
                0.7854, // 45 degrees
                25.7, // 50 knots
                500, // 500 meters altitude
              ],
              expected: [
                {
                  prio: 2,
                  pgn: 129798,
                  dst: 255,
                  fields: {
                    aisTransceiverInformation: "Channel A VDL reception",
                    altitude: 500,
                    cog: 0.7854,
                    dte: "Available",
                    latitude: 40.7128,
                    longitude: -74.006,
                    messageId: "Standard SAR aircraft position report",
                    positionAccuracy: "High",
                    raim: "in use",
                    repeatIndicator: "Initial",
                    sog: 25.7,
                    timeStamp: "0",
                    userId: 111000001,
                  },
                },
              ],
            },
          ],
        },

        // AIS Safety Related Broadcast Message (PGN 129802)
        {
          keys: ["communication.ais.safetyMessage", "communication.ais.safetyMessageSeqId"],
          timeouts: [300000, 300000], // 5 minutes
          callback: (safetyMessage, seqId) => {
            if (!safetyMessage) {
              return null;
            }

            return [
              {
                prio: 2,
                pgn: 129802,
                dst: 255,
                fields: {
                  messageId: "Satety related broadcast message",
                  repeatIndicator: "Initial",
                  userId: 123456789, // Should be derived from MMSI
                  sequenceId: seqId || 0,
                  destinationId: 0, // Broadcast
                  retransmitFlag: "No retransmission",
                  safetyText: safetyMessage.substring(0, 156), // Max 156 characters
                  reserved: 1,
                },
              },
            ];
          },
          tests: [
            {
              input: ["STORM WARNING: SEVERE WEATHER APPROACHING FROM WEST", 1],
              expected: [
                {
                  prio: 2,
                  pgn: 129802,
                  dst: 255,
                  fields: {
                    messageId: "Satety related broadcast message",
                    repeatIndicator: "Initial",
                    reserved: 1,
                  },
                },
              ],
            },
          ],
        },
      ];
    },
  };
};
