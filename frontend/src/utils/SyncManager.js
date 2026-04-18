import { openDB } from 'idb';

const DB_NAME = 'resilio-offline-db';
const STORE_NAME = 'sync-queue';

export const initDB = async () => {
    return openDB(DB_NAME, 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
            }
        },
    });
};

export const addToSyncQueue = async (endpoint, payload, bypassOtpRoute = null) => {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    await tx.store.add({
        endpoint,
        payload,
        bypassOtpRoute, // Some forms e.g. RequestRelief bypass OTP if completely offline
        timestamp: new Date().toISOString()
    });
    await tx.done;
};

export const getSyncQueue = async () => {
    const db = await initDB();
    return db.getAll(STORE_NAME);
};

export const removeFromSyncQueue = async (id) => {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    await tx.store.delete(id);
    await tx.done;
};

export const clearSyncQueue = async () => {
    const db = await initDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    await tx.store.clear();
    await tx.done;
};
