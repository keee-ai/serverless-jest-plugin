"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createTest = createTest;
exports.writeTestfile = writeTestfile;
var _path = _interopRequireDefault(require("path"));
var _ejs = _interopRequireDefault(require("ejs"));
var _fsExtra = _interopRequireDefault(require("fs-extra"));
var _utils = _interopRequireDefault(require("./utils"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const testTemplateFile = _path.default.join("templates", "test-template.ejs");
const defaultTestPath = "__tests__";
function writeTestfile(serverless, options, testConfig) {
  const templateFile = _path.default.join(__dirname, testTemplateFile);
  const templateString = _utils.default.getTemplateFromFile(templateFile);
  const content = _ejs.default.render(templateString, {
    functionName: testConfig.functionName,
    functionPath: _path.default.join(_path.default.relative(testConfig.testPath, testConfig.functionPath.dir), testConfig.functionPath.name),
    handlerName: testConfig.functionPath.ext.substr(1)
  });
  return ensureDir(testConfig.testPath).then(() => writeFile(testConfig.testFilePath, content));
}
const testfileNotExists = async testConfig => _fsExtra.default.exists(testConfig.testFilePath, exists => {
  if (exists) {
    throw new Error(`File ${testConfig.testFilePath} already exists`);
  }
  return;
});
function createTest(serverless, options) {
  const functionName = options.f || options.function;
  if (!Object.prototype.hasOwnProperty.call(serverless.service.functions, functionName)) {
    throw new Error(`Error while creating test. Function '${functionName}' is undefined.`);
  }
  const functionItem = serverless.service.functions[functionName];
  const functionPath = _path.default.parse(functionItem.handler);
  const testPath = (options.p || options.path || defaultTestPath).replace(/\{function}/, functionPath.dir);
  const testFilePath = _path.default.join(testPath, `${functionName}.test.js`);
  const testConfig = {
    functionName,
    functionItem,
    functionPath,
    testPath,
    testFilePath
  };
  return testfileNotExists(testConfig).then(() => writeTestfile(serverless, options, testConfig)).then(() => serverless.cli.log(`Created test file ${testFilePath}`)).catch(error => {
    throw new Error(error);
  });
}