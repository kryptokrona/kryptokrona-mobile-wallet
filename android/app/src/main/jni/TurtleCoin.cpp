#include "debug.h"
#include "crypto.h"
#include "TurtleCoin.h"

jclass      WALLET_BLOCK_INFO;
jmethodID   WALLET_BLOCK_INFO_CONST;
jfieldID    WALLET_BLOCK_INFO_COINBASE_TRANSACTION;
jfieldID    WALLET_BLOCK_INFO_TRANSACTIONS;

jclass      RAW_TRANSACTION;
jmethodID   RAW_TRANSACTION_CONST;
jfieldID    RAW_TRANSACTION_KEY_OUTPUTS;
jfieldID    RAW_TRANSACTION_HASH;
jfieldID    RAW_TRANSACTION_TRANSACTION_PUBLIC_KEY;
jfieldID    RAW_TRANSACTION_UNLOCK_TIME;

jclass      KEY_OUTPUT;
jmethodID   KEY_OUTPUT_CONST;
jfieldID    KEY_OUTPUT_KEY;
jfieldID    KEY_OUTPUT_AMOUNT;
jfieldID    KEY_OUTPUT_GLOBAL_INDEX;

jclass      INPUT_MAP;
jmethodID   INPUT_MAP_CONST;
jfieldID    INPUT_MAP_PUBLIC_SPEND_KEY;
jfieldID    INPUT_MAP_TRANSACTION_INPUT;

jclass      TRANSACTION_INPUT;
jmethodID   TRANSACTION_INPUT_CONST;
jfieldID    TRANSACTION_INPUT_KEY_IMAGE;
jfieldID    TRANSACTION_INPUT_AMOUNT;
jfieldID    TRANSACTION_INPUT_TRANSACTION_PUBLIC_KEY;
jfieldID    TRANSACTION_INPUT_TRANSACTION_INDEX;
jfieldID    TRANSACTION_INPUT_GLOBAL_OUTPUT_INDEX;
jfieldID    TRANSACTION_INPUT_KEY;
jfieldID    TRANSACTION_INPUT_UNLOCK_TIME;

jclass      SPEND_KEY;
jmethodID   SPEND_KEY_CONST;
jfieldID    SPEND_KEY_PUBLIC_KEY;
jfieldID    SPEND_KEY_PRIVATE_KEY;

jclass      JAVA_STRING;

extern "C" jint JNI_OnLoad(JavaVM *vm, void *reserved) {
    JNIEnv *env;
    if (vm->GetEnv(reinterpret_cast<void **>(&env), JNI_VERSION_1_6) != JNI_OK) {
        return -1;
    }

    KEY_OUTPUT = (jclass) env->NewGlobalRef(env->FindClass("com/tonchan/KeyOutput"));
    KEY_OUTPUT_CONST = env->GetMethodID(KEY_OUTPUT, "<init>", "(Ljava/lang/String;JJ)V");
    KEY_OUTPUT_KEY = env->GetFieldID(KEY_OUTPUT, "key", "Ljava/lang/String;");
    KEY_OUTPUT_AMOUNT = env->GetFieldID(KEY_OUTPUT, "amount", "J");
    KEY_OUTPUT_GLOBAL_INDEX = env->GetFieldID(KEY_OUTPUT, "globalIndex", "J");

    RAW_TRANSACTION = (jclass) env->NewGlobalRef(env->FindClass("com/tonchan/RawTransaction"));
    RAW_TRANSACTION_CONST = env->GetMethodID(RAW_TRANSACTION, "<init>", "([Lcom/tonchan/KeyOutput;Ljava/lang/String;Ljava/lang/String;J)V");
    RAW_TRANSACTION_KEY_OUTPUTS = env->GetFieldID(RAW_TRANSACTION, "keyOutputs", "[Lcom/tonchan/KeyOutput;");
    RAW_TRANSACTION_HASH = env->GetFieldID(RAW_TRANSACTION, "hash", "Ljava/lang/String;");
    RAW_TRANSACTION_TRANSACTION_PUBLIC_KEY = env->GetFieldID(RAW_TRANSACTION, "transactionPublicKey", "Ljava/lang/String;");
    RAW_TRANSACTION_UNLOCK_TIME = env->GetFieldID(RAW_TRANSACTION, "unlockTime", "J");

    WALLET_BLOCK_INFO = (jclass) env->NewGlobalRef(env->FindClass("com/tonchan/WalletBlockInfo"));
    WALLET_BLOCK_INFO_CONST = env->GetMethodID(WALLET_BLOCK_INFO, "<init>", "(Lcom/tonchan/RawTransaction;[Lcom/tonchan/RawTransaction;)V");
    WALLET_BLOCK_INFO_COINBASE_TRANSACTION = env->GetFieldID(WALLET_BLOCK_INFO, "coinbaseTransaction", "Lcom/tonchan/RawTransaction;");
    WALLET_BLOCK_INFO_TRANSACTIONS = env->GetFieldID(WALLET_BLOCK_INFO, "transactions", "[Lcom/tonchan/RawTransaction;");

    TRANSACTION_INPUT = (jclass) env->NewGlobalRef(env->FindClass("com/tonchan/TransactionInput"));
    TRANSACTION_INPUT_CONST = env->GetMethodID(TRANSACTION_INPUT, "<init>", "(Ljava/lang/String;JLjava/lang/String;JJLjava/lang/String;JLjava/lang/String;)V");
    TRANSACTION_INPUT_KEY_IMAGE = env->GetFieldID(TRANSACTION_INPUT, "keyImage", "Ljava/lang/String;");
    TRANSACTION_INPUT_AMOUNT = env->GetFieldID(TRANSACTION_INPUT, "amount", "J");
    TRANSACTION_INPUT_TRANSACTION_PUBLIC_KEY = env->GetFieldID(TRANSACTION_INPUT, "transactionPublicKey", "Ljava/lang/String;");
    TRANSACTION_INPUT_TRANSACTION_INDEX = env->GetFieldID(TRANSACTION_INPUT, "transactionIndex", "J");
    TRANSACTION_INPUT_GLOBAL_OUTPUT_INDEX = env->GetFieldID(TRANSACTION_INPUT, "globalOutputIndex", "J");
    TRANSACTION_INPUT_KEY = env->GetFieldID(TRANSACTION_INPUT, "key", "Ljava/lang/String;");
    TRANSACTION_INPUT_UNLOCK_TIME = env->GetFieldID(TRANSACTION_INPUT, "unlockTime", "J");

    SPEND_KEY = (jclass) env->NewGlobalRef(env->FindClass("com/tonchan/SpendKey"));
    SPEND_KEY_CONST = env->GetMethodID(SPEND_KEY, "<init>", "(Ljava/lang/String;Ljava/lang/String;)V");
    SPEND_KEY_PUBLIC_KEY = env->GetFieldID(SPEND_KEY, "publicKey", "Ljava/lang/String;");
    SPEND_KEY_PRIVATE_KEY = env->GetFieldID(SPEND_KEY, "privateKey", "Ljava/lang/String;");

    INPUT_MAP = (jclass) env->NewGlobalRef(env->FindClass("com/tonchan/InputMap"));
    INPUT_MAP_CONST = env->GetMethodID(INPUT_MAP, "<init>", "(Ljava/lang/String;Lcom/tonchan/TransactionInput;)V");
    INPUT_MAP_PUBLIC_SPEND_KEY = env->GetFieldID(INPUT_MAP, "publicSpendKey", "Ljava/lang/String;");
    INPUT_MAP_TRANSACTION_INPUT = env->GetFieldID(INPUT_MAP, "input", "Lcom/tonchan/TransactionInput;");

    return JNI_VERSION_1_6;
}

extern "C" JNIEXPORT jobjectArray JNICALL
Java_com_tonchan_TurtleCoinModule_processBlockOutputsJNI(
    JNIEnv *env,
    jobject instance,
    jobject jWalletBlockInfo,
    jstring jPrivateViewKey,
    jobjectArray jSpendKeys,
    jboolean isViewWallet,
    jboolean processCoinbaseTransactions)
{
    const auto walletBlockInfo = makeNativeWalletBlockInfo(env, jWalletBlockInfo);
    const auto privateViewKey = makeNative32ByteKey<Crypto::SecretKey>(env, jPrivateViewKey);
    const auto spendKeys = makeNativeSpendKeys(env, jSpendKeys);

    const auto inputs = processBlockOutputs(
        walletBlockInfo, privateViewKey, spendKeys, isViewWallet,
        processCoinbaseTransactions
    );

    return makeJNIInputs(env, inputs);
}

WalletBlockInfo makeNativeWalletBlockInfo(JNIEnv *env, jobject jWalletBlockInfo)
{
    WalletBlockInfo result;

    result.coinbaseTransaction = makeNativeRawTransaction(env, env->GetObjectField(
        jWalletBlockInfo,
        WALLET_BLOCK_INFO_COINBASE_TRANSACTION
    ));

    result.transactions = makeNativeTransactionVector(env, (jobjectArray)env->GetObjectField(
        jWalletBlockInfo,
        WALLET_BLOCK_INFO_TRANSACTIONS
    ));

    return result;
}

std::string makeNativeString(JNIEnv *env, jstring jStr)
{
    const char *nativeString = env->GetStringUTFChars(jStr, nullptr);
    std::string str(nativeString);
    env->ReleaseStringUTFChars(jStr, nativeString);
    return str;
}

std::vector<RawTransaction> makeNativeTransactionVector(JNIEnv *env, jobjectArray jTransactions)
{
    std::vector<RawTransaction> transactions;

    int len = env->GetArrayLength(jTransactions);

    for (int i = 0; i < len; i++)
    {
        transactions.push_back(makeNativeRawTransaction(env, 
            env->GetObjectArrayElement(jTransactions, i)
        ));
    }

    return transactions;
}

RawTransaction makeNativeRawTransaction(JNIEnv *env, jobject jRawTransaction)
{
    RawTransaction transaction;

    transaction.keyOutputs = makeNativeKeyOutputVector(env, (jobjectArray)env->GetObjectField(
        jRawTransaction,
        RAW_TRANSACTION_KEY_OUTPUTS
    ));

    transaction.hash = makeNativeString(env,
        (jstring)env->GetObjectField(jRawTransaction, RAW_TRANSACTION_HASH)
    );

    transaction.transactionPublicKey = makeNative32ByteKey<Crypto::PublicKey>(env,
        (jstring)env->GetObjectField(jRawTransaction, RAW_TRANSACTION_TRANSACTION_PUBLIC_KEY)
    );

    transaction.unlockTime = env->GetLongField(jRawTransaction, RAW_TRANSACTION_UNLOCK_TIME);

    return transaction;
}

std::vector<KeyOutput> makeNativeKeyOutputVector(JNIEnv *env, jobjectArray jKeyOutputs)
{
    std::vector<KeyOutput> keyOutputs;

    int len = env->GetArrayLength(jKeyOutputs);

    for (int i = 0; i < len; i++)
    {
        keyOutputs.push_back(makeNativeKeyOutput(env, 
            env->GetObjectArrayElement(jKeyOutputs, i)
        ));
    }

    return keyOutputs;
}

KeyOutput makeNativeKeyOutput(JNIEnv *env, jobject jKeyOutput)
{
    KeyOutput output;

    output.key = makeNative32ByteKey<Crypto::PublicKey>(env,
        (jstring)env->GetObjectField(jKeyOutput, KEY_OUTPUT_KEY)
    );

    output.amount = env->GetLongField(jKeyOutput, KEY_OUTPUT_AMOUNT);

    output.globalIndex = env->GetLongField(jKeyOutput, KEY_OUTPUT_GLOBAL_INDEX);

    return output;
}

std::unordered_map<Crypto::PublicKey, Crypto::SecretKey> makeNativeSpendKeys(JNIEnv *env, jobjectArray jSpendKeys)
{
    std::unordered_map<Crypto::PublicKey, Crypto::SecretKey> spendKeys;

    int len = env->GetArrayLength(jSpendKeys);

    for (int i = 0; i < len; i++)
    {
        jobject jSpendKey = env->GetObjectArrayElement(jSpendKeys, i);

        Crypto::PublicKey publicKey = makeNative32ByteKey<Crypto::PublicKey>(
            env, (jstring)env->GetObjectField(jSpendKey, SPEND_KEY_PUBLIC_KEY)
        );

        Crypto::SecretKey privateKey = makeNative32ByteKey<Crypto::SecretKey>(
            env, (jstring)env->GetObjectField(jSpendKey, SPEND_KEY_PRIVATE_KEY)
        );

        spendKeys[publicKey] = privateKey;
    }

    return spendKeys;
}

jobjectArray makeJNIInputs(JNIEnv *env, const std::vector<std::tuple<Crypto::PublicKey, TransactionInput>> &inputs)
{
    jobjectArray jniInputs = env->NewObjectArray(
        inputs.size(), INPUT_MAP, nullptr
    );

    int i = 0;

    for (const auto &[publicKey, input] : inputs)
    {
        env->SetObjectArrayElement(jniInputs, i, env->NewObject(
            INPUT_MAP, INPUT_MAP_CONST, makeJNI32ByteKey(env, publicKey),
            makeJNIInput(env, input)
        ));

        i++;
    }

    return jniInputs;
}

jobject makeJNIInput(JNIEnv *env, const TransactionInput &input)
{
    return env->NewObject(
        TRANSACTION_INPUT, TRANSACTION_INPUT_CONST, makeJNI32ByteKey(env, input.keyImage),
        input.amount, makeJNI32ByteKey(env, input.transactionPublicKey),
        input.transactionIndex, input.globalOutputIndex, makeJNI32ByteKey(env, input.key),
        input.unlockTime, env->NewStringUTF(input.parentTransactionHash.c_str())
    );
}

/* input = 32 char byte array.
   output = 64 char hex string */
void byteArrayToHexString(const uint8_t *input, char *output)
{
    char hexval[16] = {
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
        'a', 'b', 'c', 'd', 'e', 'f'
    };

    for (int i = 0; i < 32; i++)
    {
        output[i * 2] = hexval[((input[i] >> 4) & 0xF)];
        output[(i * 2) + 1] = hexval[(input[i]) & 0x0F];
    }
}

int char2int(char input)
{
    if (input >= '0' && input <= '9')
    {
        return input - '0';
    }

    if (input >= 'A' && input <= 'F')
    {
        return input - 'A' + 10;
    }

    if (input >= 'a' && input <= 'f')
    {
        return input - 'a' + 10;
    }

    return -1;
}

/* input = 64 char hex string
   output = 32 char byte array */
void hexStringToByteArray(const char* input, uint8_t* output)
{
    for (int i = 0; i < 32; i++)
    {
        output[i] = char2int(input[i*2]) * 16 +
                    char2int(input[(i*2) + 1]);
    }
}

std::vector<std::tuple<Crypto::PublicKey, TransactionInput>> processBlockOutputs(
    const WalletBlockInfo &block,
    const Crypto::SecretKey &privateViewKey,
    const std::unordered_map<Crypto::PublicKey, Crypto::SecretKey> &spendKeys,
    const bool isViewWallet,
    const bool processCoinbaseTransactions)
{

    std::vector<std::tuple<Crypto::PublicKey, TransactionInput>> inputs;

    /* Process the coinbase tx if we're not skipping them for speed */
    if (processCoinbaseTransactions)
    {
        processTransactionOutputs(
            block.coinbaseTransaction, privateViewKey, spendKeys, isViewWallet, inputs
        );
    }

    /* Process the normal txs */
    for (const auto &tx : block.transactions)
    {
        processTransactionOutputs(
            tx, privateViewKey, spendKeys, isViewWallet, inputs
        );
    }

    return inputs;
}

void processTransactionOutputs(
    const RawTransaction &tx,
    const Crypto::SecretKey &privateViewKey,
    const std::unordered_map<Crypto::PublicKey, Crypto::SecretKey> &spendKeys,
    const bool isViewWallet,
    std::vector<std::tuple<Crypto::PublicKey, TransactionInput>> &inputs)
{
    Crypto::KeyDerivation derivation;

    /* Generate the key derivation from the random tx public key, and our private
       view key */
    Crypto::generate_key_derivation(
        tx.transactionPublicKey, privateViewKey, derivation
    );

    uint32_t outputIndex = 0;

    for (const auto &output : tx.keyOutputs)
    {
        Crypto::PublicKey derivedSpendKey;

        /* Derive the public spend key from the transaction, using the previous 
           derivation */
        Crypto::underive_public_key(
            derivation, outputIndex, output.key, derivedSpendKey
        );

        /* See if the derived spend key matches any of our spend keys */
        const auto ourPrivateSpendKey = spendKeys.find(derivedSpendKey);

        /* If it does, the transaction belongs to us */
        if (ourPrivateSpendKey != spendKeys.end())
        {
            TransactionInput input;

            input.amount = output.amount;
            input.transactionPublicKey = tx.transactionPublicKey;
            input.transactionIndex = outputIndex;
            input.globalOutputIndex = output.globalIndex;
            input.key = output.key;
            input.unlockTime = tx.unlockTime;
            input.parentTransactionHash = tx.hash;

            if (!isViewWallet)
            {
                /* Make a temporary key pair */
                Crypto::PublicKey tmpPublicKey;
                Crypto::SecretKey tmpSecretKey;

                /* Get the tmp public key from the derivation, the index,
                   and our public spend key */
                Crypto::derive_public_key(
                    derivation, outputIndex, derivedSpendKey, tmpPublicKey
                );

                /* Get the tmp private key from the derivation, the index,
                   and our private spend key */
                Crypto::derive_secret_key(
                    derivation, outputIndex, ourPrivateSpendKey->second, tmpSecretKey
                );

                /* Get the key image from the tmp public and private key */
                Crypto::generate_key_image(
                    tmpPublicKey, tmpSecretKey, input.keyImage
                );
            }

            inputs.emplace_back(derivedSpendKey, input);
        }

        outputIndex++;
    }
}
