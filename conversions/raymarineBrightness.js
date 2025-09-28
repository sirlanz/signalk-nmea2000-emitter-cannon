const _ = require("lodash");

module.exports = (_app, _plugin) => {
  return {
    title: "Raymarine (Seatalk) Display Brightness (126720)",
    optionKey: "RAYMARINE_BRIGHTNESS",
    context: "vessels.self",
    properties: {
      groups: {
        title: "Group Mapping",
        type: "array",
        items: {
          type: "object",
          properties: {
            signalkId: {
              title: "Signal K Group id",
              type: "string",
            },
            instanceId: {
              title: "NMEA2000 Group Instance Id",
              type: "string",
            },
          },
        },
      },
    },

    testOptions: {
      RAYMARINE_BRIGHTNESS: {
        groups: [
          {
            signalkId: "helm2",
            instanceId: "Helm 2",
          },
        ],
      },
    },

    conversions: (options) => {
      if (!_.get(options, "RAYMARINE_BRIGHTNESS.groups")) {
        return null;
      }
      return options.RAYMARINE_BRIGHTNESS.groups.map((group) => {
        return {
          keys: [`electrical.displays.raymarine.${group.signalkId}.brightness`],
          callback: (brightness) => {
            return [
              {
                pgn: 126720,
                dst: 255,
                "Manufacturer Code": "Raymarine",
                "Industry Code": "Marine Industry",
                "Proprietary ID": "0x0c8c",
                Group: group.instanceId || "Helm 2",
                "Unknown 1": 1,
                Command: "Brightness",
                Brightness: (brightness || 0) * 100,
                "Unknown 2": 0,
              },
            ];
          },
          tests: [
            {
              input: [0.85],
              expected: [
                {
                  prio: 2,
                  pgn: 126720,
                  dst: 255,
                  fields: {
                    manufacturerCode: "Raymarine",
                    industryCode: "Marine Industry",
                    proprietaryId: "0x0c8c",
                    group: "Helm 2",
                    unknown1: 1,
                    command: "Brightness",
                    brightness: 85,
                    unknown2: 0,
                  },
                },
              ],
            },
          ],
        };
      });
    },
  };
};
