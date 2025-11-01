import { version as appVersion } from "../../../../package.json";

const parseVersion = (
  version: string,
): { major: number; minor: number; patch: number } => {
  const parts = version
    .replace(/[^0-9.]/g, "")
    .split(".")
    .map(Number);
  return {
    major: parts[0] || 0,
    minor: parts[1] || 0,
    patch: parts[2] || 0,
  };
};

export const isNewInCurrentVersion = (
  tweakVersion: string,
  currentVersion: string,
): boolean => {
  if (!tweakVersion) return false;

  const current = parseVersion(currentVersion);
  const tweakVer = parseVersion(tweakVersion);

  return current.major === tweakVer.major && current.minor === tweakVer.minor;
};

export const isUpdatedInCurrentVersion = (
  updatedVersion: string,
  currentVersion: string,
): boolean => {
  if (!updatedVersion) return false;

  const current = parseVersion(currentVersion);
  const updatedVer = parseVersion(updatedVersion);

  return (
    current.major === updatedVer.major && current.minor === updatedVer.minor
  );
};

export const CURRENT_VERSION = appVersion;
