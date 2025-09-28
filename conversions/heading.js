module.exports = (_app, _plugin) => {
  return {
    pgn: 127250,
    title: "Heading (127250)",
    optionKey: "HEADING",
    keys: ["navigation.headingMagnetic", "navigation.magneticVariation"],
    callback: (heading, variation) => {
      return [
        {
          prio: 2,
          pgn: 127250,
          dst: 255,
          fields: {
            sid: 87,
            heading: heading,
            variation: variation,
            reference: "Magnetic",
          },
        },
      ];
    },
    tests: [
      {
        input: [1.2, 0.7],
        expected: [
          {
            prio: 2,
            pgn: 127250,
            dst: 255,
            fields: {
              sid: 87,
              heading: 1.2,
              variation: 0.7,
              reference: "Magnetic",
            },
          },
        ],
      },
    ],
  };
};
