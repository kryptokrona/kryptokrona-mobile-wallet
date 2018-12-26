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
