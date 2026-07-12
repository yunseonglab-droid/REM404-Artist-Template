import {
  getAllMemories,
  updateMemory,
  deleteMemory,
  getTrashMemories,
  restoreMemory
} from "./firebase.js";

const memoryList = document.getElementById("memoryList");
const refreshBtn = document.getElementById("refreshBtn");
const searchInput = document.getElementById("memorySearchInput");

let memories = [];
let trashMemories = [];
let currentPage = 1;
let currentMode = "active";
const PAGE_SIZE = 8;

function formatDate(value) {
  if (!value) return "-";
  if (value.toDate) return value.toDate().toLocaleString("ko-KR");
  return String(value);
}

function getSourceList() {
  return currentMode === "trash" ? trashMemories : memories;
}

function getFilteredList() {
  const keyword = searchInput.value.trim().toLowerCase();

  return getSourceList().filter((memory) => {
    return (memory.memory || "").toLowerCase().includes(keyword);
  });
}

function renderPagination(totalItems) {
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));

  if (totalPages <= 1) return "";

  let buttons = "";

  for (let i = 1; i <= totalPages; i += 1) {
    buttons += `
      <button class="page-btn ${i === currentPage ? "active" : ""}" data-page="${i}">
        ${i}
      </button>
    `;
  }

  return `
    <div class="pagination">
      ${buttons}
    </div>
  `;
}

function render(list) {
  const totalItems = list.length;
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageItems = list.slice(start, start + PAGE_SIZE);

  if (totalItems === 0) {
    memoryList.innerHTML = `
      <div class="empty">
        ${currentMode === "trash" ? "휴지통이 비어 있습니다." : "저장된 기억이 없습니다."}
      </div>
    `;
    return;
  }

  memoryList.innerHTML = pageItems.map(memory => `
    <article class="log-card">
      <div class="log-top">
        <div class="log-code">${memory.id}</div>
        <div class="badge ${currentMode === "trash" ? "solved" : "open"}">
          ${currentMode === "trash" ? "TRASH" : (memory.language || "unknown").toUpperCase()}
        </div>
      </div>

      <textarea
        class="memory-editor"
        data-id="${memory.id}"
        maxlength="80"
        ${currentMode === "trash" ? "disabled" : ""}
      >${memory.memory || ""}</textarea>

      <div class="log-meta">
        Created: ${formatDate(memory.createdAt)}<br>
        ${currentMode === "trash" ? `Deleted: ${formatDate(memory.deletedAt)}` : ""}
      </div>

      <div class="manager-buttons">
        ${
          currentMode === "trash"
            ? `<button class="restore-memory-btn" data-id="${memory.id}">복구</button>`
            : `
              <button class="edit-memory-btn" data-id="${memory.id}">저장</button>
              <button class="delete-memory-btn" data-id="${memory.id}">삭제</button>
            `
        }
      </div>
    </article>
  `).join("") + renderPagination(totalItems);

  bindButtons();
}

function bindButtons() {
  document.querySelectorAll(".edit-memory-btn").forEach(button => {
    button.onclick = async () => {
      const id = button.dataset.id;
      const textarea = document.querySelector(`.memory-editor[data-id="${id}"]`);

      await updateMemory(id, textarea.value);
      alert("수정되었습니다.");
      await loadMemories();
    };
  });

  document.querySelectorAll(".delete-memory-btn").forEach(button => {
    button.onclick = async () => {
      if (!confirm("휴지통으로 이동하시겠습니까?")) return;

      await deleteMemory(button.dataset.id);
      await loadMemories();
    };
  });

  document.querySelectorAll(".restore-memory-btn").forEach(button => {
    button.onclick = async () => {
      await restoreMemory(button.dataset.id);
      alert("복구되었습니다.");
      await loadMemories();
    };
  });

  document.querySelectorAll(".page-btn").forEach(button => {
    button.onclick = () => {
      currentPage = Number(button.dataset.page);
      render(getFilteredList());
    };
  });
}

async function loadMemories() {
  memoryList.innerHTML = `
    <div class="empty">
      불러오는 중...
    </div>
  `;

  memories = await getAllMemories();
  trashMemories = await getTrashMemories();

  render(getFilteredList());
}

searchInput.addEventListener("input", () => {
  currentPage = 1;
  render(getFilteredList());
});

refreshBtn.addEventListener("click", loadMemories);

document.addEventListener("click", (event) => {
  if (event.target.id === "showActiveBtn") {
    currentMode = "active";
    currentPage = 1;
    render(getFilteredList());
  }

  if (event.target.id === "showTrashBtn") {
    currentMode = "trash";
    currentPage = 1;
    render(getFilteredList());
  }
});

loadMemories();
