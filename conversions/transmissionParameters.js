module.exports = (_app, _plugin) => {
  return {
    pgn: 127493,
    title: "Transmission Parameters (127493)",
    optionKey: "TRANSMISSION_PARAMETERS",
    keys: [
      "propulsion.main.transmission.gearRatio",
      "propulsion.main.transmission.oilPressure",
      "propulsion.main.transmission.oilTemperature",
      "propulsion.main.transmission.discreteStatus1",
      "propulsion.main.transmission.discreteStatus2",
    ],
    timeouts: [10000, 10000, 10000, 10000, 10000], // 10 seconds
    callback: (gearRatio, oilPressure, oilTemperature, discreteStatus1, discreteStatus2) => {
      if (gearRatio == null && oilPressure == null && oilTemperature == null) {
        return null;
      }

      return [
        {
          prio: 2,
          pgn: 127493,
          dst: 255,
          fields: {
            engineInstance: 0,
            transmissionGear:
              gearRatio != null
                ? gearRatio > 1
                  ? "Forward"
                  : gearRatio < 0
                    ? "Reverse"
                    : "Neutral"
                : "Neutral",
            oilPressure: oilPressure,
            oilTemperature: oilTemperature,
            discreteStatus1: discreteStatus1 || 0,
            discreteStatus2: discreteStatus2 || 0,
          },
        },
      ];
    },
    tests: [
      {
        input: [2.5, 345000, 353.15, 0, 0], // Forward gear, oil pressure in Pa, temp in K
        expected: [
          {
            prio: 2,
            pgn: 127493,
            dst: 255,
            fields: {
              engineInstance: 0,
              transmissionGear: "Forward",
              oilPressure: 345000,
              oilTemperature: 353.15,
              discreteStatus1: 0,
              discreteStatus2: 0,
            },
          },
        ],
      },
      {
        input: [-1.5, 320000, 343.15, 1, 0], // Reverse gear
        expected: [
          {
            prio: 2,
            pgn: 127493,
            dst: 255,
            fields: {
              engineInstance: 0,
              transmissionGear: "Reverse",
              oilPressure: 320000,
              oilTemperature: 343.15,
              discreteStatus1: 1,
              discreteStatus2: 0,
            },
          },
        ],
      },
    ],
  };
};
