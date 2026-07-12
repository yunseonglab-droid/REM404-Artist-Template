// js/stats.js

import { getArchiveStats } from "./firebase.js";

const totalMemoriesEl = document.getElementById("totalMemories");
const koCountEl = document.getElementById("koCount");
const enCountEl = document.getElementById("enCount");
const unknownCountEl = document.getElementById("unknownCount");
const usageCountEl = document.getElementById("usageCount");
const usageListEl = document.getElementById("usageList");
const refreshStatsBtn = document.getElementById("refreshStatsBtn");
const prevPageBtn = document.getElementById("prevPageBtn");
const nextPageBtn = document.getElementById("nextPageBtn");
const pageInfoEl = document.getElementById("pageInfo");
const usagePaginationEl = document.getElementById("usagePagination");

const PAGE_SIZE = 8;

let currentPage = 1;
let cachedUsageLogs = [];

function formatDate(value) {
  if (!value) return "Unknown time";

  if (value.toDate) {
    return value.toDate().toLocaleString("ko-KR");
  }

  return String(value);
}

function getPageName(page) {
  switch (page) {
    case "index.html":
      return "🏠 Main Experience";
    case "admin.html":
      return "🛠 Admin";
    case "stats.html":
      return "📊 Statistics";
    default:
      return page || "Unknown";
  }
}

function getEventName(type) {
  switch (type) {
    case "landing_visit":
      return "🏠 Landing Visit";
    case "memory_submit":
      return "💾 Memory Submitted";
    case "restore":
      return "✨ Memory Restored";
    case "error":
      return "⚠ Error";
    default:
      return type || "-";
  }
}

function getLanguageName(language) {
  if (language === "ko") return "🇰🇷 한국어";
  if (language === "en") return "🇺🇸 English";
  return "❓ Unknown";
}

function getDeviceName(userAgent = "") {
  if (userAgent.includes("Mac")) return "🍎 macOS";
  if (userAgent.includes("Windows")) return "🖥 Windows";
  if (userAgent.includes("Android")) return "🤖 Android";
  if (userAgent.includes("iPhone")) return "📱 iPhone";
  return "❓ Unknown";
}

function renderStats(stats) {
  totalMemoriesEl.textContent = stats.totalMemories ?? 0;
  koCountEl.textContent = stats.language?.ko ?? 0;
  enCountEl.textContent = stats.language?.en ?? 0;
  unknownCountEl.textContent = stats.language?.unknown ?? 0;
  usageCountEl.textContent = stats.totalVisits ?? stats.usageLogs?.length ?? 0;

  cachedUsageLogs = stats.usageLogs || [];
  currentPage = 1;

  if (cachedUsageLogs.length === 0) {
    usageListEl.innerHTML = `
      <div class="empty">
        아직 사용 기록이 없습니다.
      </div>
    `;

    if (usagePaginationEl) {
      usagePaginationEl.style.display = "none";
    }

    return;
  }

  if (usagePaginationEl) {
    usagePaginationEl.style.display = "flex";
  }

  renderUsagePage();
}

function renderUsagePage() {
  const totalPages = Math.ceil(cachedUsageLogs.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const pageLogs = cachedUsageLogs.slice(startIndex, startIndex + PAGE_SIZE);

  usageListEl.innerHTML = pageLogs.map((log) => {
    return `
      <article class="log-card">
        <div class="log-top">
          <div class="log-code">${getEventName(log.type)}</div>
          <div class="badge open">LOG</div>
        </div>

        <div class="log-title">
          ${getPageName(log.page)}
        </div>

        <div class="log-detail">
          Event : ${getEventName(log.type)}
        </div>

        <div class="log-meta">
          Time: ${formatDate(log.createdAt)}<br>
          Language: ${getLanguageName(log.language)}<br>
          Device: ${getDeviceName(log.userAgent)}
        </div>
      </article>
    `;
  }).join("");

  if (pageInfoEl) {
    pageInfoEl.textContent = `${currentPage} / ${totalPages}`;
  }

  if (prevPageBtn) {
    prevPageBtn.disabled = currentPage <= 1;
  }

  if (nextPageBtn) {
    nextPageBtn.disabled = currentPage >= totalPages;
  }
}

async function loadStats() {
  if (refreshStatsBtn) {
    refreshStatsBtn.disabled = true;
    refreshStatsBtn.textContent = "불러오는 중...";
  }

  try {
    const stats = await getArchiveStats();
    renderStats(stats);
  } catch (error) {
    console.error(error);

    usageListEl.innerHTML = `
      <div class="empty">
        통계 정보를 불러오지 못했습니다.<br>
        Firebase 연결을 확인해주세요.
      </div>
    `;
  } finally {
    if (refreshStatsBtn) {
      refreshStatsBtn.disabled = false;
      refreshStatsBtn.textContent = "새로고침";
    }
  }
}

if (prevPageBtn) {
  prevPageBtn.addEventListener("click", () => {
    if (currentPage <= 1) return;
    currentPage -= 1;
    renderUsagePage();
  });
}

if (nextPageBtn) {
  nextPageBtn.addEventListener("click", () => {
    const totalPages = Math.ceil(cachedUsageLogs.length / PAGE_SIZE);
    if (currentPage >= totalPages) return;
    currentPage += 1;
    renderUsagePage();
  });
}

if (refreshStatsBtn) {
  refreshStatsBtn.addEventListener("click", loadStats);
}

loadStats();
