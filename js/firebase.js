// Firebase access for one artist's archive.
// Firebase web configuration is public by design, but every artist should use
// restrictive Firestore Security Rules before publishing.

import { siteConfig, hasFirebaseConfiguration } from "./site-config.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import {
  getFirestore, collection, addDoc, serverTimestamp, getCountFromServer,
  getDocs, query, orderBy, limit, doc, updateDoc, deleteDoc, setDoc, getDoc
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

let db = null;
let memoryCache = null;

function getDb() {
  if (!hasFirebaseConfiguration()) {
    throw new Error("FIREBASE_NOT_CONFIGURED: Add this artist's Firebase web configuration to js/site-config.js.");
  }

  if (!db) db = getFirestore(initializeApp(siteConfig.firebase));
  return db;
}

function getCollection(name) {
  return collection(getDb(), name);
}

function normalizeMemory(docSnapshot) {
  const data = docSnapshot.data();
  const text = typeof data.memory === "string" ? data.memory.trim() : "";
  return text ? { id: docSnapshot.id, text } : null;
}

export async function saveMemory(memoryText) {
  const text = memoryText.trim();
  if (!text) throw new Error("EMPTY_MEMORY");
  if (text.length > 80) throw new Error("TOO_LONG_MEMORY");

  const docRef = await addDoc(getCollection(siteConfig.collections.memories), {
    memory: text,
    createdAt: serverTimestamp(),
    random: Math.random(),
    exhibition: siteConfig.artist.artworkTitle,
    artist: siteConfig.artist.name,
    archive: siteConfig.brand,
    version: siteConfig.version,
    language: document.documentElement.lang || "unknown"
  });

  memoryCache = null;
  return { id: docRef.id, text };
}

export async function getMemoryCount() {
  const snapshot = await getCountFromServer(getCollection(siteConfig.collections.memories));
  return snapshot.data().count;
}

export async function getRandomMemory(excludedIds = []) {
  if (!memoryCache) {
    const snapshot = await getDocs(getCollection(siteConfig.collections.memories));
    memoryCache = snapshot.docs.map(normalizeMemory).filter(Boolean);
  }

  const excluded = new Set(excludedIds);
  const available = memoryCache.filter((memory) => !excluded.has(memory.id));
  if (!available.length) return null;
  return available[Math.floor(Math.random() * available.length)];
}

export async function saveDebugLog(log) {
  return addDoc(getCollection(siteConfig.collections.debugLogs), {
    ...log,
    createdAtServer: serverTimestamp()
  });
}

export async function getDebugLogs() {
  const snapshot = await getDocs(query(
    getCollection(siteConfig.collections.debugLogs),
    orderBy("createdAtServer", "desc")
  ));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export async function saveUsageLog(type = "visit", detail = {}) {
  return addDoc(getCollection(siteConfig.collections.usageLogs), {
    type,
    detail,
    page: location.pathname.split("/").pop(),
    url: location.href,
    userAgent: navigator.userAgent,
    language: document.documentElement.lang || "unknown",
    createdAt: serverTimestamp(),
    createdAtLocal: new Date().toISOString()
  });
}

export async function getArchiveStats() {
  const memorySnapshot = await getDocs(getCollection(siteConfig.collections.memories));
  const memories = memorySnapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
  const totalMemories = memories.length;
  const koCount = memories.filter((item) => item.language === "ko").length;
  const enCount = memories.filter((item) => item.language === "en").length;
  const usageSnapshot = await getDocs(query(
    getCollection(siteConfig.collections.usageLogs), orderBy("createdAt", "desc"), limit(100)
  ));

  return {
    totalMemories,
    language: { ko: koCount, en: enCount, unknown: totalMemories - koCount - enCount },
    usageLogs: usageSnapshot.docs.map((item) => ({ id: item.id, ...item.data() }))
  };
}

export async function saveUpdateLog(data) {
  return addDoc(getCollection(siteConfig.collections.updateLogs), {
    ...data,
    createdAt: serverTimestamp()
  });
}

export async function getUpdateLogs() {
  const snapshot = await getDocs(query(
    getCollection(siteConfig.collections.updateLogs), orderBy("createdAt", "desc")
  ));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export async function getAllMemories() {
  const snapshot = await getDocs(query(
    getCollection(siteConfig.collections.memories), orderBy("createdAt", "desc")
  ));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export async function updateMemory(memoryId, newText) {
  const text = newText.trim();
  if (!text) throw new Error("EMPTY_MEMORY");
  if (text.length > 80) throw new Error("TOO_LONG_MEMORY");
  return updateDoc(doc(getDb(), siteConfig.collections.memories, memoryId), {
    memory: text,
    updatedAt: serverTimestamp()
  });
}

export async function deleteMemory(memoryId) {
  const memoryDoc = doc(getDb(), siteConfig.collections.memories, memoryId);
  const trashDoc = doc(getDb(), siteConfig.collections.trashMemories, memoryId);
  const snapshot = await getDoc(memoryDoc);
  if (!snapshot.exists()) throw new Error("MEMORY_NOT_FOUND");

  await setDoc(trashDoc, {
    ...snapshot.data(), originalId: memoryId, deletedAt: serverTimestamp()
  });
  return deleteDoc(memoryDoc);
}

export async function getTrashMemories() {
  const snapshot = await getDocs(query(
    getCollection(siteConfig.collections.trashMemories), orderBy("deletedAt", "desc")
  ));
  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }));
}

export async function restoreMemory(memoryId) {
  const trashDoc = doc(getDb(), siteConfig.collections.trashMemories, memoryId);
  const memoryDoc = doc(getDb(), siteConfig.collections.memories, memoryId);
  const snapshot = await getDoc(trashDoc);
  if (!snapshot.exists()) throw new Error("TRASH_MEMORY_NOT_FOUND");

  const { originalId, deletedAt, ...restoredData } = snapshot.data();
  await setDoc(memoryDoc, { ...restoredData, restoredAt: serverTimestamp() });
  return deleteDoc(trashDoc);
}
