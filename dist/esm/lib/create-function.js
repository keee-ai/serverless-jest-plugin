"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createAWSNodeJSFuncFile = createAWSNodeJSFuncFile;
exports.createFunction = createFunction;
var _yamlEdit = _interopRequireDefault(require("yaml-edit"));
var _fsExtra = _interopRequireDefault(require("fs-extra"));
var _path = _interopRequireDefault(require("path"));
var _ejs = _interopRequireDefault(require("ejs"));
function _interopRequireDefault(e) { return e && e.__esModule ? e : { default: e }; }
const functionTemplateFile = _path.default.join("templates", "function-template.ejs");
const validFunctionRuntimes = ["aws-nodejs14.x", "aws-nodejs16.x", "aws-nodejs18.x", "aws-nodejs20.x"];
const humanReadableFunctionRuntimes = `${validFunctionRuntimes.map(template => `'${template}'`).join(", ")}`;
function createAWSNodeJSFuncFile(serverless, handlerPath) {
  const handlerInfo = _path.default.parse(handlerPath);
  const handlerDir = _path.default.join(serverless.config.servicePath, handlerInfo.dir);
  const handlerFile = `${handlerInfo.name}.js`;
  const handlerFunction = handlerInfo.ext.replace(/^\./, "");
  let templateFile = _path.default.join(__dirname, functionTemplateFile);
  if (serverless.service.custom && serverless.service.custom["serverless-jest-plugin"] && serverless.service.custom["serverless-jest-plugin"].functionTemplate) {
    templateFile = _path.default.join(serverless.config.servicePath, serverless.service.custom["serverless-jest-plugin"].functionTemplate);
  }
  const templateText = _fsExtra.default.readFileSync(templateFile).toString();
  const jsFile = _ejs.default.render(templateText, {
    handlerFunction
  });
  const filePath = _path.default.join(handlerDir, handlerFile);
  serverless.utils.writeFileDir(filePath);
  if (serverless.utils.fileExistsSync(filePath)) {
    const errorMessage = [`File '${filePath}' already exists. Cannot create function.`].join("");
    throw new serverless.classes.Error(errorMessage);
  }
  _fsExtra.default.writeFileSync(_path.default.join(handlerDir, handlerFile), jsFile);
  const functionDir = handlerDir.replace(`${process.cwd()}/`, "");
  serverless.cli.log(`Created function file ${_path.default.join(functionDir, handlerFile)}`);
}
function createFunction(serverless, options) {
  serverless.cli.log("Generating function...");
  const functionName = options.function;
  const handler = options.handler;
  const serverlessYmlFilePath = _path.default.join(serverless.config.servicePath, "serverless.yml");
  const serverlessYmlFileContent = _fsExtra.default.readFileSync(serverlessYmlFilePath).toString();
  return serverless.yamlParser.parse(serverlessYmlFilePath).then(config => {
    const runtime = [config.provider.name, config.provider.runtime].join("-");
    if (validFunctionRuntimes.indexOf(runtime) < 0) {
      const errorMessage = [`Provider / Runtime '${runtime}' is not supported.`, ` Supported runtimes are: ${humanReadableFunctionRuntimes}.`].join("");
      throw new serverless.classes.Error(errorMessage);
    }
    const ymlEditor = (0, _yamlEdit.default)(serverlessYmlFileContent);
    if (ymlEditor.hasKey(`functions.${functionName}`)) {
      const errorMessage = [`Function '${functionName}' already exists. Cannot create function.`].join("");
      throw new serverless.classes.Error(errorMessage);
    }
    const funcDoc = Object.assign({}, {
      [functionName]: {
        handler
      }
    });
    Object.assign(serverless.service.functions, funcDoc);
    if (ymlEditor.insertChild("functions", funcDoc)) {
      const errorMessage = [`Could not find functions in ${serverlessYmlFilePath}`].join("");
      throw new serverless.classes.Error(errorMessage);
    }
    _fsExtra.default.writeFileSync(serverlessYmlFilePath, ymlEditor.dump());
    if (validFunctionRuntimes.indexOf(runtime) > -1) {
      return createAWSNodeJSFuncFile(serverless, handler);
    }
  });
}