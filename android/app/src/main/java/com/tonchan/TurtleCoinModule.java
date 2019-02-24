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

    /* Access this by doing NativeModules.TurtleCoin in react */
    @Override
    public String getName() {
        return "TurtleCoin";
    }

    @ReactMethod
    public void generateKeyImage(
        String publicEphemeral,
        String privateEphemeral,
        Promise promise) {
        try {
            String key = generateKeyImageJNI(
                publicEphemeral,
                privateEphemeral
            );

            promise.resolve(key);
        } catch (Exception e) {
            promise.reject("Error in generate key image: ", e);
        }
    }

    @ReactMethod
    public void deriveSecretKey(
        String derivation,
        ReadableMap outputIndex,
        String privateSpendKey,
        Promise promise) {
        try {
            String key = deriveSecretKeyJNI(
                derivation,
                (long)outputIndex.getDouble("outputIndex"),
                privateSpendKey
            );

            promise.resolve(key);
        } catch (Exception e) {
            promise.reject("Error in derive secret key: ", e);
        }
    }

    @ReactMethod
    public void derivePublicKey(
        String derivation,
        ReadableMap outputIndex,
        String publicSpendKey,
        Promise promise) {
        try {
            String key = derivePublicKeyJNI(
                derivation,
                (long)outputIndex.getDouble("outputIndex"),
                publicSpendKey
            );

            promise.resolve(key);
        } catch (Exception e) {
            promise.reject("Error in derive public key: ", e);
        }
    }

    @ReactMethod
    public void generateKeyDerivation(
        String transactionPublicKey,
        String privateViewKey,
        Promise promise) {
        try {
            String key = generateKeyDerivationJNI(
                transactionPublicKey,
                privateViewKey
            );

            promise.resolve(key);
        } catch (Exception e) {
            promise.reject("Error in generate key derivation: ", e);
        }
    }

    @ReactMethod
    public void generateRingSignatures(
        String transactionPrefixHash,
        String keyImage,
        ReadableArray inputKeys,
        String privateKey,
        ReadableMap realIndex,
        Promise promise) {

        try {
            String[] signatures = generateRingSignaturesJNI(
                transactionPrefixHash,
                keyImage,
                arrayToInputKeys(inputKeys),
                privateKey,
                (long)realIndex.getDouble("realIndex")
            );

            promise.resolve(signaturesToArray(signatures));
        } catch (Exception e) {
            promise.reject("Error in generate ring signatures: ", e);
        }
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
            promise.reject("Error in process block outputs: ", e);
        }
    }

    private String[] arrayToInputKeys(ReadableArray inputKeys) {
        String[] keys = new String[inputKeys.size()];

        for (int i = 0; i < inputKeys.size(); i++) {
            keys[i] = inputKeys.getString(i);
        }

        return keys;
    }

    private SpendKey[] arrayToSpendKeys(ReadableArray spendKeys) {
        SpendKey[] keys = new SpendKey[spendKeys.size()];
        
        for (int i = 0; i < spendKeys.size(); i++) {
            keys[i] = new SpendKey(spendKeys.getMap(i));
        }

        return keys;
    }

    private WritableArray signaturesToArray(String[] signatures) {
        WritableArray arr = Arguments.createArray();

        for (String signature : signatures) {
            arr.pushString(signature);
        }

        return arr;
    }

    private WritableArray mapToArray(InputMap[] inputs) {
        WritableArray arr = Arguments.createArray();

        for (InputMap input : inputs) {
            arr.pushMap(input.toWriteableMap());
        }

        return arr;
    }

    public native String generateKeyImageJNI(
        String publicEphemeral,
        String privateEphemeral
    );

    public native String deriveSecretKeyJNI(
        String derivation,
        long outputIndex,
        String privateSpendKey
    );

    public native String derivePublicKeyJNI(
        String derivation,
        long outputIndex,
        String publicSpendKey
    );

    public native String generateKeyDerivationJNI(
        String transactionPublicKey,
        String privateViewKey
    );

    public native String[] generateRingSignaturesJNI(
        String transactionPrefixHash,
        String keyImage,
        String[] inputKeys,
        String privateKey,
        long realIndex
    );

    public native InputMap[] processBlockOutputsJNI(
        WalletBlockInfo block,
        String privateViewKey,
        SpendKey[] spendKeys,
        boolean isViewWallet,
        boolean processCoinbaseTransactions
    );
}
