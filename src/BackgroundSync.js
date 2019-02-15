import BackgroundFetch from "react-native-background-fetch";

import { AppState } from 'react-native';

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

let shouldStop = false;

function onStateChange(state) {
    if (state !== 'background') {
        shouldStop = true;
    }
}

/* Note - don't use anything with setInterval here, it won't run in the background */
/* TODO: Time how long our execution is taking. Figure out how long we can execute for? */
async function backgroundSync() {
    AppState.addEventListener('change', onStateChange);

    shouldStop = false;

    console.log('Running background sync...');

    while (!shouldStop) {
        await Globals.wallet.internal().updateDaemonInfo();

        for (let i = 0; i < 100; i++) {
            if (shouldStop) {
                break;
            }

            await Globals.wallet.internal().sync(false);
        }

        saveToDatabase(Globals.wallet, Globals.pinCode);
    }

    console.log('Background sync complete.');

    AppState.removeEventListener('change', onStateChange);
}
