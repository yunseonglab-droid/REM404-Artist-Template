import { siteConfig } from "./site-config.js";
import { loadExhibitionConfig } from "./exhibition-config.js";

await loadExhibitionConfig();

const params = new URLSearchParams(window.location.search);
const lang = params.get("lang") || localStorage.getItem(`${siteConfig.siteId}:language`) || "ko";

document.documentElement.lang = lang;
document.title = `${siteConfig.brand} Preparing`;

const title = document.getElementById("prepareTitle");
const text = document.getElementById("prepareText");
const button = document.getElementById("cameraStartBtn");
const versionLabel = document.getElementById("prepareVersion");

if (versionLabel) {
  versionLabel.textContent = `${siteConfig.brand} ${siteConfig.version}`;
}

const messages = {
  ko: {
    title: "기억 복원 준비 중",
    button: "카메라 시작하기",
    lines: [
      "기억 저장소에 접근하는 중...",
      "공간의 흔적을 불러오는 중...",
      "카메라 권한을 준비하는 중...",
      `${siteConfig.brand}와 연결하는 중...`,
      "기억 스캐너를 초기화하는 중..."
    ]
  },
  en: {
    title: "Preparing Memory Restore",
    button: "Start Camera",
    lines: [
      "Accessing the memory archive...",
      "Loading traces of the space...",
      "Preparing camera permission...",
      `Connecting to ${siteConfig.brand}...`,
      "Initializing memory scanner..."
    ]
  }
};

const t = messages[lang] || messages.ko;

title.textContent = t.title;
button.textContent = t.button;

let index = 0;

function rotateText() {
  text.textContent = t.lines[index % t.lines.length];
  index += 1;
}

rotateText();
setInterval(rotateText, 1100);

button.addEventListener("click", () => {
  button.disabled = true;
  button.textContent = lang === "en" ? "Opening camera..." : "카메라 여는 중...";

  setTimeout(() => {
    window.location.href = `./ar.html?lang=${lang}`;
  }, 650);
});
