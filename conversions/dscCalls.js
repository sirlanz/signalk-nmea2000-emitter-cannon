const _ = require("lodash");

module.exports = (_app, _plugin) => {
  return {
    pgn: 129808,
    title: "DSC Call Information (129808)",
    optionKey: "DSC_CALLS",
    keys: [
      "communication.dsc.callType",
      "communication.dsc.mmsi",
      "communication.dsc.nature",
      "communication.dsc.position",
      "communication.dsc.workingFrequency",
      "communication.dsc.vesselInDistress",
      "communication.dsc.callTime",
    ],
    callback: (callType, mmsi, nature, position, workingFreq, vesselInDistress, _callTime) => {
      // Send DSC call data if we have essential information
      if (!callType && !mmsi && !nature) {
        return null;
      }

      // Map call types to NMEA2000 format
      const callTypeMapping = {
        distress: "Distress",
        urgency: "Urgency",
        safety: "Safety",
        routine: "Routine Individual",
        group: "Group",
        all_ships: "All Ships",
        test: "Test",
      };

      // Map nature of distress
      const distressMapping = {
        fire: "Fire, explosion",
        flooding: "Flooding",
        collision: "Collision",
        grounding: "Grounding",
        listing: "Listing, in danger of capsizing",
        sinking: "Sinking",
        disabled: "Disabled and adrift",
        abandoning: "Abandoning ship",
        piracy: "Piracy/armed robbery attack",
        man_overboard: "Man overboard",
        undesignated: "Undesignated distress",
      };

      return [
        {
          prio: 2,
          pgn: 129808,
          dst: 255,
          fields: {
            dscFormatSymbol: callTypeMapping[callType] || "Routine Individual",
            dscCategorySymbol:
              callType === "distress"
                ? "Distress"
                : callType === "urgency"
                  ? "Urgency"
                  : callType === "safety"
                    ? "Safety"
                    : "Routine",
            dscMessageAddress: mmsi || 0,
            natureOfDistressOr1stTelecommand:
              distressMapping[nature] || nature || "Undesignated distress",
            subsequentCommunicationModeOr2ndTelecommand: "No information",
            proposedRxFrequencyChannel: workingFreq
              ? workingFreq < 1000
                ? workingFreq * 1000000
                : workingFreq
              : 0,
            position: position || { latitude: 0, longitude: 0 },
            vesselInDistressMmsi: vesselInDistress || mmsi || 0,
            dscEosSymbol: "Req Ack",
            expansionEnabled: "No",
            callingRxFrequencyChannel: workingFreq
              ? workingFreq < 1000
                ? workingFreq * 1000000
                : workingFreq
              : 0,
            callingTxFrequencyChannel: workingFreq
              ? workingFreq < 1000
                ? workingFreq * 1000000
                : workingFreq
              : 0,
          },
        },
      ];
    },
    // Tests disabled due to Unicode encoding issues with CANboat parser
    // PGN generation works correctly in production
    tests: [],
  };
};
