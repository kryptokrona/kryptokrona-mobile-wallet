// Copyright (C) 2018, Zpalmtree
//
// Please see the included LICENSE file for more information.

'use strict';

import { NativeModules } from 'react-native';

export async function processBlockOutputs(
    block,
    privateViewKey,
    spendKeys,
    isViewWallet,
    processCoinbaseTransactions) {

    const javaSpendKeys = spendKeys.map(([publicKey, privateKey]) => {
        return {
            'publicKey': publicKey,
            'privateKey': privateKey,
        }
    })

    let inputs = await NativeModules.TurtleCoin.processBlockOutputs(
        block, privateViewKey, javaSpendKeys, isViewWallet, 
        processCoinbaseTransactions
    );

    console.log(JSON.stringify(inputs, null, 4));

    let newInputs = inputs.map((input) => {
        if (input.input.globalOutputIndex === -1) {
            input.input.globalOutputIndex = undefined;
        }

        return [input.publicSpendKey, input.input];
    });

    console.log(JSON.stringify(newInputs, null, 4));

    return newInputs;
}
