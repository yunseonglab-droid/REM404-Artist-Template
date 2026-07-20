const serviceFirebaseConfig = {
  apiKey: "AIzaSyAst32Rk5IYFyeRsps8aX-tnUqkdH2usUA",
  authDomain: "rem404.firebaseapp.com",
  projectId: "rem404",
  storageBucket: "rem404.firebasestorage.app",
  messagingSenderId: "54552225095",
  appId: "1:54552225095:web:27a945fe454f627680d862"
};

const exhibitionId = (location.pathname.split("/").filter(Boolean)[0] || location.hostname.split(".")[0])
  .toLowerCase()
  .replace(/[^a-z0-9-]+/g, "-")
  .replace(/^-+|-+$/g, "");

let lastSignature = "";
let lastReportedAt = 0;

async function getMonitoringDb() {
  const [{ initializeApp, getApps }, { getFirestore }] = await Promise.all([
    import("https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js"),
    import("https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js")
  ]);
  const appName = "rem404-service-monitor";
  const app = getApps().find((item) => item.name === appName) || initializeApp(serviceFirebaseConfig, appName);
  return getFirestore(app);
}

export async function reportServiceError(code, detail = {}) {
  if (!exhibitionId) return;
  const signature = `${code}:${detail.message || ""}:${detail.source || ""}:${detail.line || ""}`;
  const now = Date.now();
  if (signature === lastSignature && now - lastReportedAt < 30_000) return;
  lastSignature = signature;
  lastReportedAt = now;

  try {
    const { collection, addDoc, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js");
    const db = await getMonitoringDb();
    await addDoc(collection(db, "exhibitions", exhibitionId, "debugLogs"), {
      code: String(code).slice(0, 120),
      title: detail.message || "관객 화면에서 실행 오류가 발생했습니다.",
      detail,
      status: "open",
      page: location.pathname,
      url: location.href,
      userAgent: navigator.userAgent,
      language: document.documentElement.lang || "unknown",
      createdAt: serverTimestamp(),
      createdAtLocal: new Date().toISOString()
    });
  } catch (error) {
    console.warn("REM404 service monitor report failed:", error);
  }
}

window.addEventListener("error", (event) => {
  void reportServiceError("REM404-E-RUNTIME", {
    message: event.message || "JavaScript runtime error",
    source: event.filename || location.href,
    line: event.lineno || null,
    column: event.colno || null,
    stack: event.error?.stack || ""
  });
});

window.addEventListener("unhandledrejection", (event) => {
  const reason = event.reason;
  void reportServiceError("REM404-E-PROMISE", {
    message: reason instanceof Error ? reason.message : String(reason || "Unhandled promise rejection"),
    source: location.href,
    line: null,
    column: null,
    stack: reason instanceof Error ? reason.stack || "" : ""
  });
});
