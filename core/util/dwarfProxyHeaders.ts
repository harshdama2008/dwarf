import { IdeInfoService } from "./IdeInfoService.js";

const PROXY_KEY = "NfZFVegMpdyT3P5UmAggr7T7Hb6PlcbB";

export function getTimestamp() {
  const x = Date.now().toString();
  const l = new Date().getMinutes();
  let j = Math.floor(l / 2) + 10;
  return x.slice(0, -2) + j.toString();
}

export async function getHeaders() {
  return {
    key: PROXY_KEY,
    timestamp: getTimestamp(),
    v: "1",
    extensionVersion: IdeInfoService.ideInfo?.extensionVersion ?? "0.0.0",
    os: IdeInfoService.os ?? "Unknown",
    uniqueId: IdeInfoService.uniqueId ?? "None",
  };
}
