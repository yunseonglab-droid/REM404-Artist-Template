// Copy this template for each artist/exhibition, then change only this file
// before publishing. Do not put secret server credentials in a GitHub Pages site.
export const siteConfig = {
  siteId: "artist-archive-template",
  brand: "ART ARCHIVE",
  version: "v1.0",

  artist: {
    name: "작가 이름 / Artist Name",
    artworkTitle: "작품 제목 / Artwork Title"
  },

  // Give every artist their own Firebase project whenever possible.
  // The web-app configuration below is intentionally blank in this template.
  firebase: {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
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
  adminPassword: "",

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
