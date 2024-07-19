"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
exports.getWrapper = getWrapper;
Object.defineProperty(exports, "lambdaWrapper", {
  enumerable: true,
  get: function () {
    return _lambdaWrapper.default;
  }
});
var _lambdaWrapper = _interopRequireDefault(require("lambda-wrapper"));
var _createFunction = require("./lib/create-function");
var _createTest = require("./lib/create-test");
var _runTests = require("./lib/run-tests");
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
class ServerlessJestPlugin {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.service = serverless.service || {};
    this.config = this.service.custom && this.service.custom.jest || {};
    this.options = options;
    this.commands = {
      create: {
        commands: {
          test: {
            usage: "Create jest tests for service / function",
            lifecycleEvents: ["test"],
            options: {
              function: {
                usage: "Name of the function",
                shortcut: "f",
                required: true,
                type: "string"
              },
              path: {
                usage: "Path for the tests",
                shortcut: "p",
                type: "string"
              }
            }
          },
          function: {
            usage: "Create a function into the service",
            lifecycleEvents: ["create"],
            options: {
              function: {
                usage: "Name of the function",
                shortcut: "f",
                required: true,
                type: "string"
              },
              handler: {
                usage: "Handler for the function (e.g. --handler my-function/index.handler)",
                required: true,
                type: "string"
              },
              path: {
                usage: "Path for the tests (e.g. --path tests)",
                shortcut: "p",
                type: "string"
              }
            }
          }
        }
      },
      invoke: {
        usage: "Invoke jest tests for service / function",
        commands: {
          test: {
            usage: "Invoke test(s)",
            lifecycleEvents: ["test"],
            options: {
              function: {
                usage: "Name of the function",
                shortcut: "f",
                type: "string"
              },
              reporter: {
                usage: "Jest reporter to use",
                shortcut: "R",
                type: "string"
              },
              "reporter-options": {
                usage: "Options for jest reporter",
                shortcut: "O",
                type: "multiple"
              },
              path: {
                usage: 'Path for the tests for running tests in other than default "test" folder',
                type: "string"
              }
            }
          }
        }
      }
    };
    this.hooks = {
      "create:test:test": async () => {
        await (0, _createTest.createTest)(this.serverless, this.options);
      },
      "invoke:test:test": async () => {
        try {
          await (0, _runTests.runTests)(this.serverless, this.options, this.config);
        } catch (err) {
          if (err.success === false) {
            // This is a successful run but with failed tests
            process.exit(1);
          }
          // Not sure what this is
          throw err;
        }
      },
      "create:function:create": async () => {
        await (0, _createFunction.createFunction)(this.serverless, this.options);
        await (0, _createTest.createTest)(this.serverless, this.options);
      }
    };
  }
}
var _default = exports.default = ServerlessJestPlugin;
// Add this for CommonJS compatibility
if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
  module.exports = ServerlessJestPlugin;
  module.exports.lambdaWrapper = _lambdaWrapper.default;
}

// Match `serverless-mocha-plugin`
function getWrapper(modName, modPath, handler) {
  // TODO: make this fetch the data from serverless.yml

  // eslint-disable-next-line global-require, import/no-dynamic-require
  const mod = require(process.env.SERVERLESS_TEST_ROOT + modPath);
  const wrapped = _lambdaWrapper.default.wrap(mod, {
    handler
  });
  return wrapped;
}