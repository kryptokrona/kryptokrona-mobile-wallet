#include <jni.h>

#include "debug.h"
#include "crypto.h"
#include "turtlecoin-crypto.h"

#include <iostream>

#include <chrono>

#include <string>

Crypto::KeyDerivation generateKeyDerivation(
    const std::string walletPrivateViewKeyStr,
    const std::string txPublicKeyStr)
{
    Crypto::SecretKey walletPrivateViewKey;
    hexStringToByteArray(walletPrivateViewKeyStr.data(), walletPrivateViewKey.data);

    Crypto::PublicKey txPublicKey;
    hexStringToByteArray(txPublicKeyStr.data(), txPublicKey.data);

    Crypto::KeyDerivation derivation = generateKeyDerivation(
        txPublicKey, walletPrivateViewKey
    );

    return derivation;
}

Crypto::PublicKey underivePublicKey(
    const Crypto::KeyDerivation derivation,
    const size_t outputIndex,
    const std::string outputKeyStr)
{
    Crypto::PublicKey outputKey;

    hexStringToByteArray(outputKeyStr.data(), outputKey.data);

    Crypto::PublicKey result = underivePublicKey(derivation, outputIndex, outputKey);

    return result;
}

void benchmarkGenerateKeyDerivation(
    const std::string walletPrivateKeyStr,
    const std::string txPublicKeyStr)
{
    const uint64_t loopIterations = 60000;

    auto startTimer = std::chrono::high_resolution_clock::now();

    for (uint64_t i = 0; i < loopIterations; i++)
    {
        generateKeyDerivation(walletPrivateKeyStr, txPublicKeyStr);
    }

    auto elapsedTime = std::chrono::high_resolution_clock::now() - startTimer;

    /* Need to use microseconds here then divide by 1000 - otherwise we'll just get '0' */
    const auto timePerDerivation = std::chrono::duration_cast<std::chrono::microseconds>(elapsedTime).count() / loopIterations;

    std::cout << "Time to perform generateKeyDerivation: " << timePerDerivation / 1000.0 << " ms" << std::endl;
}

void benchmarkUnderivePublicKey(
    const std::string walletPrivateKeyStr,
    const std::string txPublicKeyStr)
{
    Crypto::KeyDerivation derivation = generateKeyDerivation(
        walletPrivateKeyStr, txPublicKeyStr
    );

    const uint64_t loopIterations = 60000;

    const std::string outputKey
        = "bb55bef919d1c9f74b5b52a8a6995a1dc4af4c0bb8824f5dc889012bc748173d";

    auto startTimer = std::chrono::high_resolution_clock::now();

    for (uint64_t i = 0; i < loopIterations; i++)
    {
        /* Use i as output index to prevent optimization */
        underivePublicKey(derivation, i, outputKey);
    }

    auto elapsedTime = std::chrono::high_resolution_clock::now() - startTimer;

    /* Need to use microseconds here then divide by 1000 - otherwise we'll just get '0' */
    const auto timePerDerivation = std::chrono::duration_cast<std::chrono::microseconds>(elapsedTime).count() / loopIterations;

    std::cout << "Time to perform underivePublicKey: " << timePerDerivation / 1000.0 << " ms" << std::endl;
}

extern "C" JNIEXPORT jstring JNICALL
Java_com_tonchan_TurtleCoinModule_underivePublicKeyJNI(JNIEnv* env, jobject instance) {
    const std::string walletPrivateViewKey
        = "6968a0b8f744ec4b8cea5ec124a1b4bd1626a2e6f31e999f8adbab52c4dfa909";

    const std::string txPublicKey
        = "3b0cc2b066812e6b9fcc42a797dc3c723a7344b604fd4be0b22e06254ff57f94";

    Crypto::KeyDerivation derivation = generateKeyDerivation(
        walletPrivateViewKey, txPublicKey
    );

    const std::string outputKey
        = "bb55bef919d1c9f74b5b52a8a6995a1dc4af4c0bb8824f5dc889012bc748173d";

    Crypto::PublicKey derivedPublicSpendKey = underivePublicKey(
        derivation, 2, outputKey
    );
    
    char result[65];
    result[64] = '\0';

    byteArrayToHexString(derivedPublicSpendKey.data, result);

    benchmarkUnderivePublicKey(walletPrivateViewKey, txPublicKey);

    LOGD("%s", result);

    return env->NewStringUTF("A magic key...");
}
