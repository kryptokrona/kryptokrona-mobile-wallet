// Copyright (c) 2018, The TurtleCoin Developers
//
// Please see the included LICENSE file for more information.

#include <string>

void byteArrayToHexString(const uint8_t *input, char *output);

void hexStringToByteArray(const char* input, uint8_t* output);

Crypto::PublicKey underivePublicKey(
    const Crypto::KeyDerivation derivation,
    const size_t outputIndex,
    const Crypto::PublicKey derivedKey);

Crypto::KeyDerivation generateKeyDerivation(
    const Crypto::PublicKey txPublicKey,
    const Crypto::SecretKey walletPrivateViewKey);
