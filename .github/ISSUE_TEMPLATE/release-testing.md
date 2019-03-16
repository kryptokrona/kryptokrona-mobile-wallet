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

## General Operation

- [ ] Wallet can sync
- [ ] Wallet can receive a transaction
- [ ] Coin price is loaded from API
- [ ] Notifications are received when transactions is received in background
- [ ] Background sync works
- [ ] Wallet sync process is saved

## Transferring

- [ ] Wallet can send a transaction
- [ ] Balance is correctly locked after transaction
- [ ] Cannot send negative amount
- [ ] Network fee is correctly displayed
- [ ] Dev fee is correctly displayed
- [ ] Receiver receives transaction
- [ ] Dev wallet receives transaction

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
