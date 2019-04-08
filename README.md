# TonChan - A mobile, native TurtleCoin wallet

![Screenshot](https://i.imgur.com/F5LMYKl.png)

## Setup

Note: Make sure you use yarn instead of npm. Since there is no package-lock.json, only a yarn.lock, using npm will get you the wrong packages.

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
* `package.json` - `version` - Not strictly required

### Integrating QR Codes

TonChan supports two kinds of QR codes.

* Standard addresses / integrated addresses - This is simply the address encoded as a QR code.

* turtlecoin:// URI encoded as a QR code.

Your uri must being with `turtlecoin://` followed by the address to send to, for example, `turtlecoin://TRTLv2Fyavy8CXG8BPEbNeCHFZ1fuDCYCZ3vW5H5LXN4K2M2MHUpTENip9bbavpHvvPwb4NDkBWrNgURAd5DB38FHXWZyoBh4wW`

There are a few optional parameters.

* `name` - This is used to add you to the users address book, and identify you on the 'Confirm' screen. A name can contain spaces, and should be URI encoded.
* `amount` - This is the amount to send you. This should be specified in atomic units.
* `paymentid` - If not using integrated address, you can specify a payment ID. Specifying an integrated address and a payment ID is illegal.

An example of a URI containing all of the above parameters:

```
turtlecoin://TRTLv2Fyavy8CXG8BPEbNeCHFZ1fuDCYCZ3vW5H5LXN4K2M2MHUpTENip9bbavpHvvPwb4NDkBWrNgURAd5DB38FHXWZyoBh4wW?amount=10000&name=Starbucks%20Coffee&paymentid=f13adc8ac78eb22ffcee3f82e0e9ffb251dc7dc0600ef599087a89b623ca1402
```

This would send `100 TRTL` (10000 in atomic units) to the address `TRTLv2Fyavy8CXG8BPEbNeCHFZ1fuDCYCZ3vW5H5LXN4K2M2MHUpTENip9bbavpHvvPwb4NDkBWrNgURAd5DB38FHXWZyoBh4wW`, using the name `Starbucks Coffee` (Note the URI encoding), and using a payment ID of `f13adc8ac78eb22ffcee3f82e0e9ffb251dc7dc0600ef599087a89b623ca1402`

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

Start by cloning the latest tagged release. If it's not in a release, it has not been fully tested, and may have bugs.

#### Modifying icon

Replace `assets/img/icon.png` with your icon image. Make sure it is 1024x1024.

Run `npm install -g yo generator-rn-toolbox` (You may need to run this with sudo)

Run `yo rn-toolbox:assets --icon assets/img/icon.png --force`

When it asks for the name of your react-native project, enter `TonChan`

#### Renaming app

There is a tool that does this, `react-native-rename`. However, the native code, (`android/app/src/main/jni/TurtleCoin.cpp`) needs the name of the class to find the Java/C++ interface.

If you use this tool, you will probably need to update that code.

Run `npm install -g react-native-rename` (You may need to run this with sudo)

Run `react-native-rename your-new-project-name` from this directory. (Obviously, replace with the desired name)

This might confuse the build system. You probably should do this before installing.

#### Building an APK

You will need to set up your signing key, and keystore file. See https://facebook.github.io/react-native/docs/signed-apk-android.html#generating-a-signing-key

#### Config

Edit `src/Config.js`. The fields should be self explanatory. Make sure to recompile.

#### Sentry

Sentry is a tool to report crashes in the application. *Please* configure this, or disable it, so we do not get reported errors for your application.

Remove the two files `android/sentry.properties` and `ios/sentry.properties`, and then run `react-native link`. 

This will run the sentry setup wizard, to setup error reporting for your app.

Then, copy the line of code `Sentry.config('https://8ecf138e1d1e4d558178be3f2b5e1925@sentry.io/1411753').install();` that is shown on the configuration page, and replace with our line in `src/Sentry.js`.

Your API key will be different, don't just copy the one here.

Finally, replace `Config.coinName === 'TurtleCoin'` in `src/Sentry.js` with the coin name defined in the config.

Once you've done that, you can test sentry is working by adding something like `throw new Error('Hello, sentry');` in the mainscreen constructor.
