import { openDB } from "idb";

const DB_NAME = "story-explorer-db";
const STORE_NAME = "saved-stories";

const dbPromise = openDB(DB_NAME, 1, {
  upgrade(db) {
    db.createObjectStore(STORE_NAME, { keyPath: "id" });
  },
});

export async function saveStoryToIDB(story) {
  const db = await dbPromise;
  return db.put(STORE_NAME, story);
}

export async function getAllSavedStories() {
  const db = await dbPromise;
  return db.getAll(STORE_NAME);
}
