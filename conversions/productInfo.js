const _ = require("lodash");

module.exports = (_app, _plugin) => {
  return {
    pgn: 126996,
    title: "Product Information (126996)",
    optionKey: "PRODUCT_INFO",
    keys: [
      "design.manufacturer.name",
      "design.modelNumber",
      "design.softwareVersion",
      "design.hardwareVersion",
      "design.serialNumber",
      "design.certificationLevel",
    ],
    callback: (
      manufacturerName,
      modelNumber,
      softwareVersion,
      hardwareVersion,
      serialNumber,
      certificationLevel
    ) => {
      // Send product info if we have at least manufacturer or model
      if (manufacturerName == null && modelNumber == null) {
        return null;
      }

      return [
        {
          prio: 2,
          pgn: 126996,
          dst: 255,
          fields: {
            nmea2000Version: 2100, // NMEA 2000 version 2.1
            productCode: 12345, // Generic product code, could be made configurable
            modelId: modelNumber || "SignalK-NMEA2000",
            softwareVersionCode: softwareVersion || "1.0.0",
            modelVersion: hardwareVersion || "1.0",
            modelSerialCode: serialNumber || "SK00000001",
            certificationLevel: certificationLevel === "certified" ? "Level B" : "Level A",
            loadEquivalency: 1, // Standard load equivalency
          },
        },
      ];
    },
    tests: [
      {
        input: ["Signal K Systems", "SK-N2K-001", "2.1.0", "1.2", "SK12345678", "certified"],
        expected: [
          {
            prio: 2,
            pgn: 126996,
            dst: 255,
            fields: {
              nmea2000Version: 2100,
              productCode: 12345,
              modelId: "SK-N2K-001",
              softwareVersionCode: "2.1.0",
              modelVersion: "1.2",
              modelSerialCode: "SK12345678",
              certificationLevel: "Level B",
              loadEquivalency: 1,
            },
          },
        ],
      },
      {
        input: ["Signal K", null, null, null, null, null], // Minimal data
        expected: [
          {
            prio: 2,
            pgn: 126996,
            dst: 255,
            fields: {
              nmea2000Version: 2100,
              productCode: 12345,
              modelId: "SignalK-NMEA2000",
              softwareVersionCode: "1.0.0",
              modelVersion: "1.0",
              modelSerialCode: "SK00000001",
              certificationLevel: "Level A",
              loadEquivalency: 1,
            },
          },
        ],
      },
    ],
  };
};
