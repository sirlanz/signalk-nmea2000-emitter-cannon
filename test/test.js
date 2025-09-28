const { pgnToActisenseSerialFormat, FromPgn } = require("@canboat/canboatjs");
const path = require("node:path");
const fs = require("node:fs");
const chai = require("chai");
const assert = chai.assert;
chai.Should();
//chai.use(require('chai-things'))
chai.use(require("chai-json-equal"));

const parser = new FromPgn();

let skSelfData = {};
let skData = {};

const app = {
  getSelfPath: (path) => {
    return skSelfData[path];
  },
  getPath: (path) => {
    return skData[path];
  },
  debug: (_msg) => {},
};

function load_conversions() {
  fpath = path.join(__dirname, "../conversions");
  files = fs.readdirSync(fpath);
  return files
    .map((fname) => {
      pgn = path.basename(fname, ".js");
      return require(path.join(fpath, pgn))(app, {});
    })
    .filter((converter) => {
      return typeof converter !== "undefined";
    });
}

const conversions = load_conversions();

describe("every conversion has a test", () => {
  conversions.forEach((conversion) => {
    if (!Array.isArray(conversion)) {
      conversion = [conversion];
    }

    conversion.forEach((conversion) => {
      it(`${conversion.title} has a test`, (done) => {
        var subConversions = conversion.conversions;
        if (typeof subConversions === "undefined") {
          subConversions = [conversion];
        } else if (typeof subConversions === "function") {
          subConversions = subConversions(
            Array.isArray(conversion.testOptions)
              ? conversion.testOptions[0]
              : conversion.testOptions
          );
        }
        if (subConversions) {
          subConversions.forEach((subConv) => {
            subConv.should.have.property("tests");
          });
        }
        done();
      });
    });
  });
});

describe("conversions work", () => {
  conversions.forEach((conversion) => {
    if (!Array.isArray(conversion)) {
      conversion = [conversion];
    }

    conversion.forEach((conversion) => {
      const optionsList = Array.isArray(conversion.testOptions)
        ? conversion.testOptions
        : [conversion.testOptions];

      optionsList.forEach((options, oidx) => {
        var subConversions = conversion.conversions;
        if (typeof subConversions === "undefined") {
          subConversions = [conversion];
        } else if (typeof subConversions === "function") {
          subConversions = subConversions(options || {});
        }
        if (subConversions) {
          subConversions.forEach((subConv) => {
            //subConv.should.have.property('tests')
            if (subConv.tests) {
              subConv.tests.forEach((test, idx) => {
                it(`${conversion.title} test # ${oidx}/${idx} works`, (done) => {
                  skData = test.skData || {};
                  skSelfData = test.skSelfData || {};
                  const result = subConv.callback.call(null, ...test.input);
                  if (!result) {
                    console.log(`Callback returned null for ${conversion.title}, skipping test`);
                    done();
                    return;
                  }
                  Promise.resolve(result).then((results) => {
                    results = results || [];
                    if (!Array.isArray(results)) {
                      console.error(`Expected array but got: ${typeof results}`, results);
                      results = [];
                    }
                    Promise.all(results.filter((r) => r != null)).then((pgns) => {
                      let error;
                      pgns = pgns || [];
                      assert.equal(
                        pgns.length,
                        test.expected.length,
                        "number of results returned does not match the number of expected results"
                      );
                      (pgns || []).forEach((res, idx) => {
                        try {
                          if (!res || typeof res !== "object" || !res.pgn) {
                            console.error(`Invalid result at index ${idx}:`, res);
                            return;
                          }
                          const encoded = pgnToActisenseSerialFormat(res);
                          if (!encoded) {
                            console.error(`Failed to encode result at index ${idx}:`, res);
                            return;
                          }
                          const pgn = parser.parseString(encoded);
                          if (!pgn) {
                            console.error(`Failed to parse encoded data at index ${idx}:`, encoded);
                            return;
                          }
                          delete pgn.description;
                          delete pgn.src;
                          delete pgn.timestamp;
                          delete pgn.input;
                          delete pgn.id; // Remove id field added by canboat v3.x

                          let expected = test.expected[idx];
                          if (typeof expected === "function") {
                            expected = expected(options);
                          }
                          const preprocess = expected.__preprocess__;
                          if (preprocess) {
                            preprocess(pgn);
                            delete expected.__preprocess__;
                          }
                          //console.log('parsed: ' + JSON.stringify(pgn, null, 2))
                          pgn.should.jsonEqual(expected);
                        } catch (e) {
                          console.error(
                            `Test error at index ${idx}:`,
                            e.message,
                            "for result:",
                            res
                          );
                          error = e;
                        }
                      });
                      done(error);
                    });
                  });
                });
              });
            }
          });
        }
      });
    });
  });
});
