#include <android/log.h>

#ifndef LOGD
#define LOGD(...) __android_log_print(ANDROID_LOG_DEBUG, "ReactNative", __VA_ARGS__)
#endif
