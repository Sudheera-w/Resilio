import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import { getSyncQueue, removeFromSyncQueue } from "../utils/SyncManager";
import { NetworkContext } from "./NetworkContextObject";

export function NetworkProvider({ children }) {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [isSyncing, setIsSyncing] = useState(false);

    const syncPendingData = useCallback(async () => {
        const queue = await getSyncQueue();
        if (queue.length === 0) return;

        setIsSyncing(true);
        console.log(`[Sync] Found ${queue.length} pending offline records. Syncing...`);

        for (const record of queue) {
            try {
                const response = await fetch(record.endpoint, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(record.payload),
                });

                if (response.ok) {
                    await removeFromSyncQueue(record.id);
                    console.log(`[Sync] Record ${record.id} synced successfully.`);
                } else {
                    console.error(`[Sync] Server rejected record ${record.id}`);
                }
            } catch (error) {
                console.error(
                    `[Sync] Connection lost while syncing record ${record.id}`,
                    error
                );
                break;
            }
        }

        setIsSyncing(false);
    }, []);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            syncPendingData();
        };

        const handleOffline = () => {
            setIsOnline(false);
        };

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        let timerId;
        if (navigator.onLine) {
            timerId = window.setTimeout(() => {
                syncPendingData();
            }, 0);
        }

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);

            if (timerId) {
                window.clearTimeout(timerId);
            }
        };
    }, [syncPendingData]);

    const value = useMemo(
        () => ({
            isOnline,
            isSyncing,
            syncPendingData,
        }),
        [isOnline, isSyncing, syncPendingData]
    );

    return (
        <NetworkContext.Provider value={value}>
            {children}
        </NetworkContext.Provider>
    );
}