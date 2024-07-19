"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createTestFolder = createTestFolder;
exports.funcNameFromPath = funcNameFromPath;
exports.getTemplateFromFile = getTemplateFromFile;
exports.getTestFilePath = getTestFilePath;
exports.getTestsFolder = getTestsFolder;
exports.setEnv = setEnv;
var _path = _interopRequireDefault(require("path"));
var _fsExtra = _interopRequireDefault(require("fs-extra"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const defaultTestsRootFolder = "test"; // default test folder used for tests

function getTestsFolder(testsRootFolder) {
  return testsRootFolder || defaultTestsRootFolder;
}
function getTestFilePath(funcName, testsRootFolder) {
  return _path.default.join(getTestsFolder(testsRootFolder), `${funcName.replace(/.*\//g, "")}.js`);
}

// Create the test folder
async function createTestFolder(testsRootFolder) {
  const testsFolder = getTestsFolder(testsRootFolder);
  const doesExist = await _fsExtra.default.exists(testsFolder);
  if (!doesExist) {
    await _fsExtra.default.mkdir(testsFolder);
  }
  return testsFolder;
}
function getTemplateFromFile(templateFilenamePath) {
  return _fsExtra.default.readFileSync(templateFilenamePath, "utf-8");
}
function funcNameFromPath(filePath) {
  const data = _path.default.parse(filePath);
  return data.name;
}
function setEnv(serverless, funcName) {
  const serviceVars = serverless.service.provider.environment || {};
  const functionVars = serverless.service.functions[funcName] ? serverless.service.functions[funcName].environment : {};
  return Object.assign(process.env, serviceVars, functionVars);
}