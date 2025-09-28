module.exports = (_app, _plugin) => {
  return [
    // ISO Acknowledgment (PGN 59392)
    {
      pgn: 59392,
      title: "ISO Acknowledgment (59392)",
      optionKey: "ISO_ACKNOWLEDGMENT",
      keys: ["communication.pathToAcknowledge"],
      timeouts: [30000],
      callback: (pathToAcknowledge) => {
        if (pathToAcknowledge == null) {
          return null;
        }

        return [
          {
            prio: 2,
            pgn: 59392,
            dst: 255,
            fields: {
              controlByte: 0, // Positive acknowledgment
              groupFunction: 255, // Not group function specific
              pgn: pathToAcknowledge.pgn || 0,
              reserved: 16777215,
            },
          },
        ];
      },
      tests: [
        {
          input: [{ pgn: 126992 }],
          expected: [
            {
              prio: 2,
              pgn: 59392,
              dst: 255,
              fields: {
                pgn: 126992,
                reserved: 16777215,
              },
            },
          ],
        },
      ],
    },

    // ISO Request (PGN 59904)
    {
      pgn: 59904,
      title: "ISO Request (59904)",
      optionKey: "ISO_REQUEST",
      keys: ["communication.requestedPGN"],
      timeouts: [30000],
      callback: (requestedPGN) => {
        if (requestedPGN == null) {
          return null;
        }

        return [
          {
            prio: 2,
            pgn: 59904,
            dst: 255,
            fields: {
              pgn: requestedPGN,
            },
          },
        ];
      },
      tests: [
        {
          input: [126992],
          expected: [
            {
              prio: 2,
              pgn: 59904,
              dst: 255,
              fields: {
                pgn: 126992,
              },
            },
          ],
        },
      ],
    },

    // ISO Address Claim (PGN 60928)
    {
      pgn: 60928,
      title: "ISO Address Claim (60928)",
      optionKey: "ISO_ADDRESS_CLAIM",
      keys: [
        "design.manufacturer.industryCode",
        "design.manufacturer.deviceInstance",
        "design.manufacturer.deviceFunction",
        "design.manufacturer.deviceClass",
        "design.manufacturer.systemInstance",
      ],
      timeouts: [300000, 300000, 300000, 300000, 300000], // 5 minutes
      callback: (industryCode, deviceInstance, deviceFunction, deviceClass, systemInstance) => {
        // Only send address claim if we have basic device info
        if (industryCode == null && deviceFunction == null) {
          return null;
        }

        return [
          {
            prio: 6,
            pgn: 60928,
            dst: 255,
            fields: {
              uniqueNumber: deviceInstance || 0,
              manufacturerCode: industryCode || 1851, // Default to Signal K
              deviceInstanceLower: (deviceInstance || 0) & 0x07,
              deviceInstanceUpper: ((deviceInstance || 0) >> 3) & 0x1f,
              deviceFunction: deviceFunction || 130, // Navigation display/chartplotter
              reserved: 0,
              deviceClass: deviceClass || 25, // Inter/Intranetwork Device
              systemInstance: systemInstance || 0,
              industryCode: 4, // Marine Industry
              arbitraryAddressCapable: 1,
            },
          },
        ];
      },
      tests: [
        {
          input: [1851, 1, 130, 25, 0],
          expected: [
            {
              prio: 2,
              pgn: 60928,
              dst: 255,
              fields: {
                arbitraryAddressCapable: "Yes",
                deviceClass: "Internetwork device",
                deviceFunction: 130,
                deviceInstanceLower: 1,
                deviceInstanceUpper: 0,
                manufacturerCode: "Raymarine",
                spare: 1,
                systemInstance: 0,
                uniqueNumber: 1,
              },
            },
          ],
        },
      ],
    },
  ];
};
