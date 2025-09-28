const _ = require("lodash");

let pgns = [];

module.exports = (_app, _plugin) => {
  return {
    title: "Raymarine (Seatalk) Alarms (65288)",
    optionKey: "RAYMARINE_ALARMS",
    keys: ["notifications.navigation.anchor", "notifications.mob"],
    context: "vessels.self",
    sourceType: "subscription",
    callback: (delta) => {
      const update = delta.updates[0].values[0];
      const path = update.path;
      const value = update.value;
      const _type = value.state;

      //dont create a loop by sending out notifications we recieved from NMEA
      if (path.includes("notifications.nmea")) {
        return pgns;
      }

      // remove the pgns and reprocess them for changes
      pgns = pgns.filter((obj) => obj.path !== path);

      let state;
      const method = value.method || [];
      if (value.state === "normal") {
        if (method.indexOf("sound") !== -1) {
          state = "Alarm condition not met";
        }
      } else {
        if (method.indexOf("sound") === -1) {
          state = "Alarm condition met and silenced";
        } else {
          state = "Alarm condition met and not silenced";
        }
      }

      let alarmId;
      if (path.startsWith("notifications.navigation.anchor")) {
        // There should be a better one but not supported by canboatjs yet
        alarmId = "Deep Anchor";
      } else if (path.startsWith("notifications.mob")) {
        alarmId = "MOB";
      }

      if (state && alarmId) {
        pgns.push({
          pgn: 65288,
          path: path,
          SID: 1,
          "Alarm Status": state,
          "Alarm ID": alarmId,
          "Alarm Group": "Instrument",
          "Alarm Priority": 1,
          "Manufacturer Code": "Raymarine",
          "Industry Code": "Marine Industry",
        });
      }

      try {
        return pgns;
      } catch (err) {
        console.error(err);
      }
    },
    tests: [
      {
        input: [
          {
            context: "vessels.urn:mrn:imo:mmsi:367301250",
            updates: [
              {
                values: [
                  {
                    path: "notifications.navigation.anchor",
                    value: {
                      state: "alert",
                      method: ["sound"],
                    },
                  },
                ],
              },
            ],
          },
        ],
        expected: [
          {
            prio: 2,
            pgn: 65288,
            dst: 255,
            fields: {
              manufacturerCode: "Raymarine",
              industryCode: "Marine Industry",
              sid: 1,
              alarmStatus: "Alarm condition met and not silenced",
              alarmId: "Deep Anchor",
              alarmGroup: "Instrument",
              alarmPriority: 1,
            },
          },
        ],
      },
    ],
  };
};
