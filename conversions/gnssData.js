module.exports = (_app, _plugin) => {
  return [
    // GNSS DOPs (PGN 129539)
    {
      pgn: 129539,
      title: "GNSS DOPs (129539)",
      optionKey: "GNSS_DOPS",
      keys: [
        "navigation.gnss.horizontalDilution",
        "navigation.gnss.verticalDilution",
        "navigation.gnss.timeDilution",
        "navigation.gnss.mode",
      ],
      timeouts: [10000, 10000, 10000, 10000], // 10 seconds
      callback: (hdop, vdop, tdop, mode) => {
        // Only send if we have at least one DOP value
        if (hdop == null && vdop == null && tdop == null) {
          return null;
        }

        return [
          {
            prio: 2,
            pgn: 129539,
            dst: 255,
            fields: {
              sid: 0,
              desiredMode: mode === "3D" ? "3D" : mode === "2D" ? "2D" : "Auto",
              actualMode: mode === "3D" ? "3D" : mode === "2D" ? "2D" : "No GNSS",
              hdop: hdop,
              vdop: vdop,
              tdop: tdop,
            },
          },
        ];
      },
      tests: [
        {
          input: [1.2, 1.8, 0.9, "3D"],
          expected: [
            {
              prio: 2,
              pgn: 129539,
              dst: 255,
              fields: {
                sid: 0,
                desiredMode: "3D",
                actualMode: "3D",
                hdop: 1.2,
                vdop: 1.8,
                tdop: 0.9,
              },
            },
          ],
        },
      ],
    },

    // GNSS Satellites in View (PGN 129540)
    {
      pgn: 129540,
      title: "GNSS Satellites in View (129540)",
      optionKey: "GNSS_SATELLITES",
      keys: [
        "navigation.gnss.satellitesInView.count",
        "navigation.gnss.satellitesInView.satellites",
      ],
      timeouts: [10000, 10000], // 10 seconds
      callback: (count, satellites) => {
        if (count == null || satellites == null || !Array.isArray(satellites)) {
          return null;
        }

        const satelliteData = satellites.slice(0, 12).map((sat, index) => {
          return {
            PRN: sat.id || index + 1,
            Elevation: sat.elevation || 0,
            Azimuth: sat.azimuth || 0,
            SNR: sat.SNR || sat.signalToNoiseRatio || 0,
            "Range residuals": 0, // Not typically available in Signal K
            Status: sat.used ? "Used" : "Not tracked",
          };
        });

        return [
          {
            prio: 2,
            pgn: 129540,
            dst: 255,
            fields: {
              sid: 0,
              mode: "Auto",
              satsInView: Math.min(count, 12),
              list: satelliteData,
            },
          },
        ];
      },
      tests: [
        {
          input: [
            8,
            [
              { id: 1, elevation: 45, azimuth: 90, SNR: 40, used: true },
              { id: 2, elevation: 30, azimuth: 180, SNR: 35, used: true },
              { id: 3, elevation: 60, azimuth: 270, SNR: 42, used: false },
            ],
          ],
          expected: [
            {
              prio: 2,
              pgn: 129540,
              dst: 255,
              fields: {
                sid: 0,
                mode: "Auto",
                satsInView: 8,
                list: [
                  {
                    prn: 1,
                    elevation: 45,
                    azimuth: 90,
                    snr: 40,
                    rangeResiduals: 0,
                    status: "Used",
                  },
                  {
                    prn: 2,
                    elevation: 30,
                    azimuth: 180,
                    snr: 35,
                    rangeResiduals: 0,
                    status: "Used",
                  },
                  {
                    prn: 3,
                    elevation: 60,
                    azimuth: 270,
                    snr: 42,
                    rangeResiduals: 0,
                    status: "Not tracked",
                  },
                ],
              },
            },
          ],
        },
      ],
    },
  ];
};
