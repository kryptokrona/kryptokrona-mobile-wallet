// Copyright (C) 2018, Zpalmtree
//
// Please see the included LICENSE file for more information.

'use strict';

import { NativeModules } from 'react-native';
import { TransactionInput } from 'turtlecoin-wallet-backend';

export async function generateKeyImage(
    publicEphemeral,
    privateEphemeral) {
    return NativeModules.TurtleCoin.generateKeyImage(
        publicEphemeral, privateEphemeral,
    );
}

export async function deriveSecretKey(
    derivation,
    outputIndex,
    privateSpendKey) {
    return NativeModules.TurtleCoin.deriveSecretKey(
        derivation, { outputIndex }, privateSpendKey
    );
}

export async function derivePublicKey(
    derivation,
    outputIndex,
    publicSpendKey) {
    return NativeModules.TurtleCoin.derivePublicKey(
        derivation, { outputIndex }, publicSpendKey
    );
}

export async function generateKeyDerivation(
    transactionPublicKey,
    privateViewKey) {
    
    return await NativeModules.TurtleCoin.generateKeyDerivation(
        transactionPublicKey, privateViewKey,
    );
}

export async function generateRingSignatures(
    transactionPrefixHash,
    keyImage,
    inputKeys,
    privateKey,
    realIndex) {
    return NativeModules.TurtleCoin.generateRingSignatures(
        transactionPrefixHash, keyImage, inputKeys, privateKey, { realIndex }
    );
}

export async function processBlockOutputs(
    block,
    privateViewKey,
    spendKeys,
    isViewWallet,
    processCoinbaseTransactions) {

    /* We crash if we pass in something bigger than 2^64, cap it */
    capIntToSafeValue(block);

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
        let tx = block.transactions.find((t) => t.hash === data.input.parentTransactionHash);

        const spendHeight = 0;

        const globalIndex = data.input.globalOutputIndex === -1 
                          ? undefined : data.input.globalOutputIndex;

        const input = new TransactionInput(
            data.input.keyImage,
            data.input.amount,
            block.blockHeight,
            tx.transactionPublicKey,
            data.input.transactionIndex,
            globalIndex,
            data.input.key,
            spendHeight,
            tx.unlockTime,
            data.input.parentTransactionHash,
        );

        return [data.publicSpendKey, input];
    });

    return jsInputs;
}

/* Native code will explode if we pass in > 2^64 - 1. So, cap it to this.
   However, node can't perform math with > 2^53, so we have to cap it to that */
function capIntToSafeValue(object) {
    Object.keys(object).forEach(function(element) {
        /* Recurse if this element is also an object */
        if (typeof object[element] === 'object') {
            capIntToSafeValue(object[element]);
        } else if (typeof object[element] === 'number' && object[element] > Number.MAX_SAFE_INTEGER) {
            object[element] = Number.MAX_SAFE_INTEGER;
        }
    });
}
