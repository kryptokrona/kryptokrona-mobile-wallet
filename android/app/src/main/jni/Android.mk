LOCAL_PATH := $(call my-dir)

include $(CLEAR_VARS)
LOCAL_MODULE := TurtleCoin_jni
LOCAL_SRC_FILES := TurtleCoin.cpp crypto.cpp crypto-ops.c crypto-ops-data.c hash.c turtlecoin-crypto.cpp keccak.c
LOCAL_LDLIBS := -llog
include $(BUILD_SHARED_LIBRARY)
