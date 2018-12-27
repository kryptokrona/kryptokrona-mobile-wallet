# ton-chan - A mobile, native TurtleCoin wallet

## Setup

Clone the repo:

`git clone https://github.com/zpalmtree/ton-chan.git`

`cd ton-chan`

Install npm if you don't have it already:

* Ubuntu - `sudo apt-get install nodejs npm -y`
* Arch Linux - `pacman -S npm`

Install the code dependencies:

`npm install`

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

Run `react-native run-android`

If you get an error about 'Unsupported major.minor version', you may need to set JAVA_HOME to point to the correct jdk.

For example, `export JAVA_HOME=/usr/lib/jvm/java-8-openjdk/jre/`

## Developing

You probably want to run `react-native log-android` so you can read the console output, and have an easier log of what's going on as you're developing. Errors will get printed to the device, but console.log won't, and it's a little hard to read.

You probably also want to enable hot reloading. Hit "Ctrl-M" in your emulator, or type `adb shell input keyevent 82` to open the developer menu, and enable both `Live Reload` and `Hot Reloading`.

## Running natively on your Android device

Follow [this](https://facebook.github.io/react-native/docs/running-on-device.html) guide.

## Building an APK

Follow [this](https://facebook.github.io/react-native/docs/signed-apk-android.html) guide.

Once you have finished:

`cd android`

Compile the APK:

`./gradlew assembleRelease`

You may need to uninstall a previous version of the app:

`adb -d uninstall "com.TonChan"`

Install the APK on your device:

`./gradlew installRelease`

If it all works, you can then upload to the play store.

## Forking

#### Modifying icon

Replace `assets/img/icon.png` with your icon image. Make sure it is 1024x1024.

Run `npm install -g yo generator-rn-toolbox` (You may need to run this with sudo)

Run `yo rn-toolbox:assets --icon assets/img/icon.png --force`

When it asks for the name of your react-native project, enter `tonchan` (Not ton-chan!)

#### Renaming app

Run `npm install -g react-native-rename` (You may need to run this with sudo)

Run `react-native-name your-new-project-name` from this directory. (Obviously, replace with the desired name)
