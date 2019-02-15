import BackgroundFetch from "react-native-background-fetch";

import { Globals } from './Globals';
import { saveToDatabase } from './Database';

export function initBackgroundSync() {
    BackgroundFetch.configure({
        minimumFetchInterval: 15, // <-- minutes (15 is minimum allowed)
        stopOnTerminate: false,   // <-- Android-only,
        startOnBoot: true,        // <-- Android-only
    }, async () => {
        await backgroundSync();
        BackgroundFetch.finish(BackgroundFetch.FETCH_RESULT_NEW_DATA);
    }, (error) => {
        console.log("[js] RNBackgroundFetch failed to start");
    });
}

/* Note - don't use anything with setInterval here, it won't run in the background */
async function backgroundSync() {
    console.log('Running background sync...');

    await Globals.wallet.internal().updateDaemonInfo();

    for (let i = 0; i < 10; i++) {
        await Globals.wallet.internal().sync(false);
    }

    saveToDatabase(Globals.wallet, Globals.pinCode);

    console.log('Background sync complete.');
}
