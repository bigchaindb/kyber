// Install necessary polyfills (see supported browsers) into global
import 'core-js/es6';
import 'core-js/stage/4';
import 'isomorphic-fetch';

import * as driver from 'js-bigchaindb-quickstart';


import {API_PATH} from '../constants/application_constants';
console.log("API_PATH: ", API_PATH);

const alice = new driver.Ed25519Keypair();
const bob = new driver.Ed25519Keypair();
const carly = new driver.Ed25519Keypair();

const txCreateAlice = driver.Transaction.makeCreateTransaction(
    {assetMessage: 'I will stick to every future transfer transaction'},
    {metaDataMessage: 'I am specific to this create transaction'},
    [driver.Transaction.makeOutput(driver.Transaction.makeEd25519Condition(alice.publicKey), 4)],
    alice.publicKey
);
const txCreateAliceSigned = driver.Transaction.signTransaction(txCreateAlice, alice.privateKey);

let txTransferBobSigned;
let txTransferCarlySigned;
const assetId = txCreateAliceSigned.id;

console.log('Posting signed transaction: ', txCreateAliceSigned);
driver.Connection
    .postTransaction(txCreateAliceSigned, API_PATH)
    .then((res) => {
        console.log('Response from BDB server', res);
        return driver.Connection.pollStatusAndFetchTransaction(txCreateAliceSigned.id, API_PATH)
    })
    .then((res) => {
        const txTransferBob = driver.Transaction.makeTransferTransaction(
            txCreateAliceSigned,
            {metaDataMessage: 'I am specific to this transfer transaction'},
            [driver.Transaction.makeOutput(driver.Transaction.makeEd25519Condition(alice.publicKey), 3),
             driver.Transaction.makeOutput(driver.Transaction.makeEd25519Condition(bob.publicKey), 1)], 0);
        txTransferBobSigned = driver.Transaction.signTransaction(txTransferBob, alice.privateKey);

        console.log('Posting signed transaction: ', txTransferBobSigned);
        return driver.Connection.postTransaction(txTransferBobSigned, API_PATH)
    })
    .then((res) => {
        console.log('Response from BDB server:', res);
        return driver.Connection.pollStatusAndFetchTransaction(txTransferBobSigned.id, API_PATH);
    })
    .then((res) => {
        const txTransferBobDouble = driver.Transaction.makeTransferTransaction(
            txCreateAliceSigned,
            {metaDataMessage: 'Double spending transaction: will fail'},
            [driver.Transaction.makeOutput(driver.Transaction.makeEd25519Condition(bob.publicKey))], 0);
        const txTransferBobDoubleSigned = driver.Transaction.signTransaction(txTransferBobDouble, alice.privateKey);

        console.log('Posting double spend transaction: ', txTransferBobDoubleSigned);
        return driver.Connection.postTransaction(txTransferBobDoubleSigned, API_PATH)
    })
    .then((res) => {
        console.log('We shouldnt be in here, as double spents fail');
    })
    .catch((res) => {
        const txTransferCarly = driver.Transaction.makeTransferTransaction(
            txTransferBobSigned,
            {metaDataMessage: 'I am specific to this transfer transaction'},
            [driver.Transaction.makeOutput(driver.Transaction.makeEd25519Condition(carly.publicKey))], 1);
        txTransferCarlySigned = driver.Transaction.signTransaction(txTransferCarly, bob.privateKey);

        console.log('Posting signed transaction: ', txTransferCarlySigned);
        return driver.Connection.postTransaction(txTransferCarlySigned, API_PATH)
    })
    .then((res) => {
        console.log('Response from BDB server:', res);
        return driver.Connection.pollStatusAndFetchTransaction(txTransferCarlySigned.id, API_PATH);
    })
    .then((res) => {
        driver.Connection.listTransactions({asset_id: assetId}, API_PATH)
            .then((res) => {
                console.log('Retrieve list of transactions with asset_id', assetId, res);
            });

        driver.Connection.listTransactions({asset_id: assetId, operation: 'create'}, API_PATH)
            .then((res) => {
                console.log('Retrieve list of create transactions with asset_id', assetId, res);
            });

        driver.Connection.listTransactions({asset_id: assetId, operation: 'transfer'}, API_PATH)
            .then((res) => {
                console.log('Retrieve list of transfer transactions with asset_id', assetId, res);
            });

        driver.Connection.listOutputs({public_key: alice.publicKey}, API_PATH)
            .then((res) => {
                console.log('Retrieve list of outputs with public_key', alice.publicKey, res);
            });

        driver.Connection.listOutputs({public_key: alice.publicKey, unspent: true}, API_PATH)
            .then((res) => {
                console.log('Retrieve list of unspent outputs with public_key', alice.publicKey, res);
            });

        driver.Connection.listOutputs({public_key: bob.publicKey}, API_PATH)
            .then((res) => {
                console.log('Retrieve list of outputs with public_key', bob.publicKey, res);
            });

        driver.Connection.listOutputs({public_key: bob.publicKey, unspent: true}, API_PATH)
            .then((res) => {
                console.log('Retrieve list of unspent outputs with public_key', bob.publicKey, res);
            });

        driver.Connection.listOutputs({public_key: carly.publicKey}, API_PATH)
            .then((res) => {
                console.log('Retrieve list of outputs with public_key', carly.publicKey, res);
            });

        driver.Connection.listOutputs({public_key: carly.publicKey, unspent: true}, API_PATH)
            .then((res) => {
                console.log('Retrieve list of unspent outputs with public_key', carly.publicKey, res);
            });
    });
