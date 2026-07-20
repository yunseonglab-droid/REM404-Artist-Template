import { siteConfig, hasFirebaseConfiguration } from "./site-config.js";
import { reportServiceError } from "./serviceMonitor.js";

export async function logDebugError(code, detail = {}) {
  // A new artist template intentionally starts without Firebase credentials.
  // Do not turn that expected setup state into repeated browser warnings.
  if (!hasFirebaseConfiguration()) return;

  const log = {
    code,
    detail,
    status: "open",
    page: location.pathname,
    url: location.href,
    userAgent: navigator.userAgent,
    language: document.documentElement.lang || "unknown",
    version: siteConfig.version,
    createdAt: new Date().toISOString()
  };

  console.warn(`[${siteConfig.brand} DEBUG]`, log);
  void reportServiceError(code, {
    message: detail.message || detail.error || code,
    source: location.href,
    ...detail
  });

  try {
    const firebaseApi = await import("./firebase.js");

    if (firebaseApi && firebaseApi.saveDebugLog) {
      await firebaseApi.saveDebugLog(log);
    }
  } catch (error) {
    console.warn("Debug log save failed:", error);
  }
}
