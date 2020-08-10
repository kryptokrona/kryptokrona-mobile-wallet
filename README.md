# Kryptokrona Mobile Wallet

![Screenshot](https://user-images.githubusercontent.com/3246908/89831748-a4696200-db5e-11ea-9a87-758617a504b8.png)

### Initial Setup

* `cd kryptokrona-mobile-wallet`
* `yarn install`

### Running

* `node --max-old-space-size=8192 node_modules/react-native/local-cli/cli.js start` (Just need to run this once to start the server, leave it running)
* `react-native run-android`

### Logging

`react-native log-android`

### Creating a release

You need to bump the version number in:

* `src/Config.js` - `appVersion`
* `android/app/build.gradle` - `versionCode` and `versionName`
* `package.json` - `version` - Not strictly required
* Update user agent in `android/app/src/main/java/com/xkr/MainApplication.java` and `android/app/src/main/java/com/xkr/TurtleCoinModule.java`

Then
`cd android`
`./gradlew bundleRelease`
Optionally
`./gradlew installRelease`

or `yarn deploy-android`

### Integrating QR Codes or URIs

Kryptokrona Mobile Wallet supports two kinds of QR codes.

* Standard addresses / integrated addresses - This is simply the address encoded as a QR code.

* xkr:// URI encoded as a QR code.

Your uri must begin with `xkr://` followed by the address to send to, for example, `xkr://SEKReTyRMJx2LTUrbf2r7GdMJ9PY5yHbYN6MCZkKUVvKZSwwwf3HnUS6Jia3TkD4jWgfxeh1AEYV3DKEAesSb7mSAvNqfCNBXrg`

There are a few optional parameters.

* `name` - This is used to add you to the users address book, and identify you on the 'Confirm' screen. A name can contain spaces, and should be URI encoded.
* `amount` - This is the amount to send you. This should be specified in atomic units.
* `paymentid` - If not using integrated address, you can specify a payment ID. Specifying an integrated address and a payment ID is illegal.

An example of a URI containing all of the above parameters:

```
xkr://SEKReTyRMJx2LTUrbf2r7GdMJ9PY5yHbYN6MCZkKUVvKZSwwwf3HnUS6Jia3TkD4jWgfxeh1AEYV3DKEAesSb7mSAvNqfCNBXrg?amount=10000&name=Starbucks%20Coffee&paymentid=f13adc8ac78eb22ffcee3f82e0e9ffb251dc7dc0600ef599087a89b623ca1402
```

This would send `100 XKR` (10000 in atomic units) to the address `SEKR2Fyavy8CXG8BPEbNeCHFZ1fuDCYCZ3vW5H5LXN4K2M2MHUpTENip9bbavpHvvPwb4NDkBWrNgURAd5DB38FHXWZyoBh4wW`, using the name `Starbucks Coffee` (Note the URI encoding), and using a payment ID of `f13adc8ac78eb22ffcee3f82e0e9ffb251dc7dc0600ef599087a89b623ca1402`

You can also just display the URI as a hyperlink. If a user clicks the link, it will open the app, and jump to the confirm screen, just as a QR code would function. (Provided all the fields are given)
