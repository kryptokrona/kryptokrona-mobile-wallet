# TonChan - A mobile, native TurtleCoin wallet

![Screenshot](https://i.imgur.com/MbZxkdu.png)

## Setup

* Clone the repo:

`git clone https://github.com/turtlecoin/turtlecoin-mobile-wallet.git`

`cd turtlecoin-mobile-wallet`

* Install React Native CLI

`npm install -g react-native-cli`

* Install yarn if you don't have it already:

`npm install -g yarn`

* Install the dependencies:

`yarn install`

* Next, we need to setup the Android JDK and development environment.

First we need to install the Android JDK (Version 8!).

* Ubuntu - `sudo apt-get install default-jdk`
* Arch Linux - `pacman -S jdk-openjdk`

Next, lets install Android Studio.

* Ubuntu - `https://askubuntu.com/a/941222/764667`
* Arch Linux - `pacaur -S android-studio` (It's in the AUR, feel free to use your favourite package manager or install manually.)

Next, we need to run the android studio setup, and set some path variables. This is a bit complicated, so I'm going to hand off to the facebook guide here: https://facebook.github.io/react-native/docs/getting-started#1-install-android-studio

Skip the 'Creating a new application' header, and continue on to 'Preparing the Android Device'. Run `android-studio .` in this directory to import the project.

Once you have your virtual device setup, you can launch the app itself.

* Run the program:

`react-native run-android`

If you get an error about 'Unsupported major.minor version', you may need to set JAVA_HOME to point to the correct jdk.

For example, `export JAVA_HOME=/usr/lib/jvm/java-8-openjdk/jre/`

## Developing

### Logging

You probably want to run `react-native log-android` so you can read the console output, and have an easier log of what's going on as you're developing. Errors will get printed to the device, but console.log won't, and it's a little hard to read.


### Live Reloading

You probably also want to enable live reloading. Hit "Ctrl-M" in your emulator, or type `adb shell input keyevent 82` to open the developer menu, and enable `Live Reload`. You probably don't want to use Hot Reloading, it's pretty buggy.

### Native Code

If you need to update the native code, you may find this article helpful: https://thebhwgroup.com/blog/react-native-jni

To get the updated class signatures, rebuild the Java code (i.e., run `react-native run-android`, then run 

```
javap -classpath android/app/build/intermediates/classes/debug/ -s com.tonchan.ClassName
```

Where `ClassName` is the class you want to query. For example, to get the signatures for `WalletBlockInfo`:

```
javap -classpath android/app/build/intermediates/classes/debug/ -s com.tonchan.WalletBlockInfo
```

Then the constructor signature is this section:

```
public com.tonchan.WalletBlockInfo(com.tonchan.RawTransaction, com.tonchan.RawTransaction[]);
    Signature: (Lcom/tonchan/RawTransaction;[Lcom/tonchan/RawTransaction;)V
```

Specifically, `(Lcom/tonchan/RawTransaction;[Lcom/tonchan/RawTransaction;)V`

### Flowcharts

There is a flow chart describing screen navigation in the `flowcharts` folder.

There is also an xml file that you can import into [draw.io](https://draw.io) if you want to modify the flowchart.

### Creating a release

You need to bump the version number in:

* `src/Config.js` - `appVersion`
* `android/app/build.gradle` - `versionCode` and `versionName`

## Running natively on your Android device

Follow [this](https://facebook.github.io/react-native/docs/running-on-device.html) guide.

## Building an APK

Follow [this](https://facebook.github.io/react-native/docs/signed-apk-android.html) guide.

Once you have finished, compile the APK:

`yarn build-android`

Install the APK on your device:

`yarn deploy-android`

If it all works, you can then upload to the play store.

Note that you need to close the emulator to get the `yarn deploy-android` to install on your mobile.

## Forking

#### Modifying icon

Replace `assets/img/icon.png` with your icon image. Make sure it is 1024x1024.

Run `npm install -g yo generator-rn-toolbox` (You may need to run this with sudo)

Run `yo rn-toolbox:assets --icon assets/img/icon.png --force`

When it asks for the name of your react-native project, enter `TonChan`

#### Renaming app

Run `npm install -g react-native-rename` (You may need to run this with sudo)

Run `react-native-name your-new-project-name` from this directory. (Obviously, replace with the desired name)

This might confuse the build system. You probably should do this before installing.

#### Config

Edit `config.js`. The fields should be self explanatory. Make sure to recompile.
