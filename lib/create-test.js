import path from "path";
import ejs from "ejs";
import fse from "fs-extra/esm";
import utils from "./utils";

const testTemplateFile = path.join("templates", "test-template.ejs");

const defaultTestPath = "__tests__";

export function writeTestfile(serverless, options, testConfig) {
  const templateFile = path.join(__dirname, testTemplateFile);
  const templateString = utils.getTemplateFromFile(templateFile);
  const content = ejs.render(templateString, {
    functionName: testConfig.functionName,
    functionPath: path.join(
      path.relative(testConfig.testPath, testConfig.functionPath.dir),
      testConfig.functionPath.name,
    ),
    handlerName: testConfig.functionPath.ext.substr(1),
  });
  return ensureDir(testConfig.testPath).then(() =>
    writeFile(testConfig.testFilePath, content),
  );
};

const testfileNotExists = async (testConfig) =>
  fse.exists(testConfig.testFilePath, (exists) => {
    if (exists) {
      throw new Error(`File ${testConfig.testFilePath} already exists`);
    }

    return;
  });

export function createTest(serverless, options) {
  const functionName = options.f || options.function;
  if (
    !Object.prototype.hasOwnProperty.call(
      serverless.service.functions,
      functionName,
    )
  ) {
    throw new Error(
      `Error while creating test. Function '${functionName}' is undefined.`,
    );
  }

  const functionItem = serverless.service.functions[functionName];
  const functionPath = path.parse(functionItem.handler);
  const testPath = (options.p || options.path || defaultTestPath).replace(
    /\{function}/,
    functionPath.dir,
  );
  const testFilePath = path.join(testPath, `${functionName}.test.js`);

  const testConfig = {
    functionName,
    functionItem,
    functionPath,
    testPath,
    testFilePath,
  };

  return testfileNotExists(testConfig)
    .then(() => writeTestfile(serverless, options, testConfig))
    .then(() => serverless.cli.log(`Created test file ${testFilePath}`))
    .catch((error) => {
      throw new Error(error);
    });
};

