#include "Types.h"

#include <unordered_map>

#include <jni.h>

jint JNI_OnLoad(JavaVM *vm, void *reserved);

WalletBlockInfo makeNativeWalletBlockInfo(JNIEnv *env, jobject jWalletBlockInfo);

std::string makeNativeString(JNIEnv *env, jstring jStr);

std::unordered_map<Crypto::PublicKey, Crypto::SecretKey> makeNativeSpendKeys(JNIEnv *env, jobjectArray jSpendKeys);

jobjectArray makeJNIInputs(JNIEnv *env, const std::vector<std::tuple<Crypto::PublicKey, TransactionInput>> &inputs);

jobject makeJNIInput(JNIEnv *env, const TransactionInput &input);

RawTransaction makeNativeRawTransaction(JNIEnv *env, jobject jRawTransaction);

std::vector<KeyOutput> makeNativeKeyOutputVector(JNIEnv *env, jobjectArray jKeyOutputs);

KeyOutput makeNativeKeyOutput(JNIEnv *env, jobject jKeyOutput);

std::vector<RawTransaction> makeNativeTransactionVector(JNIEnv *env, jobjectArray jTransactions);

void byteArrayToHexString(const uint8_t *input, char *output);

int char2int(char input);

void hexStringToByteArray(const char* input, uint8_t* output);

std::vector<std::tuple<Crypto::PublicKey, TransactionInput>> processBlockOutputs(
    const WalletBlockInfo &block,
    const Crypto::SecretKey &privateViewKey,
    const std::unordered_map<Crypto::PublicKey, Crypto::SecretKey> &spendKeys,
    const bool isViewWallet,
    const bool processCoinbaseTransactions);

void processTransactionOutputs(
    const RawTransaction &tx,
    const uint64_t blockHeight,
    const Crypto::SecretKey &privateViewKey,
    const std::unordered_map<Crypto::PublicKey, Crypto::SecretKey> &spendKeys,
    const bool isViewWallet,
    std::vector<std::tuple<Crypto::PublicKey, TransactionInput>> &inputs);

template<typename T>
T makeNative32ByteKey(JNIEnv *env, jstring jPrivateViewKey)
{
    T result;
    const char *nativeString = env->GetStringUTFChars(jPrivateViewKey, nullptr);
    hexStringToByteArray(nativeString, result.data);
    env->ReleaseStringUTFChars(jPrivateViewKey, nativeString);
    return result;
}

template<typename T>
jstring makeJNI32ByteKey(JNIEnv *env, T byteKey)
{
    /* +1 for \0 byte */
    char output[65];
    byteArrayToHexString(byteKey.data, output);
    output[64] = '\0';
    return env->NewStringUTF(output);
}
