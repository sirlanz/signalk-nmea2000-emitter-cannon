const _ = require("lodash");

const static_keys = [
  "name",
  "design.aisShipType",
  "design.draft",
  "design.length",
  "design.beam",
  "sensors.ais.fromCenter",
  "sensors.ais.fromBow",
  "design.draft",
  "registrations.imo",
];

const position_keys = ["navigation.position"];

const static_pgn = 129794;
const position_pgn = 129038;
const aton_pgn = 129041;

const navStatusMapping = {
  "not under command": 2,
  anchored: 1,
  moored: 5,
  sailing: 8,
  motoring: 0,
  "towing < 200m": 3,
  "towing > 200m": 3,
  pushing: 3,
  fishing: 7,
  "fishing-hampered": 7,
  trawling: 7,
  "trawling-shooting": 7,
  "trawling-hauling": 7,
  "not-under-way": 2,
  aground: 6,
  "restricted manouverability": 3,
  "restricted manouverability towing < 200m": 3,
  "restricted manouverability towing > 200m": 3,
  "restricted manouverability underwater operations": 3,
  "constrained by draft": 4,
  "ais-sart": 14,
  "hazardous material high speed": 9,
  "hazardous material wing in ground": 10,
};

module.exports = (app, _plugin) => {
  return {
    title: `AIS (${static_pgn}, ${position_pgn}, ${aton_pgn})`,
    sourceType: "onDelta",
    //outputType: 'buffer',
    optionKey: "AIS",
    callback: (delta) => {
      var selfContext = `vessels.${app.selfId}`;
      var hasStatic, hasPosition, vessel, mmsi, res;

      if (delta.context === selfContext || isN2K(delta)) {
        return null;
      }

      if (delta.context.startsWith("vessels.")) {
        hasStatic = hasAnyKeys(delta, static_keys);
        hasPosition = hasAnyKeys(delta, position_keys);

        if (!hasStatic && !hasPosition) {
          return null;
        }

        vessel = app.getPath(delta.context);
        mmsi = findDeltaValue(vessel, delta, "mmsi");

        if (!mmsi) {
          return null;
        }

        res = [];
        if (hasPosition) {
          res.push(generatePosition(vessel, mmsi, delta));
        }

        if (hasStatic) {
          res.push(generateStatic(vessel, mmsi, delta));
        }
        return res;
      } else if (delta.context.startsWith("atons.")) {
        vessel = app.getPath(delta.context);
        mmsi = findDeltaValue(vessel, delta, "mmsi");

        if (!mmsi) {
          return;
        }

        return [generateAtoN(vessel, mmsi, delta)];
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
                    path: "navigation.position",
                    value: { longitude: -76.3947165, latitude: 39.1296167 },
                  },
                  { path: "navigation.courseOverGroundTrue", value: 1.501 },
                  { path: "navigation.speedOverGround", value: 0.05 },
                  { path: "navigation.headingTrue", value: 5.6199 },
                  { path: "navigation.rateOfTurn", value: 0 },
                  { path: "navigation.state", value: "motoring" },
                  {
                    path: "navigation.destination.commonName",
                    value: "BALTIMORE",
                  },
                  { path: "sensors.ais.fromBow", value: 9 },
                  { path: "sensors.ais.fromCenter", value: 0 },
                  { path: "design.draft", value: { maximum: 4.2 } },
                  { path: "design.length", value: { overall: 30 } },
                  {
                    path: "design.aisShipType",
                    value: { id: 52, name: "Tug" },
                  },
                  { path: "design.beam", value: 7 },
                  { path: "", value: { mmsi: "367301250" } },
                  { path: "", value: { name: "SOME BOAT" } },
                ],
              },
            ],
          },
        ],
        expected: [
          {
            prio: 2,
            pgn: 129038,
            dst: 255,
            fields: {
              messageId: "Scheduled Class A position report",
              userId: 367301250,
              longitude: -76.3947165,
              latitude: 39.1296167,
              positionAccuracy: "Low",
              raim: "not in use",
              timeStamp: "0",
              cog: 1.501,
              sog: 0.05,
              aisTransceiverInformation: "Channel A VDL reception",
              heading: 5.6199,
              rateOfTurn: 0,
              navStatus: "Under way using engine",
            },
          },
          {
            prio: 2,
            pgn: 129794,
            dst: 255,
            fields: {
              messageId: "Static and voyage related data",
              userId: 367301250,
              name: "SOME BOAT",
              typeOfShip: "Tug",
              length: 30,
              beam: 7,
              positionReferenceFromBow: 9,
              positionReferenceFromStarboard: 3.5,
              draft: 4.2,
              destination: "BALTIMORE",
              aisVersionIndicator: "ITU-R M.1371-1",
              dte: "Available",
              reserved: 1,
              aisTransceiverInformation: "Channel A VDL reception",
            },
          },
        ],
      },
      {
        input: [
          {
            context: "atons.urn:mrn:imo:mmsi:993672085",
            updates: [
              {
                values: [
                  { path: "", value: { name: "78A" } },
                  {
                    path: "navigation.position",
                    value: {
                      longitude: -76.4313882,
                      latitude: 38.5783333,
                    },
                  },
                  {
                    path: "atonType",
                    value: {
                      id: 14,
                      name: "Beacon, Starboard Hand",
                    },
                  },
                  {
                    path: "",
                    value: {
                      mmsi: "993672085",
                    },
                  },
                  {
                    path: "sensors.ais.class",
                    value: "ATON",
                  },
                ],
              },
            ],
          },
        ],
        expected: [
          {
            prio: 2,
            pgn: 129041,
            dst: 255,
            fields: {
              messageId: 0,
              repeatIndicator: "Initial",
              userId: 993672085,
              longitude: -76.4313882,
              latitude: 38.5783333,
              positionAccuracy: "Low",
              raim: "not in use",
              timeStamp: "0",
              atonType: "Fixed beacon: starboard hand",
              offPositionIndicator: "Yes",
              virtualAtonFlag: "Yes",
              assignedModeFlag: "Assigned mode",
              spare: 1,
              atonName: "78A",
            },
          },
        ],
      },
    ],
  };
};

function generateStatic(vessel, mmsi, delta) {
  var name = findDeltaValue(vessel, delta, "name");
  var type = _.get(findDeltaValue(vessel, delta, "design.aisShipType"), "id");
  var callsign = findDeltaValue(vessel, delta, "communication.callsignVhf");
  var length = _.get(findDeltaValue(vessel, delta, "design.length"), "overall");
  var beam = findDeltaValue(vessel, delta, "design.beam");
  var fromCenter = findDeltaValue(vessel, delta, "sensors.ais.fromCenter");
  var fromBow = findDeltaValue(vessel, delta, "sensors.ais.fromBow");
  var draft = _.get(findDeltaValue(vessel, delta, "design.draft"), "maximum");
  var imo = findDeltaValue(vessel, delta, "registrations.imo");
  var dest = findDeltaValue(vessel, delta, "navigation.destination.commonName");
  var parts, fromStarboard;
  /*
  type = _.isUndefined(type) ? 0 : type
  callsign = fillASCII(callsign ? callsign : '0', 7)
  name = fillASCII(name ? name : '0', 20)
  length = length ? length * 10 : 0xffff;
  beam = beam ? beam * 10 : 0xffff;
  draft = _.isUndefined(draft) ? 0xffff : draft * 100
  */

  if (_.isUndefined(imo)) {
    imo = 0;
  } else {
    parts = imo.split(imo);
    imo = Number(parts[parts.length - 1]);
  }

  if (!_.isUndefined(beam) && !_.isUndefined(fromCenter)) {
    fromStarboard = beam / 2 + fromCenter;
  }
  fromBow = fromBow ? fromBow : undefined;

  //2017-04-15T14:58:37.625Z,6,129794,43,255,76,05,28,e0,42,0f,0f,ee,8c,00,39,48,41,33,37,39,35,41,54,4c,41,4e,54,49,43,20,50,52,4f,4a,45,43,54,20,49,49,40,4f,8a,07,18,01,8c,00,fe,06,de,44,00,cc,bf,19,e8,03,52,55,20,4c,45,44,20,3e,20,55,53,20,42,41,4c,40,40,40,40,40,04,00,ff

  mmsi = parseInt(mmsi, 10);

  return {
    prio: 2,
    pgn: static_pgn,
    dst: 255,
    fields: {
      messageId: "Static and voyage related data",
      userId: mmsi,
      callsign: callsign,
      name: name,
      typeOfShip: type,
      length: length,
      beam: beam,
      positionReferenceFromStarboard: fromStarboard,
      positionReferenceFromBow: fromBow,
      draft: draft,
      destination: dest,
      aisVersionIndicator: "ITU-R M.1371-1",
      dte: "Available",
      aisTransceiverInformation: "Channel A VDL reception",
    },
  };

  /*
  var data = Concentrate2()
      .uint8(0x05)
      .uint32(mmsi)
      .uint32(imo)
      .buffer(callsign)
      .buffer(name)
      .uint8(type)
      .uint16(length)
      .uint16(beam)
      .uint16(fromStarboard)
      .uint16(fromBow)
      .buffer(int8buff([0xff, 0xff, 0xff, 0xff, 0xff, 0xff]))
      .uint16(draft)
      .buffer(dest)
      .buffer(int8buff([0x05,0x00,0xff]))
      .result()
  
  return { pgn: static_pgn, buffer:data }
*/
}

function generatePosition(vessel, mmsi, delta) {
  var position = findDeltaValue(vessel, delta, "navigation.position");
  var cog, sog, heading, rot, status;

  if (position?.latitude && position.longitude) {
    cog = findDeltaValue(vessel, delta, "navigation.courseOverGroundTrue");
    sog = findDeltaValue(vessel, delta, "navigation.speedOverGround");
    heading = findDeltaValue(vessel, delta, "navigation.headingTrue");
    rot = findDeltaValue(vessel, delta, "navigation.rateOfTurn");
    status = findDeltaValue(vessel, delta, "navigation.state");

    if (!_.isUndefined(status)) {
      status = navStatusMapping[status];
    }
    if (_.isUndefined(status)) {
      status = 0;
    }

    if (cog > Math.PI * 2) {
      cog = undefined;
    }

    if (heading > Math.PI * 2) {
      heading = undefined;
    }

    /*
    cog = _.isUndefined(cog) ? 0xffff : (Math.trunc(cog * 10000))
    sog = _.isUndefined(sog) ? 0xffff : (sog*100);
    heading = _.isUndefined(heading) ? 0xffff : (Math.trunc(heading * 10000))
    rot = _.isUndefined(rot) ? 0x7fff : rot

    var latitude = position.latitude * 10000000;
    var longitude = position.longitude * 10000000;
    */

    /*
      2017-04-15T15:06:37.589Z,4,129038,43,255,28,

      01,
      ae,e7,e0,15, mmsi
      36,5c,76,d2, lon
      93,0b,52,17, lat
      94, RAIM/TS
      4d,e9, COG
      39,01, SOG
      7e,05,01,
      ff,ff, heading
      ff,7f, rat
      01,
      00, Nav Status, reserved
      ff reserved
    */

    //console.log(`${mmsi} ${position.longitude} ${position.latitude} ${cog} ${sog} ${heading} ${rot}`)

    return {
      prio: 2,
      pgn: position_pgn,
      dst: 255,
      fields: {
        messageId: "Scheduled Class A position report",
        userId: mmsi,
        longitude: position.longitude,
        latitude: position.latitude,
        positionAccuracy: "Low",
        raim: "not in use",
        timeStamp: "0",
        cog: cog,
        sog: sog,
        aisTransceiverInformation: "Channel A VDL reception",
        heading: heading,
        rateOfTurn: rot,
        navStatus:
          navStatusMapping[
            Object.keys(navStatusMapping).find((key) => navStatusMapping[key] === status)
          ] || "Under way using engine",
      },
    };

    /*
    mmsi = parseInt(mmsi, 10)
    var data = Concentrate2()
        .uint8(0x01)
        .uint32(mmsi)
        .int32(longitude)
        .int32(latitude)
        .uint8(0x94)
        .uint16(cog)
        .uint16(sog)
        .uint8(0x7e)
        .uint8(0x05)
        .uint8(0x01)
        .uint16(heading)
        .int16(rot)
        .uint8(0xff)
        .uint8(0xff)
        .result()
    
    return { pgn: position_pgn, buffer: data }
    */
  } else {
    return null;
  }
}

function generateAtoN(vessel, mmsi, delta) {
  var position = findDeltaValue(vessel, delta, "navigation.position");
  var name, _type, length, beam, fromCenter, fromBow, _latitude, _longitude, fromStarboard;

  if (position?.latitude && position.longitude) {
    name = _.get(vessel, "name") || findDeltaValue(vessel, delta, "name");
    _type = _.get(findDeltaValue(vessel, delta, "atonType"), "id");
    length = _.get(findDeltaValue(vessel, delta, "design.length"), "overall");
    beam = findDeltaValue(vessel, delta, "design.beam");
    fromCenter = findDeltaValue(vessel, delta, "sensors.ais.fromCenter");
    fromBow = findDeltaValue(vessel, delta, "sensors.ais.fromBow");
    _latitude = position.latitude * 10000000;
    _longitude = position.longitude * 10000000;

    /*
    type = _.isUndefined(type) ? 0 : type
    name = fillASCII(name ? name : '0', 20)
    length = length ? length * 10 : 0xffff;
    beam = beam ? beam * 10 : 0xffff;
    */

    if (!_.isUndefined(beam) && !_.isUndefined(fromCenter)) {
      fromStarboard = beam / 2 + fromCenter;
    }
    fromBow = fromBow ? fromBow * 10 : undefined;

    /*
  2017-04-15T15:15:08.461Z,4,129041,43,255,49,15,

  77,3c,3a,3b,
  0d,bf,62,d2,
  b3,5e,60,17,
  f5,
  ff,ff,
  ff,ff,
  ff,ff,
  ff,ff, /from True north egde
  4e,
  0e, 
  00,
  01,
  17,01,
  4e,57,
  20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,20,40
  */

    mmsi = parseInt(mmsi, 10);

    return {
      prio: 2,
      pgn: aton_pgn,
      dst: 255,
      fields: {
        messageId: 0,
        repeatIndicator: "Initial",
        userId: mmsi,
        longitude: position.longitude,
        latitude: position.latitude,
        positionAccuracy: "Low",
        raim: "not in use",
        timeStamp: "0",
        lengthDiameter: length,
        beamDiameter: beam,
        positionReferenceFromStarboardEdge: fromStarboard,
        positionReferenceFromTrueNorthFacingEdge: fromBow,
        atonType: "Fixed beacon: starboard hand",
        offPositionIndicator: "Yes",
        virtualAtonFlag: "Yes",
        assignedModeFlag: "Assigned mode",
        spare: 1,
        atonName: name,
      },
    };
    /*
    var data = Concentrate2()
        .uint8(0x15)
        .uint32(mmsi)
        .int32(longitude)
        .int32(latitude)
        .uint8(0xf5)
        .uint16(length)
        .uint16(beam)
        .uint16(fromStarboard)
        .uint16(fromBow)
        .tinyInt(type,5)
        .tinyInt(0, 1)
        .tinyInt(0, 1)
        .tinyInt(0, 1)
        .uint8(0x0e)
        .uint8(0x00)
        .uint8(0x01)
        .uint8(0x17)
        .uint8(0x01)
        .buffer(name)
        .uint8(0x40)
        .result()
    return { pgn: aton_pgn, buffer: data }
    */
  } else {
    return null;
  }
}

function _int8buff(array) {
  return new Buffer(new Uint8Array(array).buffer);
}

function hasAnyKeys(delta, keys) {
  var i, j, valuePath, value;

  if (delta.updates) {
    for (i = 0; i < delta.updates.length; i++) {
      if (Array.isArray(delta.updates[i].values)) {
        for (j = 0; j < delta.updates[i].values.length; j++) {
          valuePath = delta.updates[i].values[j].path;
          value = delta.updates[i].values[j].value;

          if (valuePath === "") {
            if (_.intersection(_.keys(value), keys).length > 0) {
              return true;
            }
          } else if (keys.includes(valuePath)) {
            return true;
          }
        }
      }
    }
  }
  return false;
}

function findDeltaValue(vessel, delta, path) {
  var i, j, valuePath, value;

  if (delta.updates) {
    for (i = 0; i < delta.updates.length; i++) {
      for (j = 0; j < delta.updates[i].values.length; j++) {
        valuePath = delta.updates[i].values[j].path;
        value = delta.updates[i].values[j].value;
        if (valuePath === "" && path.indexOf(".") === -1) {
          value = _.get(value, path);
          if (value) {
            return value;
          }
        } else if (path === valuePath) {
          return value;
        }
      }
    }
  }
  const val = _.get(vessel, path);
  return val && !_.isUndefined(val.value) ? val.value : val;
}

function _fillASCII(theString, len) {
  var res = [];
  var i;
  for (i = 0; i < len && i < theString.length; i++) {
    res.push(theString.charCodeAt(i));
  }
  for (; i < len; i++) {
    res.push(0x40);
  }
  return new Buffer(new Uint8Array(res).buffer);
}

function isN2K(_delta) {
  return false;
}
