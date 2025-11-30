import crypto from "crypto";

export function generateApiKey() {
  const prefix = "api_";
  const key = crypto.randomBytes(32).toString("hex");
  return prefix + key;
}