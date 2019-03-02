// Copyright (C) 2018, Zpalmtree
//
// Please see the included LICENSE file for more information.

import React from 'react';

import { Spinner } from './Spinner';
import { FadeView } from './FadeView';
import { haveWallet } from './Database';
import { delay, navigateWithDisabledBack } from './Utilities';

/**
 * Launch screen. See if the user has a pin, if so, request pin to unlock.
 * Otherwise, go to the create/import screen
 */
export class SplashScreen extends React.Component {
    static navigationOptions = {
        header: null,
    };

    constructor(props) {
        super(props);

        (async () => {
            /* See if user has previously made a wallet */
            const hasWallet = await haveWallet();

            /* Above operation takes some time. Loading animation is pretty ugly
               if it only stays for 0.5 seconds, and too slow if we don't have
               any animation at all..
               This way it looks nice, even if delaying interaction by a couple
               of seconds */
            await delay(2000);

            /* Get the pin, or show disclaimer then create a wallet if no pin */
            this.props.navigation.dispatch(navigateWithDisabledBack(hasWallet ? 'RequestPin' : 'WalletOption'));
        })();
    }

    render() {
        return(
            /* Fade in a spinner logo */
            <FadeView startValue={1} endValue={0} style={{flex: 1, alignItems: 'stretch', justifyContent: 'center'}}>
                <Spinner></Spinner>
            </FadeView>
        );
    }
}
