import path from "path";
import fse from "fs-extra/esm";

const defaultTestsRootFolder = "test"; // default test folder used for tests

export function getTestsFolder(testsRootFolder) {
  return testsRootFolder || defaultTestsRootFolder;
}

export function getTestFilePath(funcName, testsRootFolder) {
  return path.join(
    getTestsFolder(testsRootFolder),
    `${funcName.replace(/.*\//g, "")}.js`,
  );
}

// Create the test folder
export async function createTestFolder(testsRootFolder) {
  const testsFolder = getTestsFolder(testsRootFolder);

  const doesExist = await fse.exists(testsFolder);

  if (!doesExist) {
    await fse.mkdir(testsFolder);
  }
}

export function getTemplateFromFile(templateFilenamePath) {
  return fse.readFileSync(templateFilenamePath, "utf-8");
}

export function funcNameFromPath(filePath) {
  const data = path.parse(filePath);

  return data.name;
}

export function setEnv(serverless, funcName) {
  const serviceVars = serverless.service.provider.environment || {};
  const functionVars = serverless.service.functions[funcName]
    ? serverless.service.functions[funcName].environment
    : {};
  return Object.assign(process.env, serviceVars, functionVars);
}

