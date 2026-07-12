// js/debug.js
const PAGE_SIZE = 8;

let currentPage = 1;
let cachedLogs = [];

import { getDebugLogs } from "./firebase.js";

const ERROR_GUIDE = {
  "ARTARCHIVE-E-MIND-002": {
    title: "이미지 인식 실패",
    description: "이미지 타겟이 15초 이상 인식되지 않았습니다.",
    cause: "사진이 카메라 화면 안에 없거나, 조명·반사·거리 문제로 인식되지 않았을 수 있습니다.",
    solution: "사진을 화면 중앙에 맞추고, 반사를 줄인 뒤 다시 스캔하세요."
  },

  "ARTARCHIVE-E-MIND-START": {
    title: "AR 카메라 시작 실패",
    description: "MindAR 또는 카메라 권한 요청 과정에서 오류가 발생했습니다.",
    cause: "카메라 권한 거부, Safari 권한 지연, 브라우저 호환성 문제가 원인일 수 있습니다.",
    solution: "카메라 권한을 허용하고, 새로고침 후 다시 시도하세요."
  },

  "ARTARCHIVE-E-FIRE-001": {
    title: "Firebase 연결 실패",
    description: "Firebase 모듈을 불러오지 못했습니다.",
    cause: "인터넷 연결 문제, Firebase 설정 문제, 또는 모듈 로딩 실패일 수 있습니다.",
    solution: "네트워크 상태와 Firebase 설정을 확인하세요."
  },

  "ARTARCHIVE-E-AUDIO-001": {
    title: "효과음 재생 실패",
    description: "복원 효과음을 재생하지 못했습니다.",
    cause: "브라우저 자동재생 제한 또는 오디오 파일 로딩 실패일 수 있습니다.",
    solution: "사용자 터치 후 다시 실행하거나 audio 파일 경로를 확인하세요."
  }
};
const openCountEl = document.getElementById("openCount");
const solvedCountEl = document.getElementById("solvedCount");
const totalCountEl = document.getElementById("totalCount");
const logListEl = document.getElementById("logList");
const refreshBtn = document.getElementById("refreshBtn");

function formatDate(value) {
  if (!value) return "Unknown time";

  if (value.toDate) {
    return value.toDate().toLocaleString("ko-KR");
  }

  return String(value);
}
function parseUserAgent(ua = "") {
  let device = "Unknown Device";
  let browser = "Unknown Browser";

  // Device
  if (/iPhone/i.test(ua)) {
    const version = ua.match(/OS (\d+[_\d]*)/);
    device = `iPhone · iOS ${version ? version[1].replace(/_/g, ".") : ""}`;
  } else if (/iPad/i.test(ua)) {
    device = "iPad";
  } else if (/Android/i.test(ua)) {
    const version = ua.match(/Android ([\d.]+)/);
    device = `Android ${version ? version[1] : ""}`;
  } else if (/Windows/i.test(ua)) {
    device = "Windows";
  } else if (/Macintosh|Mac OS X/i.test(ua)) {
    device = "macOS";
  }

  // Browser
  if (/KAKAOTALK/i.test(ua)) {
    browser = "KakaoTalk In-App Browser";
  } else if (/CriOS|Chrome/i.test(ua)) {
    browser = "Google Chrome";
  } else if (/Safari/i.test(ua)) {
    browser = "Safari";
  } else if (/Firefox/i.test(ua)) {
    browser = "Firefox";
  }

  return `${device}<br>${browser}`;
}

function normalizeLog(log) {
  return {
    code: log.code || "ARTARCHIVE-E-UNKNOWN",
    title: log.title || log.detail?.message || "Unknown Error",
    detail: log.detail || {},
    status: log.status || "open",
    page: log.page || "unknown",
    userAgent: log.userAgent || "unknown",
    createdAt: log.createdAtServer || log.createdAt || null
  };
}

function renderLogs(logs) {
  cachedLogs = logs;

  const normalizedLogs = cachedLogs.map(normalizeLog);

  const openLogs = normalizedLogs.filter((log) => log.status === "open");
  const solvedLogs = normalizedLogs.filter((log) => log.status === "solved");

  openCountEl.textContent = openLogs.length;
  solvedCountEl.textContent = solvedLogs.length;
  totalCountEl.textContent = normalizedLogs.length;

  if (normalizedLogs.length === 0) {
    logListEl.innerHTML = `
      <div class="empty">
        아직 기록된 오류가 없습니다.
      </div>
    `;

    renderPagination(0);
    return;
  }

  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const pageLogs = normalizedLogs.slice(startIndex, endIndex);

  logListEl.innerHTML = pageLogs.map((log) => {
    const detailText = JSON.stringify(log.detail, null, 2);
    const guide = ERROR_GUIDE[log.code];

    const guideHtml = guide
      ? `
        <div class="error-guide">
          <div class="error-guide-title">${guide.title}</div>
          <div class="error-guide-label">오류 설명</div>
          <div class="error-guide-desc">${guide.description}</div>

          <div class="error-guide-row">
            <strong>가능한 원인</strong>
            <span>${guide.cause}</span>
          </div>

          <div class="error-guide-row">
            <strong>해결 방법</strong>
            <span>${guide.solution}</span>
          </div>
        </div>
      `
      : "";

    return `
      <article class="log-card">
        <div class="log-top">
          <div class="log-code">${log.code}</div>
          <div class="badge ${log.status}">
            ${log.status.toUpperCase()}
          </div>
        </div>

        <div class="log-title">
          ${log.title}
        </div>

        ${guideHtml}
        
          <details class="raw-log">
  <summary>원본 로그 보기</summary>
  <pre class="log-detail">${detailText}</pre>
</details>

 <div class="log-info">

  <div class="info-row">
    <div class="info-label">PAGE</div>
    <div class="info-value">${log.page}</div>
  </div>

  <div class="info-row">
    <div class="info-label">TIME</div>
    <div class="info-value">${formatDate(log.createdAt)}</div>
  </div>

  <div class="info-row">
    <div class="info-label">DEVICE</div>
    <div class="info-value">${parseUserAgent(log.userAgent)}</div>
  </div>

</div>
      </article>
    `;
  }).join("");

  renderPagination(normalizedLogs.length);
}

function renderPagination(totalCount) {

  let paginationEl = document.getElementById("debugPagination");

  if (paginationEl) {

    paginationEl.remove();

  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  if (totalPages <= 1) return;

  paginationEl = document.createElement("div");

  paginationEl.id = "debugPagination";

  paginationEl.className = "pagination";

  for (let page = 1; page <= totalPages; page++) {

    const button = document.createElement("button");

    button.textContent = page;

    button.className = page === currentPage ? "page-btn active" : "page-btn";

    button.addEventListener("click", () => {

      currentPage = page;

      renderLogs(cachedLogs);

      window.scrollTo({ top: 0, behavior: "smooth" });

    });

    paginationEl.appendChild(button);

  }

  logListEl.after(paginationEl);

}

async function loadLogs() {
  if (refreshBtn) {
    refreshBtn.disabled = true;
    refreshBtn.textContent = "불러오는 중...";
  }

  try {
    const logs = await getDebugLogs();
    currentPage = 1;
    renderLogs(logs);
  } catch (error) {
    console.error(error);

    logListEl.innerHTML = `
      <div class="empty">
        오류 기록을 불러오지 못했습니다.<br>
        Firebase 연결을 확인해주세요.
      </div>
    `;
  } finally {
    if (refreshBtn) {
      refreshBtn.disabled = false;
      refreshBtn.textContent = "새로고침";
    }
  }
}

if (refreshBtn) {
  refreshBtn.addEventListener("click", loadLogs);
}

loadLogs();
