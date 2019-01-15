// Copyright (c) 2018, The TurtleCoin Developers
//
// Please see the included LICENSE file for more information.

#include "crypto.h"

#include <string>

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

Crypto::PublicKey underivePublicKey(
    const Crypto::KeyDerivation derivation,
    const size_t outputIndex,
    const Crypto::PublicKey derivedKey)
{
    Crypto::PublicKey result;

    Crypto::underive_public_key(derivation, outputIndex, derivedKey, result);

    return result;
}

Crypto::KeyDerivation generateKeyDerivation(
    const Crypto::PublicKey txPublicKey,
    const Crypto::SecretKey walletPrivateViewKey)
{
    Crypto::KeyDerivation derivation;

    Crypto::generate_key_derivation(txPublicKey, walletPrivateViewKey, derivation);

    return derivation;
}
