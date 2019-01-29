// Copyright (C) 2018, Zpalmtree
//
// Please see the included LICENSE file for more information.

'use strict';

import { NativeModules } from 'react-native';
import { TransactionInput } from 'turtlecoin-wallet-backend';

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
        processCoinbaseTransactions,
    );

    let jsInputs = inputs.map((data) => {
        const spendHeight = 0;
        const globalIndex = data.input.globalOutputIndex === -1 
                          ? undefined : data.input.globalOutputIndex;

        const input = new TransactionInput(
            data.input.keyImage,
            data.input.amount,
            block.blockHeight,
            data.input.transactionPublicKey,
            data.input.transactionIndex,
            globalIndex,
            data.input.key,
            spendHeight,
            data.input.unlockTime,
            data.input.parentTransactionHash,
        );

        return [data.publicSpendKey, input];
    });

    return jsInputs;
}
