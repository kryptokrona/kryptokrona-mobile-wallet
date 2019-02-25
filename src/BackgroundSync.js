// Copyright (C) 2018, Zpalmtree
//
// Please see the included LICENSE file for more information.

import BackgroundFetch from "react-native-background-fetch";

import { AppState, Platform, NetInfo } from 'react-native';

import Config from './Config';

import { Globals } from './Globals';
import { saveToDatabase } from './Database';

/* Note: headless/start on boot not enabled, since we don't have the pin
   to decrypt the users wallet, when fetching from DB */
export function initBackgroundSync() {
    BackgroundFetch.configure({
        minimumFetchInterval: 15, // <-- minutes (15 is minimum allowed)
        stopOnTerminate: false,   // <-- Android-only,
    }, async () => {
        await backgroundSync();
    }, (error) => {
        console.log("[js] RNBackgroundFetch failed to start");
    });
}

let State = {
    shouldStop: false,
    running: false,
}

function onStateChange(state) {
    if (state !== 'background') {
        State.shouldStop = true;
    }
}

/**
 * Check background syncing is all good and setup a few vars
 */
async function setupBackgroundSync() {
    /* Probably shouldn't happen... but check we're not already running. */
    if (State.running) {
        console.log('[Background Sync] Background sync already running. Not starting.');
        return false;
    }

    /* Not in the background, don't sync */
    if (AppState.currentState !== 'background') {
        console.log('[Background Sync] Background sync launched while in foreground. Not starting.');
        return false;
    }

    /* Wallet not loaded yet. Probably shouldn't happen, but helps to be safe */
    if (Globals.wallet === undefined) {
        console.log('[Background Sync] Wallet not loading. Not starting background sync.');
        return false;
    }

    const netInfo = NetInfo.getConnectionInfo();

    if (Globals.preferences.limitData && netInfo.type === 'cellular') {
        console.log('[Background Sync] On mobile data. Not starting background sync.');
        return false;
    }

    AppState.addEventListener('change', onStateChange);

    State.shouldStop = false;

    console.log('[Background Sync] Running background sync...');

    return true;
}

/**
 * Complete the background syncing and pull down a few vars
 */
function finishBackgroundSync() {
    AppState.removeEventListener('change', onStateChange);

    BackgroundFetch.finish(BackgroundFetch.FETCH_RESULT_NEW_DATA);

    State.running = false;

    console.log('[Background Sync] Background sync complete.');
}

/**
 * Perform the background sync itself.
 * Note - don't use anything with setInterval here, it won't run in the background
 */
export async function backgroundSync() {
    if (!await setupBackgroundSync()) {
        BackgroundFetch.finish(BackgroundFetch.FETCH_RESULT_NO_DATA);
        return;
    } else {
        State.running = true;
    }

    const startTime = new Date();

    /* ios only allows 30 seconds of runtime. Android allows... infinite???
       Since we run every 15 minutes, just set it to 14 for android.
       Not exactly sure on this. */
    let allowedRunTime = Platform.OS === 'ios' ? 25 : (60 * 14);

    let secsRunning = 0;

    /* Run for 25 seconds or until the app comes back to the foreground */
    while (!State.shouldStop && secsRunning < allowedRunTime) {

        /* Update the daemon info */
        await Globals.wallet.internal().updateDaemonInfo();

        const [walletBlockCount, localDaemonBlockCount, networkBlockCount] = Globals.wallet.getSyncStatus();

        /* Check if we're synced so we don't kill the users battery */
        if (walletBlockCount >= localDaemonBlockCount || walletBlockCount >= networkBlockCount) {
            console.log('[Background Sync] Wallet is synced. Stopping background sync.');

            /* Save the wallet */
            saveToDatabase(Globals.wallet, Globals.pinCode);

            break;
        }

        /* Process 1000 blocks */
        for (let i = 0; i < (1000 / Config.blocksPerTick); i++) {
            if (State.shouldStop) {
                break;
            }

            await Globals.wallet.internal().sync(false);
        }

        console.log('[Background Sync] Saving wallet in background.');

        /* Save the wallet */
        saveToDatabase(Globals.wallet, Globals.pinCode);

        /* Update our running time */
        secsRunning = (new Date() - startTime) / 1000;
    }

    finishBackgroundSync();
}
