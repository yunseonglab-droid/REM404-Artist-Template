// js/lang/language.js

import ko from "./ko.js";
import en from "./en.js";
import { siteConfig } from "../site-config.js";

const translations = {
  ko,
  en
};

const DEFAULT_LANGUAGE = "ko";
const STORAGE_KEY = `${siteConfig.siteId}:language`;

let currentLanguage = detectLanguage();

function isValidLanguage(language) {
  return Boolean(language && translations[language]);
}

function getUrlLanguage() {
  try {
    const params = new URLSearchParams(window.location.search);
    const urlLanguage = params.get("lang");

    if (isValidLanguage(urlLanguage)) {
      return urlLanguage;
    }

    return null;
  } catch (error) {
    return null;
  }
}

function getSavedLanguage() {
  try {
    const savedLanguage = localStorage.getItem(STORAGE_KEY);

    if (isValidLanguage(savedLanguage)) {
      return savedLanguage;
    }

    return null;
  } catch (error) {
    return null;
  }
}

function getBrowserLanguage() {
  try {
    if (navigator.language && navigator.language.startsWith("ko")) {
      return "ko";
    }

    return "en";
  } catch (error) {
    return DEFAULT_LANGUAGE;
  }
}

function detectLanguage() {
  const urlLanguage = getUrlLanguage();

  if (urlLanguage) {
    return urlLanguage;
  }

  const savedLanguage = getSavedLanguage();

  if (savedLanguage) {
    return savedLanguage;
  }

  return getBrowserLanguage();
}

export function getLanguage() {
  return currentLanguage;
}

export function getText() {
  const translation = translations[currentLanguage] || translations[DEFAULT_LANGUAGE];
  const exhibition = siteConfig.exhibition || {};
  const title = currentLanguage === "en"
    ? exhibition.titleEn || exhibition.titleKo
    : exhibition.titleKo || exhibition.titleEn;
  const description = currentLanguage === "en" ? exhibition.descriptionEn : exhibition.descriptionKo;
  const escapeHtml = (value) => String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
  return {
    ...translation,
    landing: {
      ...translation.landing,
      pageTitle: title || translation.landing.pageTitle,
      title: title || translation.landing.title,
      text: description ? escapeHtml(description).replace(/\r?\n/g, "<br>") : translation.landing.text
    }
  };
}

export function setLanguage(language) {
  if (!isValidLanguage(language)) return;

  currentLanguage = language;

  try {
    localStorage.setItem(STORAGE_KEY, language);
  } catch (error) {}
}
