function inferExhibitionId() {
  if (typeof location === "undefined") return "artist-archive-template";
  const repositoryName = decodeURIComponent(location.pathname.split("/").filter(Boolean)[0] || "artist-archive-template");
  return repositoryName
    .trim()
    .toLowerCase()
    .replace(/\.git$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "artist-archive-template";
}

// Every exhibition repository uses this same template. Public exhibition
// metadata is managed in the REM404 app and loaded by js/exhibition-config.js.
export const siteConfig = {
  siteId: inferExhibitionId(),
  brand: "ART ARCHIVE",
  version: "v1.3.0",

  platform: {
    projectId: "rem404",
    apiKey: "AIzaSyAst32Rk5IYFyeRsps8aX-tnUqkdH2usUA",
    exhibitionId: inferExhibitionId()
  },

  exhibition: {
    titleKo: "작품 제목",
    titleEn: "Artwork Title",
    descriptionKo: "",
    descriptionEn: "",
    status: "draft",
    startAt: null,
    endAt: null,
    publicUrl: null,
    updatedAt: null
  },

  artist: {
    name: "작가 이름 / Artist Name",
    artworkTitle: "작품 제목 / Artwork Title"
  },

  // Give every artist their own Firebase project whenever possible.
  firebase: {
    apiKey: "AIzaSyCm665mCq1T65nYgoQbsxLLKKnbs4cwHwo",
    authDomain: "rem404archive-01.firebaseapp.com",
    projectId: "rem404archive-01",
    storageBucket: "rem404archive-01.firebasestorage.app",
    messagingSenderId: "533609469013",
    appId: "1:533609469013:web:17b0b3c8f82f0259f9b0dc"
  },

  // Separate collection names keep data isolated if several artists share a
  // Firebase project. Change this prefix before the first public deployment.
  collections: {
    memories: "memories",
    debugLogs: "debugLogs",
    usageLogs: "usageLogs",
    updateLogs: "updateLogs",
    trashMemories: "trashMemories"
  },

  // This is only a light UI gate, not real security. Protect Firestore with
  // Firebase Authentication and Security Rules before a public exhibition.
  adminPassword: "2489",

  // Set enabled to true and add ./video/intro.mp4 after replacing the sample.
  intro: {
    enabled: false,
    video: "./video/intro.mp4"
  }
};

export function hasFirebaseConfiguration() {
  const { apiKey, authDomain, projectId, appId } = siteConfig.firebase;
  return Boolean(apiKey && authDomain && projectId && appId);
}
