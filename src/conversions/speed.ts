import type { ConversionModule, N2KMessage } from "../types/index.js";

/**
 * Speed conversion module - converts Signal K speed through water to NMEA 2000 PGN 128259
 */
export default function createSpeedConversion(): ConversionModule {
  return {
    title: "Speed (128259)",
    optionKey: "SPEED",
    keys: ["navigation.speedThroughWater"],
    callback: (speed: unknown): N2KMessage[] => {
      try {
        // Validate input
        if (typeof speed !== "number") {
          return [];
        }

        return [
          {
            prio: 2,
            pgn: 128259,
            dst: 255,
            fields: {
              sid: 87,
              speedWaterReferenced: speed,
            },
          },
        ];
      } catch (err) {
        console.error("Error in speed conversion:", err);
        return [];
      }
    },

    tests: [
      {
        input: [3],
        expected: [
          {
            prio: 2,
            pgn: 128259,
            dst: 255,
            fields: {
              sid: 87,
              speedWaterReferenced: 3,
            },
          },
        ],
      },
      {
        // Test with decimal speed
        input: [2.5],
        expected: [
          {
            prio: 2,
            pgn: 128259,
            dst: 255,
            fields: {
              sid: 87,
              speedWaterReferenced: 2.5,
            },
          },
        ],
      },
      {
        // Test with zero speed
        input: [0],
        expected: [
          {
            prio: 2,
            pgn: 128259,
            dst: 255,
            fields: {
              sid: 87,
              speedWaterReferenced: 0,
            },
          },
        ],
      },
    ],
  };
}
