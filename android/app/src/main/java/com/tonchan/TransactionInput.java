package com.tonchan;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;

public class TransactionInput {
    String keyImage;
    long amount;
    String transactionPublicKey;
    long transactionIndex;
    long globalOutputIndex;
    String key;
    long unlockTime;

    public TransactionInput() {}

    public TransactionInput(
        String keyImage,
        long amount,
        String transactionPublicKey,
        long transactionIndex,
        long globalOutputIndex,
        String key,
        long unlockTime) {
        this.keyImage = keyImage;
        this.amount = amount;
        this.transactionPublicKey = transactionPublicKey;
        this.transactionIndex = transactionIndex;
        this.globalOutputIndex = globalOutputIndex;
        this.key = key;
        this.unlockTime = unlockTime;
    }

    public WritableMap toWriteableMap() {
        WritableMap map = Arguments.createMap();

        map.putString("keyImage", keyImage);
        map.putDouble("amount", (double)amount);
        map.putString("transactionPublicKey", transactionPublicKey);
        map.putDouble("transactionIndex", (double)transactionIndex);
        map.putDouble("globalOutputIndex", (double)globalOutputIndex);
        map.putString("key", key);
        map.putDouble("unlockTime", (double)unlockTime);

        return map;
    }
}
