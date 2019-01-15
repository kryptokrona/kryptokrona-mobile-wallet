package com.tonchan;

import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

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
    public void underivePublicKey(Promise promise) { //this method will be called from JS by React Native
        try {
            String key = underivePublicKeyJNI();
            promise.resolve(key);
        } catch (Exception e) {
            promise.reject("ERR", e);
        }
    }

    public native String underivePublicKeyJNI();
}
