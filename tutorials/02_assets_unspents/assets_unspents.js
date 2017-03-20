// Install necessary polyfills (see supported browsers) into global
import 'core-js/es6';
import 'core-js/stage/4';
import 'isomorphic-fetch';

import {
    Ed25519Keypair,
    getStatus,
    listTransactions,
    listOutputs,
    makeCreateTransaction,
    makeTransferTransaction,
    makeOutput,
    makeEd25519Condition,
    pollStatusAndFetchTransaction,
    postTransaction,
    signTransaction,
} from 'js-bigchaindb-quickstart';


import {API_PATH} from '../constants/application_constants';
console.log("API_PATH: ", API_PATH);

const alice = new Ed25519Keypair();
const bob = new Ed25519Keypair();
const carly = new Ed25519Keypair();

const txCreateAlice = makeCreateTransaction(
    {assetMessage: 'I will stick to every future transfer transaction'},
    {metaDataMessage: 'I am specific to this create transaction'},
    [makeOutput(makeEd25519Condition(alice.publicKey), 4)],
    alice.publicKey
);
const txCreateAliceSigned = signTransaction(txCreateAlice, alice.privateKey);

let txTransferBobSigned;
let txTransferCarlySigned;
const assetId = txCreateAliceSigned.id;

console.log('Posting signed transaction: ', txCreateAliceSigned);
postTransaction(txCreateAliceSigned, API_PATH)
    .then((res) => {
        console.log('Response from BDB server', res);
        return pollStatusAndFetchTransaction(txCreateAliceSigned.id, API_PATH)
    })
    .then((res) => {
        const txTransferBob = makeTransferTransaction(
            txCreateAliceSigned,
            {metaDataMessage: 'I am specific to this transfer transaction'},
            [makeOutput(makeEd25519Condition(alice.publicKey), 3),
             makeOutput(makeEd25519Condition(bob.publicKey), 1)], 0);
        txTransferBobSigned = signTransaction(txTransferBob, alice.privateKey);

        console.log('Posting signed transaction: ', txTransferBobSigned);
        return postTransaction(txTransferBobSigned, API_PATH)
    })
    .then((res) => {
        console.log('Response from BDB server:', res);
        return pollStatusAndFetchTransaction(txTransferBobSigned.id, API_PATH);
    })
    .then((res) => {
        const txTransferBobDouble = makeTransferTransaction(
            txCreateAliceSigned,
            {metaDataMessage: 'Double spending transaction: will fail'},
            [makeOutput(makeEd25519Condition(bob.publicKey))], 0);
        const txTransferBobDoubleSigned = signTransaction(txTransferBobDouble, alice.privateKey);

        console.log('Posting double spend transaction: ', txTransferBobDoubleSigned);
        return postTransaction(txTransferBobDoubleSigned, API_PATH)
    })
    .then((res) => {
        console.log('We shouldnt be in here, as double spents fail');
    })
    .catch((res) => {
        const txTransferCarly = makeTransferTransaction(
            txTransferBobSigned,
            {metaDataMessage: 'I am specific to this transfer transaction'},
            [makeOutput(makeEd25519Condition(carly.publicKey))], 1);
        txTransferCarlySigned = signTransaction(txTransferCarly, bob.privateKey);

        console.log('Posting signed transaction: ', txTransferCarlySigned);
        return postTransaction(txTransferCarlySigned, API_PATH)
    })
    .then((res) => {
        console.log('Response from BDB server:', res);
        return pollStatusAndFetchTransaction(txTransferCarlySigned.id, API_PATH);
    })
    .then((res) => {
        listTransactions({asset_id: assetId}, API_PATH)
            .then((res) => {
                console.log('Retrieve list of transactions with asset_id', assetId, res);
            });

        listTransactions({asset_id: assetId, operation: 'create'}, API_PATH)
            .then((res) => {
                console.log('Retrieve list of create transactions with asset_id', assetId, res);
            });

        listTransactions({asset_id: assetId, operation: 'transfer'}, API_PATH)
            .then((res) => {
                console.log('Retrieve list of transfer transactions with asset_id', assetId, res);
            });

        listOutputs({public_key: alice.publicKey}, API_PATH)
            .then((res) => {
                console.log('Retrieve list of outputs with public_key', alice.publicKey, res);
            });

        listOutputs({public_key: alice.publicKey, unspent: true}, API_PATH)
            .then((res) => {
                console.log('Retrieve list of unspent outputs with public_key', alice.publicKey, res);
            });

        listOutputs({public_key: bob.publicKey}, API_PATH)
            .then((res) => {
                console.log('Retrieve list of outputs with public_key', bob.publicKey, res);
            });

        listOutputs({public_key: bob.publicKey, unspent: true}, API_PATH)
            .then((res) => {
                console.log('Retrieve list of unspent outputs with public_key', bob.publicKey, res);
            });

        listOutputs({public_key: carly.publicKey}, API_PATH)
            .then((res) => {
                console.log('Retrieve list of outputs with public_key', carly.publicKey, res);
            });

        listOutputs({public_key: carly.publicKey, unspent: true}, API_PATH)
            .then((res) => {
                console.log('Retrieve list of unspent outputs with public_key', carly.publicKey, res);
            });
    });
