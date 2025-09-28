const _ = require("lodash");

module.exports = (_app, _plugin) => {
  var lastUpdate = null;

  return {
    title: "Location (129025,129029)",
    optionKey: "GPS_LOCATION",
    keys: ["navigation.position"],
    callback: (position) => {
      //app.debug(`position: ${JSON.stringify(position)}`)
      var res = [
        {
          prio: 2,
          pgn: 129025,
          dst: 255,
          fields: {
            latitude: position.latitude,
            longitude: position.longitude,
          },
        },
      ];
      var dateObj, date, time;

      if (lastUpdate == null || Date.now() - lastUpdate.getTime() > 1000) {
        lastUpdate = new Date();

        dateObj = new Date();
        date = Math.trunc(dateObj.getTime() / 86400 / 1000);
        time =
          dateObj.getUTCHours() * (60 * 60) +
          dateObj.getUTCMinutes() * 60 +
          dateObj.getUTCSeconds();

        res.push({
          prio: 2,
          pgn: 129029,
          dst: 255,
          fields: {
            date: date,
            time: time,
            latitude: position.latitude,
            longitude: position.longitude,
            gnssType: "GPS+SBAS/WAAS",
            method: "DGNSS fix",
            integrity: "No integrity checking",
            numberOfSvs: 16,
            hdop: 0.64,
            geoidalSeparation: -0.01,
            referenceStations: 1,
            list: [
              {
                referenceStationType: "GPS+SBAS/WAAS",
                referenceStationId: 7,
              },
            ],
            //'Age of DGNSS Corrections':
          },
        });
      }
      return res;
    },
    tests: [
      {
        input: [{ longitude: -75.487264, latitude: 32.0631296 }],
        expected: [
          {
            prio: 2,
            pgn: 129025,
            dst: 255,
            fields: {
              latitude: 32.0631296,
              longitude: -75.487264,
            },
          },
          {
            __preprocess__: (testResult) => {
              //these change every time
              delete testResult.fields.date;
              delete testResult.fields.time;
            },
            prio: 2,
            pgn: 129029,
            dst: 255,
            fields: {
              latitude: 32.0631296,
              longitude: -75.487264,
              gnssType: "GPS+SBAS/WAAS",
              method: "DGNSS fix",
              integrity: "No integrity checking",
              numberOfSvs: 16,
              hdop: 0.64,
              geoidalSeparation: -0.01,
              referenceStations: 1,
              list: [
                {
                  referenceStationType: "GPS+SBAS/WAAS",
                  referenceStationId: 7,
                },
              ],
            },
          },
        ],
      },
    ],
  };
};
