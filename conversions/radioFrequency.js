const _ = require("lodash");

module.exports = (_app, _plugin) => {
  return {
    pgn: 129799,
    title: "Radio Frequency/Mode/Power (129799)",
    optionKey: "RADIO_FREQUENCY",
    keys: [
      "communication.vhf.rxFrequency",
      "communication.vhf.txFrequency",
      "communication.vhf.mode",
      "communication.vhf.power",
      "communication.vhf.squelch",
    ],
    callback: (rxFreq, txFreq, _mode, power, squelch) => {
      // Send radio data if we have at least frequency info
      if (rxFreq == null && txFreq == null) {
        return null;
      }

      // Convert frequency to Hz if needed (assume input might be in MHz)
      const normalizeFreq = (freq) => {
        if (freq == null) return null;
        // If frequency is less than 1000, assume it's in MHz and convert to Hz
        return freq < 1000 ? freq * 1000000 : freq;
      };

      const rxFreqHz = normalizeFreq(rxFreq);
      const txFreqHz = normalizeFreq(txFreq);

      return [
        {
          prio: 2,
          pgn: 129799,
          dst: 255,
          fields: {
            rxFrequency: rxFreqHz,
            txFrequency: txFreqHz,
            radioSystem: "VHF",
            txPower: power || 25, // Default 25W
            antennaHeight: 10, // Default 10m
            _2gSpectrum: "No",
            positioningSystem: "GPS",
            squelchLevel: squelch || 0,
          },
        },
      ];
    },
    tests: [
      {
        input: [156.8, 156.8, "simplex", 25, 3], // Channel 16 VHF
        expected: [
          {
            prio: 2,
            pgn: 129799,
            dst: 255,
            fields: {
              rxFrequency: 156800000,
              txFrequency: 156800000,
              radioSystem: "VHF",
              txPower: 25,
              antennaHeight: 10,
              _2gSpectrum: "No",
              positioningSystem: "GPS",
              squelchLevel: 3,
            },
          },
        ],
      },
      {
        input: [156650000, 161250000, "duplex", 5, 0], // Already in Hz, duplex channel
        expected: [
          {
            prio: 2,
            pgn: 129799,
            dst: 255,
            fields: {
              rxFrequency: 156650000,
              txFrequency: 161250000,
              radioSystem: "VHF",
              txPower: 5,
              antennaHeight: 10,
              _2gSpectrum: "No",
              positioningSystem: "GPS",
              squelchLevel: 0,
            },
          },
        ],
      },
    ],
  };
};
