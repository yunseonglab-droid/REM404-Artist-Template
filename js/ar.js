// js/ar.js
import { createArchiveController } from "./archive.js";
import { createHapticController } from "./haptic.js";
import { getText } from "./lang/language.js";
import { logDebugError } from "./debugLogger.js";
import { siteConfig } from "./site-config.js";

const t = getText();

const statusEl = document.getElementById("status");
const subEl = document.getElementById("sub");
const uiEl = document.getElementById("ui");
const guideEl = document.getElementById("guide");
const loadingText = document.getElementById("loadingText");

const target01 = document.getElementById("target01");
const target02 = document.getElementById("target02");

const overlay01 = document.getElementById("aiOverlay01");
const overlay02 = document.getElementById("aiOverlay02");

let activeOverlay = overlay01;
const memoryBtn = document.getElementById("memoryBtn");
const rescanBtn = document.getElementById("rescanBtn");
const flash = document.getElementById("flash");

const archiveScreen = document.getElementById("archiveScreen");
const archiveForm = document.getElementById("archiveForm");
const archiveComplete = document.getElementById("archiveComplete");
const memoryInput = document.getElementById("memoryInput");
const charCount = document.getElementById("charCount");
const submitMemoryBtn = document.getElementById("submitMemoryBtn");
const memoryCount = document.getElementById("memoryCount");
const anonymousMemoryArea = document.getElementById("anonymousMemoryArea");
const viewMemoryBtn = document.getElementById("viewMemoryBtn");
const nextRandomMemory = document.getElementById("nextRandomMemory");
const anotherArtworkBtn = document.getElementById("anotherArtworkBtn");
const sharedMemory = document.getElementById("sharedMemory");
const sharedMemoryText = document.getElementById("sharedMemoryText");
const prepareOverlay = document.getElementById("prepareOverlay");
const prepareTitle = document.getElementById("prepareTitle");
const prepareLabel = document.getElementById("prepareLabel");
const prepareText = document.getElementById("prepareText");
const prepareStartBtn = document.getElementById("prepareStartBtn");

const FAST_REVEAL_DURATION = 1000;
const SLOW_REVEAL_DURATION = 3000;
const INITIAL_RENDER_OPACITY = 0.4;
const MID_BLUR = 5;
const MAX_BLUR = 10;

const FAIL_HINT_1 = 3000;
const FAIL_HINT_2 = 6000;
const BUTTON_NUDGE_TIME = 10000;
const ARCHIVE_ENTER_DELAY = 120;
const RECOGNITION_STABLE_DELAY = 180;
const RECOGNITION_FEEDBACK_DURATION = 400;
const RECOGNITION_HAPTIC_DURATION = 25;
const RECOVERY_COMPLETE_DELAY = 500;
const ANONYMOUS_MEMORY_DELAY = 300;

let animationFrame = null;
let startTime = null;
let isImageReady = false;
let hasOpenedArchive = false;
let foundOnce = false;
let isTargetActive = false;
let isExperienceLocked = false;

let hintTimer1 = null;
let hintTimer2 = null;
let nudgeTimer = null;
let uiFadeTimer = null;
let guideFadeTimer = null;
let recognitionStableTimer = null;
let recognitionRevealTimer = null;
let recoveryCompleteTimer = null;

let firebaseApi = null;
let recognitionWatchTimer = null;
let hasDetectedAnyTarget = false;
let prepareTextTimer = null;
let sceneEl = null;

if (prepareStartBtn) {
  prepareStartBtn.disabled = true;
}

const haptic = createHapticController(RECOGNITION_HAPTIC_DURATION);
const restoreSound = new Audio("./audio/restore.mp3");

restoreSound.preload = "auto";
restoreSound.volume = 0.75;

// ===== Added : Recovery Sound =====
const recoverySound = new Audio("./audio/recovery.mp3");

recoverySound.preload = "auto";
recoverySound.volume = 0.6;
// ===== End : Recovery Sound =====

let isSoundUnlocked = false;

function unlockAllSounds() {
  if (isSoundUnlocked) return;

  const sounds = [
    { audio: restoreSound, volume: 0.75 },
    { audio: recoverySound, volume: 0.6 }
  ];

  Promise.allSettled(
    sounds.map(({ audio, volume }) => {
      audio.volume = 0;

      return audio.play()
        .then(() => {
          audio.pause();
          audio.currentTime = 0;
          audio.volume = volume;
        })
        .catch((error) => {
          audio.volume = volume;
          throw error;
        });
    })
  ).then(() => {
    isSoundUnlocked = true;
  });
}

// ===== Added : Recovery Sound Safe Player =====

function playRecoverySound() {
  if (!recoverySound) return;

  try {
    restoreSound.pause();
    restoreSound.currentTime = 0;

    recoverySound.pause();
    recoverySound.currentTime = 0;
    recoverySound.volume = 0.6;

    const playPromise = recoverySound.play();

    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.warn("Recovery sound play failed:", error);

        logDebugError("ARTARCHIVE-E-AUDIO-002", {
          message: "Recovery sound play failed",
          error: String(error)
        });
      });
    }
  } catch (error) {
    console.warn("Recovery sound error:", error);

    logDebugError("ARTARCHIVE-E-AUDIO-002", {
      message: "Recovery sound error",
      error: String(error)
    });
  }
}

// ===== End : Recovery Sound Safe Player =====

const archive = createArchiveController({
  elements: {
    uiEl,
    guideEl,
    memoryBtn,
    flash,
    archiveScreen,
    archiveForm,
    archiveComplete,
    memoryInput,
    charCount,
    submitMemoryBtn,
    memoryCount,
    anonymousMemoryArea,
    viewMemoryBtn,
    sharedMemory,
    sharedMemoryText
  },
  loadFirebaseApi,
  constants: {
    ARCHIVE_ENTER_DELAY,
    ANONYMOUS_MEMORY_DELAY
  },
  callbacks: {
    setHasOpenedArchive(value) {
      hasOpenedArchive = value;
    },
    clearNudgeTimer() {
      clearTimeout(nudgeTimer);
    },
    triggerSuccessHaptic() {
      haptic.success();
    },
    playRestoreSound() {
      restoreSound.pause();
      restoreSound.currentTime = 0;
      restoreSound.volume = 0.75;

      const playPromise = restoreSound.play();

      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.warn("Restore sound play failed:", error);
          logDebugError("ARTARCHIVE-E-AUDIO-001", {
            message: "Restore sound play failed",
            error: String(error)
          });
        });
      }
    }
  }
});

async function loadFirebaseApi() {
  if (firebaseApi) return firebaseApi;

  try {
    firebaseApi = await import("./firebase.js");
    return firebaseApi;
  } catch (error) {
    console.error("Firebase module load failed:", error);

    logDebugError("ARTARCHIVE-E-FIRE-001", {
      message: "Firebase module load failed",
      error: String(error)
    });

    return null;
  }
}

function easeOutMemory(value) {
  return 1 - Math.pow(1 - value, 3);
}

function setInstruction(mainText, subHtml) {
  statusEl.textContent = mainText;
  subEl.innerHTML = subHtml;
}

function startPrepareOverlay() {
  const messages = t.prepare.messages;

  let index = 0;

  prepareText.textContent = messages[0];

  prepareTextTimer = setInterval(() => {
    index++;

    prepareText.textContent =
      messages[index % messages.length];
  }, 1200);
}

function setPrepareReady() {
  if (!prepareStartBtn || !prepareText) return;

  prepareText.textContent = t.prepare.ready;
  prepareStartBtn.disabled = false;
}

function applyArchiveScreenText() {
  document.title = `${siteConfig.brand} — ${siteConfig.artist.artworkTitle}`;

  if (loadingText) {
    const loadingTextLabel = document.getElementById("loadingTextLabel");
    if (loadingTextLabel) {
      loadingTextLabel.textContent = t.archiveScreen.loadingText;
    }
  }

  const archiveFormLabel = document.getElementById("archiveFormLabel");
  const archiveFormTitle = document.getElementById("archiveFormTitle");
  const archiveFormQuestion = document.getElementById("archiveFormQuestion");

  const archiveCompleteLabel = document.getElementById("archiveCompleteLabel");
  const archiveCompleteTitle = document.getElementById("archiveCompleteTitle");
  const archiveCompleteText = document.getElementById("archiveCompleteText");

  const countLabel = document.getElementById("countLabel");
  const countDesc = document.getElementById("countDesc");
  const viewMemoryHint = document.getElementById("viewMemoryHint");

  const memoryViewerArchiveLabel = document.getElementById("memoryViewerArchiveLabel");
  const memoryViewerLabel = document.getElementById("memoryViewerLabel");
  const memoryViewerHint = document.getElementById("memoryViewerHint");

  if (archiveFormLabel) archiveFormLabel.textContent = t.archiveScreen.archiveLabel;
  if (archiveFormTitle) archiveFormTitle.textContent = t.archiveScreen.formTitle;
  if (archiveFormQuestion) archiveFormQuestion.textContent = t.archiveScreen.formQuestion;
  if (memoryInput) memoryInput.placeholder = t.archiveScreen.inputPlaceholder;

  if (archiveCompleteLabel) archiveCompleteLabel.textContent = t.archiveScreen.archiveLabel;
  if (archiveCompleteTitle) archiveCompleteTitle.textContent = t.archiveScreen.completeTitle;
  if (archiveCompleteText) archiveCompleteText.innerHTML = t.archiveScreen.completeText;

  if (countLabel) countLabel.textContent = t.archiveScreen.countLabel;
  if (countDesc) countDesc.innerHTML = t.archiveScreen.countDesc;
  if (viewMemoryHint) viewMemoryHint.textContent = t.archiveScreen.viewMemoryHint;

  if (memoryViewerArchiveLabel) memoryViewerArchiveLabel.textContent = t.archiveScreen.archiveLabel;
  if (memoryViewerLabel) memoryViewerLabel.textContent = t.archiveScreen.viewerLabel;
  if (memoryViewerHint) memoryViewerHint.textContent = t.archiveScreen.viewerHint;
  if (memoryBtn) memoryBtn.textContent = t.buttons.leaveMemory;
  if (submitMemoryBtn) submitMemoryBtn.textContent = t.buttons.submitMemory;
  if (viewMemoryBtn) viewMemoryBtn.textContent = t.buttons.viewMemory;
  if (nextRandomMemory) nextRandomMemory.textContent = t.buttons.nextMemory;

  if (prepareTitle) {
    prepareTitle.textContent = t.prepare.title;
  }

  if (prepareLabel) {
    prepareLabel.textContent = siteConfig.brand;
  }

  if (prepareStartBtn) {
    prepareStartBtn.textContent = t.prepare.startButton;
  }
}

function setOpacity(value) {
  if (!activeOverlay) return;
  activeOverlay.setAttribute("material", "opacity", value);
}

function setCanvasBlur(value) {
  const canvas = document.querySelector("canvas");
  if (canvas) canvas.style.filter = `blur(${value}px)`;
}

function clearHintTimers() {
  clearTimeout(hintTimer1);
  clearTimeout(hintTimer2);
}

function clearRecognitionTimers() {
  clearTimeout(recognitionStableTimer);
  clearTimeout(recognitionRevealTimer);
}

function clearUiTimers() {
  clearTimeout(uiFadeTimer);
  clearTimeout(guideFadeTimer);
}

function clearMemoryFlowTimers() {
  clearTimeout(nudgeTimer);
  clearTimeout(recoveryCompleteTimer);
}

function clearAllTimers() {
  clearHintTimers();
  clearRecognitionTimers();
  clearUiTimers();
  clearMemoryFlowTimers();
}

function stopFade() {
  if (animationFrame) cancelAnimationFrame(animationFrame);
  animationFrame = null;
  startTime = null;
  setOpacity(0);
  setCanvasBlur(0);
}

function resetMemoryButton() {
  isImageReady = false;
  hasOpenedArchive = false;
  isExperienceLocked = false;

  memoryBtn.textContent = t.buttons.leaveMemory;
  memoryBtn.classList.remove("show");
  memoryBtn.classList.remove("nudge");
}

function nudgeMemoryButton() {
  if (!isImageReady || hasOpenedArchive) return;
  memoryBtn.classList.remove("nudge");
  void memoryBtn.offsetWidth;
  memoryBtn.classList.add("nudge");
}

function showMemoryButton() {
  setInstruction(
    t.status.memoryRestored,
    t.status.memoryRestoredSub
  );

  recoveryCompleteTimer = setTimeout(() => {
    if (!isTargetActive || hasOpenedArchive) return;

    isImageReady = true;
    hasOpenedArchive = false;
    isExperienceLocked = true;

    memoryBtn.textContent = t.buttons.leaveMemory;
    memoryBtn.classList.add("show");

    if (rescanBtn) {
      rescanBtn.textContent = t.buttons.rescanSpace;
      rescanBtn.classList.add("show");
    }

    nudgeTimer = setTimeout(() => {
      nudgeMemoryButton();
    }, BUTTON_NUDGE_TIME);
  }, RECOVERY_COMPLETE_DELAY);
}

function startFailHints() {
  clearHintTimers();

  hintTimer1 = setTimeout(() => {
    if (!foundOnce) {
      setInstruction(
        t.status.alignPhoto,
        t.status.alignPhotoSub
      );
    }
  }, FAIL_HINT_1);

  hintTimer2 = setTimeout(() => {
    if (!foundOnce) {
      setInstruction(
        t.status.avoidGlare,
        t.status.avoidGlareSub
      );
    }
  }, FAIL_HINT_2);
}

function stopFailHints() {
  clearHintTimers();
}

function fadeInstructionLater() {
  uiFadeTimer = setTimeout(() => {
    uiEl.classList.add("fade");
  }, 5000);

  guideFadeTimer = setTimeout(() => {
    guideEl.classList.add("fade");
  }, 7500);
}

function startFade() {
  stopFade();
  resetMemoryButton();

  startTime = performance.now();

  function animate(now) {
    const elapsed = now - startTime;
    const slowStartTime = FAST_REVEAL_DURATION;
    const totalDuration = FAST_REVEAL_DURATION + SLOW_REVEAL_DURATION;

    let opacity;
    let blurAmount;

    if (elapsed <= slowStartTime) {
      const fastProgress = Math.min(elapsed / FAST_REVEAL_DURATION, 1);
      const easedFastProgress = easeOutMemory(fastProgress);

      opacity = INITIAL_RENDER_OPACITY * easedFastProgress;
      blurAmount = MAX_BLUR - ((MAX_BLUR - MID_BLUR) * easedFastProgress);
    } else {
      const slowProgress = Math.min((elapsed - slowStartTime) / SLOW_REVEAL_DURATION, 1);
      const easedSlowProgress = easeOutMemory(slowProgress);

      opacity = INITIAL_RENDER_OPACITY + ((1 - INITIAL_RENDER_OPACITY) * easedSlowProgress);
      blurAmount = MID_BLUR * (1 - easedSlowProgress);
    }

    setOpacity(Math.min(opacity, 1));
    setCanvasBlur(Math.max(0, blurAmount));

    if (elapsed < totalDuration) {
      animationFrame = requestAnimationFrame(animate);
    } else {
      setOpacity(1);
      setCanvasBlur(0);
      showMemoryButton();
    }
  }

  animationFrame = requestAnimationFrame(animate);
}

function hideIntroUI() {
  loadingText.classList.add("hide");
}

function handleTargetFound(overlay) {
  if (isTargetActive) return;

  activeOverlay = overlay;
  hasDetectedAnyTarget = true;
  clearTimeout(recognitionWatchTimer);
  isTargetActive = true;
  foundOnce = true;

  stopFailHints();
  clearRecognitionTimers();
  clearUiTimers();

  hideIntroUI();

  recognitionStableTimer = setTimeout(() => {
    if (!isTargetActive) return;

    haptic.vibrateOnce();

    setInstruction(
      t.status.memoryFound,
      t.status.memoryFoundSub
    );

    recognitionRevealTimer = setTimeout(() => {
      if (!isTargetActive) return;

      // ===== Added : Recovery Sound =====
playRecoverySound();
// ===== End : Recovery Sound =====
      
      startFade();
      fadeInstructionLater();
    }, RECOGNITION_FEEDBACK_DURATION);
  }, RECOGNITION_STABLE_DELAY);
}

function resetForNewScan() {
  isImageReady = false;
  hasOpenedArchive = false;
  isExperienceLocked = false;
  isTargetActive = false;
  foundOnce = false;
  hasDetectedAnyTarget = false;
  clearTimeout(recognitionWatchTimer);

  clearAllTimers();
  haptic.reset();
  stopFade();

  memoryBtn.classList.remove("show");
  memoryBtn.classList.remove("nudge");

  if (rescanBtn) {
    rescanBtn.classList.remove("show");
  }

  uiEl.classList.remove("fade");
  guideEl.classList.remove("fade");
  loadingText.classList.remove("hide");

  setInstruction(
    t.status.alignPhoto,
    t.status.alignPhotoSub
  );

  startFailHints();
  recognitionWatchTimer = setTimeout(() => {
    if (!hasDetectedAnyTarget) {
      logDebugError("ARTARCHIVE-E-MIND-002", {
        message: "No image target detected within 15 seconds after rescan",
        targetCount: 2
      });
    }
  }, 15000);
}

function handleTargetLost() {
  if (archive.isArchiveOpen()) return;

  if (isExperienceLocked) {
    return;
  }

  isTargetActive = false;
  foundOnce = false;
  haptic.reset();
  clearAllTimers();

  setInstruction(
    t.status.targetLost,
    t.status.targetLostSub
  );

  uiEl.classList.remove("fade");
  guideEl.classList.remove("fade");
  loadingText.classList.remove("hide");

  resetMemoryButton();
  stopFade();
  startFailHints();
}

window.addEventListener("load", () => {
  foundOnce = false;
  sceneEl = document.querySelector("a-scene");

  applyArchiveScreenText();
  startPrepareOverlay();

  if (sceneEl) {
    if (sceneEl.hasLoaded) {
      setTimeout(() => {
        setPrepareReady();
      }, 900);
    } else {
      sceneEl.addEventListener("loaded", () => {
        setTimeout(() => {
          setPrepareReady();
        }, 900);
      });
    }
  }

  setInstruction(
    t.status.alignPhoto,
    t.status.alignPhotoSub
  );

  startFailHints();
  loadFirebaseApi();
  recognitionWatchTimer = setTimeout(() => {
    if (!hasDetectedAnyTarget) {
      logDebugError("ARTARCHIVE-E-MIND-002", {
        message: "No image target detected within 15 seconds",
        targetCount: 2
      });
    }
  }, 15000);
});

target01.addEventListener("targetFound", () => {
  handleTargetFound(overlay01);
});

target01.addEventListener("targetLost", () => {
  handleTargetLost();
});

target02.addEventListener("targetFound", () => {
  handleTargetFound(overlay02);
});

target02.addEventListener("targetLost", () => {
  handleTargetLost();
});

if (prepareStartBtn) {
  prepareStartBtn.addEventListener("click", async () => {
    unlockAllSounds();
    prepareStartBtn.disabled = true;

    prepareText.textContent = t.prepare.requesting;

    try {
      if (!sceneEl) sceneEl = document.querySelector("a-scene");

      const mindarSystem = sceneEl.systems["mindar-image-system"];
      await mindarSystem.start();

      clearInterval(prepareTextTimer);
      prepareOverlay.classList.add("hide");

      setTimeout(() => {
        prepareOverlay.style.display = "none";
      }, 500);
    } catch (error) {
      console.error("MindAR start failed:", error);

      logDebugError("ARTARCHIVE-E-MIND-START", {
        message: "MindAR start failed",
        error: String(error)
      });

      prepareStartBtn.disabled = false;

      prepareText.textContent = t.prepare.failed;
    }
  });
}

memoryBtn.addEventListener("click", () => {
  if (!isImageReady || hasOpenedArchive) return;
  archive.openArchive();
});

if (rescanBtn) {
  rescanBtn.addEventListener("click", () => {
    resetForNewScan();
  });
}
// ===== Added : View Another Artwork =====

if (anotherArtworkBtn) {
  anotherArtworkBtn.addEventListener("click", () => {
    archive.closeArchive();
    resetForNewScan();
  });
}

// ===== End : View Another Artwork =====
archive.bindArchiveEvents();
