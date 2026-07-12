// js/lang/en.js
import { siteConfig } from "../site-config.js";

const { brand, version, artist } = siteConfig;

export default {
  status: {
    alignPhoto: "Align the photo within the frame.",
    alignPhotoSub: "Make sure the entire photo fits<br>inside the frame.",
    avoidGlare: "Align the photo within the frame.",
    avoidGlareSub: "Avoid glare and try again.",
    targetLost: "Point your camera at the photo again.",
    targetLostSub: "Make sure the photo fits inside the frame<br>and avoid glare.",
    memoryFound: "Memory found.",
    memoryFoundSub: "Restoring memory.",
    memoryRestored: "Memory restored.",
    memoryRestoredSub: "Leave a memory this place brings back.",
    searchingMemory: "Searching for memory..."
  },

  buttons: {
    leaveMemory: "Leave a Memory",
    submitMemory: "Leave a Memory",
    viewMemory: "View Another Memory",
    nextMemory: "View Another Memory",
    loadingMemory: "Loading memory...",
    savingMemory: "Saving memory...",
    rescanSpace: "Scan New Space"
  },

  archive: {
    loadFailed: "Could not load memory.",
    saveFailed: "Could not save memory. Please try again.",
    systemLoadFailed: "Could not load the memory system. Please try again.",
    allReadTitle: "You have read all memories.",
    allReadSub: "Come back when new memories are added."
  },
  
  landing: {
  pageTitle: artist.artworkTitle,
  version: `${brand} ${version}`,
  title: artist.artworkTitle.replace(/\s*\/\s*.*/, ""),
  text: "Point your camera at this artwork<br>to reveal another scene prepared by the artist.<br><br>Afterward, leave an anonymous memory<br>or thought from your experience.",
  notice: "This experience uses your smartphone camera.<br>No app installation is required.",
  startButton: "Start Experience",
  loading: "Opening the experience..."
  },
  
  archiveScreen: {
  loadingText: "Loading memory",
  archiveLabel: brand,
  formTitle: "Your Memory",
  formQuestion: "What did this place bring to mind?",
  inputPlaceholder: "Leave your memory in 80 characters.",
  completeTitle: "Thank you.",
  completeText: `Your memory has been saved<br>to ${brand}.`,
  countLabel: "So far",
  countDesc: "memories remain<br>in this place.",
  viewMemoryHint: "Read anonymous memories left by others.",
  viewerLabel: "ANONYMOUS MEMORY",
  viewerHint: "This is a memory someone left in this place."
},
  prepare: {
  title: "Preparing Memory Restoration",

  ready: "Memory Scanner Ready.",
  requesting: "Requesting camera permission...",
  failed: "Unable to open the camera. Please try again.",

  startButton: "Start Camera",

  messages: [
    "Accessing memory archive...",
    "Loading traces of this place...",
    "Initializing memory scanner...",
    "Preparing image recognition...",
    `Connecting to ${brand}...`
  ]
},
};
