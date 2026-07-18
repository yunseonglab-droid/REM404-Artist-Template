// Copy this template for each artist/exhibition, then change only this file
// before publishing. Do not put secret server credentials in a GitHub Pages site.
export const siteConfig = {
  siteId: "artist-archive-template",
  brand: "ART ARCHIVE",
  version: "v1.1.0",

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
