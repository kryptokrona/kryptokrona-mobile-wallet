package com.tonchan;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;

public class TurtleCoinModule extends ReactContextBaseJavaModule {
    static {
        System.loadLibrary("TurtleCoin_jni");
    }

    public TurtleCoinModule(ReactApplicationContext reactContext) {
        super(reactContext); //required by React Native
    }

    @Override
    public String getName() {
        return "TurtleCoin"; //HelloWorld is how this module will be referred to from React Native
    }

    @ReactMethod
    public void processBlockOutputs(
        ReadableMap block,
        String privateViewKey,
        ReadableArray spendKeys,
        boolean isViewWallet,
        boolean processCoinbaseTransactions,
        Promise promise) {

        try {
            InputMap[] inputs = processBlockOutputsJNI(
                new WalletBlockInfo(block),
                privateViewKey,
                arrayToSpendKeys(spendKeys),
                isViewWallet,
                processCoinbaseTransactions
            );

            promise.resolve(mapToArray(inputs));

        } catch (Exception e) {
            promise.reject("ERR", e);
        }
    }

    private SpendKey[] arrayToSpendKeys(ReadableArray spendKeys) {
        SpendKey[] keys = new SpendKey[spendKeys.size()];
        
        for (int i = 0; i < spendKeys.size(); i++) {
            keys[i] = new SpendKey(spendKeys.getMap(i));
        }

        return keys;
    }

    private WritableArray mapToArray(InputMap[] inputs) {
        WritableArray arr = Arguments.createArray();

        for (InputMap input : inputs) {
            arr.pushMap(input.toWriteableMap());
        }

        return arr;
    }

    public native InputMap[] processBlockOutputsJNI(
        WalletBlockInfo block,
        String privateViewKey,
        SpendKey[] spendKeys,
        boolean isViewWallet,
        boolean processCoinbaseTransactions
    );
}
