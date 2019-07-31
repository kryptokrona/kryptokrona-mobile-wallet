---
name: Release Testing
about: Tests to be performed before deploying a release
title: "[RELEASE CANDIDATE]"
labels: release-candidate
assignees: ''

---

# Release Candidate

## Creation

- [ ] Can create a wallet
- [ ] Can import a wallet with keys
- [ ] Can import a wallet with seed
- [ ] Import scan height range works
- [ ] Import scan height month works
- [ ] Import scan height exact height works
- [ ] New PIN is prompted for after 'Forgot PIN' deletion

## General Operation

- [ ] Wallet can sync
- [ ] Wallet can receive a transaction
- [ ] Coin price is loaded from API
- [ ] Notifications are received when transactions is received in background
- [ ] Background sync works
- [ ] Wallet sync process is saved
- [ ] Can login with fingerprint
- [ ] Can login with pin
- [ ] Can login without authentication
- [ ] Animations are fired on balance recieve, sync completion, refreshing price

## Transferring

- [ ] Wallet can send a transaction
- [ ] Balance is correctly locked after transaction
- [ ] Cannot send negative amount
- [ ] Network fee is correctly displayed
- [ ] Dev fee is correctly displayed
- [ ] Receiver receives transaction
- [ ] Dev wallet receives transaction
- [ ] Address of outgoing transaction is saved, and remains after reload
- [ ] Payee name of outgoing transaction is saved, and remains after reload
- [ ] Can save a memo for outgoing transaction

## Payees

- [ ] Can add a payee via transfer screen
- [ ] Can add a payee via transfer screen with QR code
- [ ] Cannot create an existing payee
- [ ] Can add a payee via recipients screen
- [ ] Can modify a payee via recipients screen
- [ ] Payees are retained after closing application

## Transactions

- [ ] Incoming transactions are displayed
- [ ] Outgoing transactions are displayed
- [ ] Transaction extended details are correct
- [ ] Can view transaction on block explorer
- [ ] Timestamps of transactions are correct

## Settings

- [ ] Light mode works
- [ ] Dark mode works
- [ ] Preferences are loaded when closing/reopening
- [ ] Currency swapping works correctly
- [ ] Pin confirmation works correctly
- [ ] Disabling notifications works correctly
- [ ] Correct private keys + seed are displayed on backup screen
- [ ] Seed is not displayed when wallet is not mnemonic
- [ ] FAQ displays correctly
- [ ] Link to app store / google play works correctly
- [ ] Github link works correctly
- [ ] Logging screen displays correctly
- [ ] Deleting wallet works correctly
- [ ] Reset from timestamp created wallet works
- [ ] Reset from scan height created wallet works
- [ ] Reset from scan height of zero works
- [ ] Swapping auth method works correctly

## QR codes and URIs

Can handle the following URIs:
(Since github doesn't allow clickable URIs - https://hackmd.io/SgUw6oF9RLCjwRMnD0jQpQ?view)
- [ ] `turtlecoin://TRTLv2Fyavy8CXG8BPEbNeCHFZ1fuDCYCZ3vW5H5LXN4K2M2MHUpTENip9bbavpHvvPwb4NDkBWrNgURAd5DB38FHXWZyoBh4wW?amount=10000&name=Starbucks%20Coffee&paymentid=f13adc8ac78eb22ffcee3f82e0e9ffb251dc7dc0600ef599087a89b623ca1402`
(Address, amount, name, payment ID)

- [ ] `turtlecoin://TRTLv2Fyavy8CXG8BPEbNeCHFZ1fuDCYCZ3vW5H5LXN4K2M2MHUpTENip9bbavpHvvPwb4NDkBWrNgURAd5DB38FHXWZyoBh4wW`
(Just address)

- [ ] `turtlecoin://TRTLv2Fyavy8CXG8BPEbNeCHFZ1fuDCYCZ3vW5H5LXN4K2M2MHUpTENip9bbavpHvvPwb4NDkBWrNgURAd5DB38FHXWZyoBh4wW?amount=10000`
(Address, amount)

- [ ] `turtlecoin://TRTLv2Fyavy8CXG8BPEbNeCHFZ1fuDCYCZ3vW5H5LXN4K2M2MHUpTENip9bbavpHvvPwb4NDkBWrNgURAd5DB38FHXWZyoBh4wW?name=Test`
(Address, name)

Can handle the following QR codes:

- [ ] ![](https://chart.googleapis.com/chart?cht=qr&chs=256x256&chl=turtlecoin%3A%2F%2FTRTLv2Fyavy8CXG8BPEbNeCHFZ1fuDCYCZ3vW5H5LXN4K2M2MHUpTENip9bbavpHvvPwb4NDkBWrNgURAd5DB38FHXWZyoBh4wW%3Famount%3D10000%26name%3DStarbucks%2520Coffee%26paymentid%3Df13adc8ac78eb22ffcee3f82e0e9ffb251dc7dc0600ef599087a89b623ca1402)

- [ ] ![](https://chart.googleapis.com/chart?cht=qr&chs=256x256&chl=turtlecoin%3A%2F%2FTRTLv2Fyavy8CXG8BPEbNeCHFZ1fuDCYCZ3vW5H5LXN4K2M2MHUpTENip9bbavpHvvPwb4NDkBWrNgURAd5DB38FHXWZyoBh4wW)

- [ ] ![](https://chart.googleapis.com/chart?cht=qr&chs=256x256&chl=turtlecoin%3A%2F%2FTRTLv2Fyavy8CXG8BPEbNeCHFZ1fuDCYCZ3vW5H5LXN4K2M2MHUpTENip9bbavpHvvPwb4NDkBWrNgURAd5DB38FHXWZyoBh4wW%3Famount%3D10000)

- [ ] ![](https://chart.googleapis.com/chart?cht=qr&chs=256x256&chl=turtlecoin%3A%2F%2FTRTLv2Fyavy8CXG8BPEbNeCHFZ1fuDCYCZ3vW5H5LXN4K2M2MHUpTENip9bbavpHvvPwb4NDkBWrNgURAd5DB38FHXWZyoBh4wW%3Fname%3DTest)
