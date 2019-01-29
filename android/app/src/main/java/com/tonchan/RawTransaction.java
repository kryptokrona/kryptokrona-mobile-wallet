package com.tonchan;

import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;

public class RawTransaction {
    KeyOutput[] keyOutputs;
    String hash;
    String transactionPublicKey;
    long unlockTime;

    public RawTransaction() {}

    public RawTransaction(
        KeyOutput[] keyOutputs,
        String hash,
        String transactionPublicKey,
        long unlockTime) {
        this.keyOutputs = keyOutputs;
        this.hash = hash;
        this.transactionPublicKey = transactionPublicKey;
        this.unlockTime = unlockTime;
    }

    public RawTransaction(ReadableMap map) {
        this(
            KeyOutputVector(map.getArray("keyOutputs")),
            map.getString("hash"),
            map.getString("transactionPublicKey"),
            (long)map.getDouble("unlockTime")
        );
    }

    private static KeyOutput[] KeyOutputVector(ReadableArray arr) {
        KeyOutput[] keys = new KeyOutput[arr.size()];

        for (int i = 0; i < arr.size(); i++) {
            keys[i] = new KeyOutput(arr.getMap(i));
        }

        return keys;
    }
}
