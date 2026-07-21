import { siteConfig } from "./site-config.js";
import { exhibitionSnapshot } from "./exhibition-snapshot.js";

let loadingPromise = null;

function decodeFirestoreValue(value) {
  if (!value || typeof value !== "object") return null;
  if ("stringValue" in value) return value.stringValue;
  if ("timestampValue" in value) return value.timestampValue;
  if ("booleanValue" in value) return value.booleanValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return Number(value.doubleValue);
  if ("nullValue" in value) return null;
  return null;
}

function decodeFirestoreDocument(document) {
  return Object.fromEntries(
    Object.entries(document?.fields || {}).map(([key, value]) => [key, decodeFirestoreValue(value)])
  );
}

function normalizeMetadata(value) {
  if (!value || typeof value !== "object") return null;
  const endAt = typeof value.endAt === "string" ? value.endAt : null;
  const status = ["draft", "published", "archived"].includes(value.status) ? value.status : "draft";
  return {
    titleKo: typeof value.titleKo === "string" ? value.titleKo.trim() : "",
    titleEn: typeof value.titleEn === "string" ? value.titleEn.trim() : "",
    descriptionKo: typeof value.descriptionKo === "string" ? value.descriptionKo.trim() : "",
    descriptionEn: typeof value.descriptionEn === "string" ? value.descriptionEn.trim() : "",
    status: endAt && new Date(endAt).getTime() <= Date.now() ? "archived" : status,
    startAt: typeof value.startAt === "string" ? value.startAt : null,
    endAt,
    publicUrl: typeof value.publicUrl === "string" ? value.publicUrl : null,
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : null
  };
}

function applyMetadata(metadata) {
  const normalized = normalizeMetadata(metadata);
  if (!normalized) return false;
  Object.assign(siteConfig.exhibition, normalized);
  const titles = [normalized.titleKo, normalized.titleEn].filter(Boolean);
  if (titles.length) siteConfig.artist.artworkTitle = titles.join(" / ");
  return true;
}

async function fetchLiveMetadata() {
  const { projectId, apiKey, exhibitionId } = siteConfig.platform;
  const path = `projects/${encodeURIComponent(projectId)}/databases/(default)/documents/exhibitions/${encodeURIComponent(exhibitionId)}/public/config`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2500);
  try {
    const response = await fetch(`https://firestore.googleapis.com/v1/${path}?key=${encodeURIComponent(apiKey)}`, {
      cache: "no-store",
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`REM404_CONFIG_${response.status}`);
    return normalizeMetadata(decodeFirestoreDocument(await response.json()));
  } finally {
    clearTimeout(timeout);
  }
}

export function loadExhibitionConfig() {
  if (!loadingPromise) {
    loadingPromise = (async () => {
      try {
        const liveMetadata = await fetchLiveMetadata();
        if (applyMetadata(liveMetadata)) return { source: "live", metadata: liveMetadata };
      } catch (error) {
        console.warn("REM404 live exhibition config unavailable; using GitHub snapshot.", error);
      }
      applyMetadata(exhibitionSnapshot);
      return { source: exhibitionSnapshot ? "snapshot" : "template", metadata: siteConfig.exhibition };
    })();
  }
  return loadingPromise;
}

export function getExhibitionPeriodText(language = "ko") {
  const { startAt, endAt, status } = siteConfig.exhibition;
  if (!startAt && !endAt) return status === "archived" ? (language === "ko" ? "종료된 전시" : "Exhibition ended") : "";
  const locale = language === "ko" ? "ko-KR" : "en-US";
  const format = (value) => new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: language === "ko" ? "long" : "short",
    day: "numeric"
  }).format(new Date(value));
  const period = startAt && endAt
    ? `${format(startAt)} – ${format(endAt)}`
    : startAt
      ? `${format(startAt)}${language === "ko" ? "부터" : " onward"}`
      : `${language === "ko" ? "종료 " : "Until "}${format(endAt)}`;
  return status === "archived" ? `${period} · ${language === "ko" ? "종료" : "Ended"}` : period;
}
