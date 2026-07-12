// js/archive.js

import { getText } from "./lang/language.js";

const t = getText();

export function createArchiveController({ elements, loadFirebaseApi, constants, callbacks }) {
  const {
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
    sharedMemoryText,
    memoryViewer = document.getElementById("memoryViewer"),
    nextRandomMemory = document.getElementById("nextRandomMemory")
  } = elements;

  const {
    ARCHIVE_ENTER_DELAY,
    ANONYMOUS_MEMORY_DELAY
  } = constants;
  
  const viewedMemoryIds = new Set();
  let savedMemoryId = null;
  let prefetchedRandomMemory = null;
  
  function cameraFlash() {
    flash.style.opacity = "1";

    setTimeout(() => {
      flash.style.opacity = "0";
    }, 150);
  }

  function openArchive() {
    callbacks.setHasOpenedArchive(true);
    callbacks.clearNudgeTimer();

    cameraFlash();
    callbacks.playRestoreSound();
    memoryBtn.classList.remove("show");
    uiEl.classList.add("fade");
    guideEl.classList.add("fade");

    setTimeout(() => {
      archiveScreen.classList.add("show");
    }, ARCHIVE_ENTER_DELAY);
  }

  function showArchiveComplete() {
    archiveForm.classList.add("hide");
    archiveComplete.classList.add("show");

    requestAnimationFrame(() => {
      archiveComplete.classList.add("visible");
    });
  }

  function showMemoryViewer() {
    if (!memoryViewer) return;

    archiveComplete.classList.remove("visible");

    setTimeout(() => {
      archiveComplete.classList.remove("show");
      memoryViewer.classList.add("show");

      requestAnimationFrame(() => {
        memoryViewer.classList.add("visible");
      });
    }, 320);
  }

  function animateCount(from, to, onComplete) {
    const displayTo = to > from ? to : from + 1;
    const duration = 1500;
    const start = performance.now();
    const countDistance = displayTo - from;

    memoryCount.style.willChange = "transform, opacity";
    memoryCount.style.transformOrigin = "center";
    memoryCount.style.transform = "translateX(0) scale(1)";
    memoryCount.style.opacity = "0.92";

    function easeOutCubic(value) {
      return 1 - Math.pow(1 - value, 3);
    }

    function update(now) {
      const progress = Math.min((now - start) / duration, 1);
      const easedProgress = easeOutCubic(progress);
      const value = Math.round(from + (countDistance * easedProgress));

      const pulse = Math.sin(progress * Math.PI) * 0.022;
      const tremble = Math.sin(progress * Math.PI * 18) * 0.28 * (1 - progress);

      memoryCount.textContent = value.toLocaleString();
      memoryCount.style.transform = `translateX(${tremble}px) scale(${1 + pulse})`;
      memoryCount.style.opacity = `${0.93 + (pulse * 2)}`;

      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        memoryCount.textContent = displayTo.toLocaleString();
        memoryCount.style.transform = "translateX(0) scale(1)";
        memoryCount.style.opacity = "1";
        memoryCount.style.willChange = "auto";

        if (typeof onComplete === "function") {
          onComplete();
        }
      }
    }

    requestAnimationFrame(update);
  }
  function formatMemoryText(text) {
    const length = text.length;

    const formattedText = text
      .replace(/,\s*/g, ",\n")
      .replace(/\.\s*/g, ".\n\n");

    if (length > 55) {
      sharedMemoryText.classList.add("long-memory");
    } else {
      sharedMemoryText.classList.remove("long-memory");
    }

    return formattedText.trim();
  }
  
  async function showRandomMemory(triggerButton = viewMemoryBtn) {
    const shouldOpenViewer = triggerButton === viewMemoryBtn;

  if (triggerButton) {
    triggerButton.disabled = true;
    triggerButton.textContent = t.buttons.loadingMemory;
  }

  if (sharedMemory) {
    sharedMemory.classList.remove("show");
  }

  const api = await loadFirebaseApi();

  if (!api || !api.getRandomMemory) {
   setTimeout(() => {
  if (sharedMemoryText) {
    sharedMemoryText.textContent = t.archive.loadFailed;
  }

  if (shouldOpenViewer) showMemoryViewer();
  if (sharedMemory) sharedMemory.classList.add("show");

  if (triggerButton) {
    triggerButton.textContent = triggerButton === nextRandomMemory
      ? t.buttons.nextMemory
      : t.buttons.viewMemory;
    triggerButton.disabled = false;
  }
}, 300);
    return;
  }

  try {
    const excludedIds = [...viewedMemoryIds];

    if (savedMemoryId) {
      excludedIds.push(savedMemoryId);
    }

    let randomMemory = prefetchedRandomMemory;

if (randomMemory && excludedIds.includes(randomMemory.id)) {
  randomMemory = null;
}

prefetchedRandomMemory = null;

if (!randomMemory) {
  randomMemory = await api.getRandomMemory(excludedIds);
}

    setTimeout(() => {
      if (sharedMemoryText) {
        if (randomMemory) {
          sharedMemoryText.textContent = formatMemoryText(randomMemory.text);
          viewedMemoryIds.add(randomMemory.id);
        } else {
          sharedMemoryText.innerHTML = `
            <strong>${t.archive.allReadTitle}</strong><br>
            ${t.archive.allReadSub}
          `;
          viewedMemoryIds.clear();
        }
      }

      if (shouldOpenViewer) showMemoryViewer();
      if (sharedMemory) sharedMemory.classList.add("show");

      if (triggerButton) {
        triggerButton.textContent = triggerButton === nextRandomMemory
          ? t.buttons.nextMemory
          : t.buttons.viewMemory;
        triggerButton.disabled = false;
      }
    }, 120);
    
    } catch (error) {
    console.error(error);

    setTimeout(() => {
      if (sharedMemoryText) {
        sharedMemoryText.textContent = t.archive.loadFailed;
      }

      if (shouldOpenViewer) showMemoryViewer();
      if (sharedMemory) sharedMemory.classList.add("show");

      if (triggerButton) {
        triggerButton.textContent = triggerButton === nextRandomMemory
          ? t.buttons.nextMemory
          : t.buttons.viewMemory;
        triggerButton.disabled = false;
      }
    }, 300);
  }
}
  function bindArchiveEvents() {
    memoryInput.addEventListener("input", () => {
      charCount.textContent = `${memoryInput.value.length} / 80`;
    });

    submitMemoryBtn.addEventListener("click", async () => {
      const text = memoryInput.value.trim();

      if (!text) {
        memoryInput.focus();
        return;
      }

      submitMemoryBtn.disabled = true;
      submitMemoryBtn.textContent = t.buttons.savingMemory;

      const api = await loadFirebaseApi();

      if (!api || !api.saveMemory) {
        alert(t.archive.systemLoadFailed);
        submitMemoryBtn.disabled = false;
        submitMemoryBtn.textContent = t.buttons.submitMemory;
        return;
      }

     try {
const savedMemory = await api.saveMemory(text);

savedMemoryId = savedMemory.id;
viewedMemoryIds.add(savedMemory.id);

if (callbacks.triggerSuccessHaptic) {
  callbacks.triggerSuccessHaptic();
}

showArchiveComplete();

anonymousMemoryArea.classList.remove("show");
       api.getRandomMemory([savedMemoryId])
  .then((memory) => {
    prefetchedRandomMemory = memory;
  })
  .catch((error) => {
    console.warn("Random memory prefetch failed:", error);
  });

if (api.getMemoryCount) {
  api.getMemoryCount()
    .then((count) => {
      animateCount(0, count, () => {
        setTimeout(() => {
          anonymousMemoryArea.classList.add("show");
        }, ANONYMOUS_MEMORY_DELAY);
      });
    })
    .catch(() => {
      memoryCount.textContent = "-";
      anonymousMemoryArea.classList.add("show");
    });
  
} else {
  memoryCount.textContent = "-";
  anonymousMemoryArea.classList.add("show");
}
      } catch (error) {
        console.error(error);

        alert(`${t.archive.saveFailed}\n\n${error.message}`);

        submitMemoryBtn.disabled = false;
        submitMemoryBtn.textContent = t.buttons.submitMemory;
      }
      
    });

    viewMemoryBtn.addEventListener("click", () => {
      showRandomMemory(viewMemoryBtn);
    });

    if (nextRandomMemory) {
      nextRandomMemory.addEventListener("click", () => {
        showRandomMemory(nextRandomMemory);
      });
    }
  }

  // ===== Added : Close Archive for Another Artwork =====

  function closeArchive() {
    callbacks.setHasOpenedArchive(false);
    callbacks.clearNudgeTimer();

    archiveScreen.classList.remove("show");
archiveScreen.classList.remove("visible");

    archiveForm.classList.remove("hide");

    archiveComplete.classList.remove("show");
    archiveComplete.classList.remove("visible");

    if (memoryViewer) {
      memoryViewer.classList.remove("show");
      memoryViewer.classList.remove("visible");
    }

    if (sharedMemory) {
      sharedMemory.classList.remove("show");
    }

    if (sharedMemoryText) {
      sharedMemoryText.textContent = "";
      sharedMemoryText.classList.remove("long-memory");
    }

    anonymousMemoryArea.classList.remove("show");

    memoryInput.value = "";
    charCount.textContent = "0 / 80";

    submitMemoryBtn.disabled = false;
    submitMemoryBtn.textContent = t.buttons.submitMemory;

    viewMemoryBtn.disabled = false;
    viewMemoryBtn.textContent = t.buttons.viewMemory;

    if (nextRandomMemory) {
      nextRandomMemory.disabled = false;
      nextRandomMemory.textContent = t.buttons.nextMemory;
    }

    savedMemoryId = null;
    prefetchedRandomMemory = null;
    viewedMemoryIds.clear();
  }

  // ===== End : Close Archive for Another Artwork =====
  
  function isArchiveOpen() {
    return archiveScreen.classList.contains("show");
  }

   return {
    bindArchiveEvents,
    openArchive,
    closeArchive,
    isArchiveOpen
  };
}
