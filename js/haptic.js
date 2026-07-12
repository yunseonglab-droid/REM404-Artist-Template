// js/haptic.js

export function createHapticController(duration) {
  let hasVibrated = false;

  function canVibrate() {
    return "vibrate" in navigator;
  }

  function vibrateOnce() {
    if (hasVibrated) return;
    if (!canVibrate()) return;

    navigator.vibrate(duration);
    hasVibrated = true;
  }

  function vibrate(durationMs = 20) {
    if (!canVibrate()) return;

    navigator.vibrate(durationMs);
  }

  function success() {
    vibrate(35);
  }

  function reset() {
    hasVibrated = false;
  }

  return {
    vibrateOnce,
    vibrate,
    success,
    reset
  };
}
