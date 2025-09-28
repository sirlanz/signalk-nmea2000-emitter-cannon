module.exports = (_app, _plugin) => {
  return {
    pgn: 127250,
    title: "TrueHeading (127250)",
    optionKey: "TRUE_HEADING",
    keys: ["navigation.headingTrue"],
    callback: (heading) => {
      return [
        {
          prio: 2,
          pgn: 127250,
          dst: 255,
          fields: {
            sid: 87,
            heading: heading,
            variation: undefined,
            reference: "True",
          },
        },
      ];
    },
    tests: [
      {
        input: [1.35, undefined],
        expected: [
          {
            prio: 2,
            pgn: 127250,
            dst: 255,
            fields: {
              sid: 87,
              heading: 1.35,
              variation: undefined,
              reference: "True",
            },
          },
        ],
      },
    ],
  };
};
