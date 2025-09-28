module.exports = (_app, _plugin) => {
  return {
    pgn: 127245,
    title: "Rudder Position (127245)",
    optionKey: "RUDDER",
    keys: ["steering.rudderAngle.main", "steering.rudderAngleTarget.main"],
    timeouts: [1000, 1000], // 1 second for responsive steering
    callback: (rudderAngle, rudderAngleTarget) => {
      if (rudderAngle == null && rudderAngleTarget == null) {
        return null;
      }

      return [
        {
          prio: 2,
          pgn: 127245,
          dst: 255,
          fields: {
            instance: 0,
            directionOrder:
              rudderAngleTarget != null
                ? rudderAngleTarget > 0
                  ? "Turn Right"
                  : rudderAngleTarget < 0
                    ? "Turn Left"
                    : "No Order"
                : "No Order",
            angleOrder: Math.abs(rudderAngleTarget || 0),
            position: rudderAngle,
          },
        },
      ];
    },
    tests: [
      {
        input: [0.0873, 0.1396], // 5 degrees actual, 8 degrees target (starboard)
        expected: [
          {
            prio: 2,
            pgn: 127245,
            dst: 255,
            fields: {
              angleOrder: 0.1396,
              directionOrder: "No Order",
              instance: 0,
              position: 0.0873,
            },
          },
        ],
      },
      {
        input: [-0.0349, -0.0698], // 2 degrees port actual, 4 degrees port target
        expected: [
          {
            prio: 2,
            pgn: 127245,
            dst: 255,
            fields: {
              angleOrder: 0.0698,
              directionOrder: "No Order",
              instance: 0,
              position: -0.0349,
            },
          },
        ],
      },
    ],
  };
};
