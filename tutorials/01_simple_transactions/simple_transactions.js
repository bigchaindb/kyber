// Install necessary polyfills (see supported browsers) into global
import 'core-js/es6';
import 'core-js/stage/4';
import 'isomorphic-fetch';

import * as driver from 'js-bigchaindb-quickstart';

import {API_PATH} from '../constants/application_constants';
console.log("API_PATH: ", API_PATH);

// create some identities with a private and a public key
const alice = new driver.Ed25519Keypair();
const bob = new driver.Ed25519Keypair();

let txTransferBobSigned;
// create an asset ie something you want to track or transfer
// think in terms of tokens, versioned data, currency, cars, energy,
// houses, land, diamonds, bikes, permission, personal info, vouchers, ...
const txCreateAliceSimple = driver.Transaction.makeCreateTransaction(
    {assetMessage: 'I will stick to every future transfer transaction'},
    {metaDataMessage: 'I am specific to this create transaction'},
    [driver.Transaction.makeOutput(driver.Transaction.makeEd25519Condition(alice.publicKey))],
    alice.publicKey
);
// sign/fulfill the transaction
const txCreateAliceSimpleSigned = driver.Transaction.signTransaction(txCreateAliceSimple, alice.privateKey);

// send it off to bigchaindb
console.log('Posting signed transaction: ', txCreateAliceSimpleSigned);
driver.Connection.postTransaction(txCreateAliceSimpleSigned, API_PATH)
    .then((res) => {
        console.log('Response from BDB server', res);
        // request the status
        driver.Connection
            .getStatus(txCreateAliceSimpleSigned.id, API_PATH)
            .then((res) => console.log('Transaction status:', res.status));
        // poll the status every 0.5 seconds
        return driver.Connection.pollStatusAndFetchTransaction(txCreateAliceSimpleSigned.id, API_PATH)
    })
    .then((res) => {
        // the asset can now be transfered
        // every transaction on this asset will carry the asset_id
        // and can be queried by asset_id
        // transfer the asset to bob
        // note that you can append metadata to each transaction
        // these can represent state updates such as:
        // per-transaction-messages, measured values, data stream values
        // incremental update, git commit, ...
        const txTransferBob = driver.Transaction.makeTransferTransaction(
            txCreateAliceSimpleSigned,
            {metaDataMessage: 'I am specific to this transfer transaction'},
            [driver.Transaction.makeOutput(driver.Transaction.makeEd25519Condition(bob.publicKey))], 0);
        // sign with alice's private key
        txTransferBobSigned = driver.Transaction.signTransaction(txTransferBob, alice.privateKey);
        console.log('Posting signed transaction: ', txTransferBobSigned);
        // post and poll status
        return driver.Connection.postTransaction(txTransferBobSigned, API_PATH)
    })
    .then((res) => {
        console.log('Response from BDB server:', res);
        return driver.Connection.pollStatusAndFetchTransaction(txTransferBobSigned.id, API_PATH);
    });