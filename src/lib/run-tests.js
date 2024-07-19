import { runCLI } from "jest";
import { setEnv } from "./utils";

export async function runTests(serverless, options, conf) {
  const functionName = options.f || options.function;
  const allFunctions = serverless.service.getAllFunctions();
  const config = Object.assign({ testEnvironment: "node" }, conf);

  allFunctions.forEach((name) => setEnv(serverless, name));

  if (!config.testRegex) {
    if (functionName) {
      if (allFunctions.indexOf(functionName) >= 0) {
        setEnv(serverless, functionName);
        Object.assign(config, { testRegex: `${functionName}\\.test\\.[jt]s$` });
      } else {
        throw new Error(`Function '${functionName}' not found`);
      }
    } else {
      const functionsRegex = allFunctions
        .map((name) => `${name}\\.test\\.[jt]s$`)
        .join("|");
      Object.assign(config, { testRegex: functionsRegex });
    }
  }

  // eslint-disable-next-line dot-notation
  process.env["SERVERLESS_TEST_ROOT"] = serverless.config.servicePath;

  return runCLI(config, [serverless.config.servicePath]).then((output) => {
    if (output.results.success) {
      return output;
    }

    throw output.results;
  });
}
