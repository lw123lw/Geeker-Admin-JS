import path from "path";

export function isDevFn(mode) {
  return mode === "development";
}

export function isProdFn(mode) {
  return mode === "production";
}

export function isTestFn(mode) {
  return mode === "test";
}

/**
 * Whether to generate package preview
 */
export function isReportMode() {
  return process.env.VITE_REPORT === "true";
}

// Read all environment variable configuration files to process.env
export function wrapperEnv(envConf) {
  const ret = {};

  for (const envName of Object.keys(envConf)) {
    let realName = envConf[envName].replace(/\\n/g, "\n");
    realName = realName === "true" ? true : realName === "false" ? false : realName;
    if (envName === "VITE_PORT") realName = Number(realName);
    if (envName === "VITE_PROXY") {
      try {
        realName = JSON.parse(realName);
      } catch (error) {}
    }
    ret[envName] = realName;
  }
  return ret;
}

/**
 * Get user root directory
 * @param dir file path
 */
export function getRootPath(...dir) {
  return path.resolve(process.cwd(), ...dir);
}
