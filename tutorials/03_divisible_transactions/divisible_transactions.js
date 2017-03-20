// Install necessary polyfills (see supported browsers) into global
import 'core-js/es6';
import 'core-js/stage/4';
import 'isomorphic-fetch';

import {
    Ed25519Keypair,
    listOutputs,
    listTransactions,
    makeCreateTransaction,
    makeTransferTransaction,
    makeOutput,
    makeEd25519Condition,
    postTransaction,
    pollStatusAndFetchTransaction,
    signTransaction
} from 'js-bigchaindb-quickstart';

import {API_PATH} from '../constants/application_constants';
console.log("API_PATH: ", API_PATH);

const alice = new Ed25519Keypair();
const bob = new Ed25519Keypair();
const carly = new Ed25519Keypair();

const txCreateAliceDivisible = makeCreateTransaction(
    {assetMessage: 'I will stick to every future transfer transaction'},
    {metaDataMessage: 'I am specific to this create transaction'},
    [makeOutput(makeEd25519Condition(alice.publicKey), 4)],
    alice.publicKey
);

// sign, post and poll status
const txCreateAliceDivisibleSigned = signTransaction(txCreateAliceDivisible, alice.privateKey);
const assetId = txCreateAliceDivisible.id;
let txTransferDivisibleSigned;
let txTransferDivisibleInputsSigned;

console.log('Posting signed transaction: ', txCreateAliceDivisibleSigned);
postTransaction(txCreateAliceDivisibleSigned, API_PATH)
    .then((res) => {
        console.log('Response from BDB server', res);
        return pollStatusAndFetchTransaction(txCreateAliceDivisibleSigned.id, API_PATH)
    })
    .then((res) => {
        // divide the coin of 4 into 3 outputs:
        //     - 2 for carly
        //     - 1 for bob
        //     - 1 for alice (change)
        const txTransferDivisible = makeTransferTransaction(
            txCreateAliceDivisibleSigned,
            {
                metaDataMessage: 'I am specific to this transfer transaction'
            },
            [
                makeOutput(makeEd25519Condition(carly.publicKey), 2),
                makeOutput(makeEd25519Condition(bob.publicKey), 1),
                makeOutput(makeEd25519Condition(alice.publicKey), 1)
            ], 0);
        txTransferDivisibleSigned = signTransaction(txTransferDivisible, alice.privateKey);

        console.log('Posting signed transaction: ', txTransferDivisibleSigned);
        return postTransaction(txTransferDivisibleSigned, API_PATH)
    })
    .then((res) => {
        console.log('Response from BDB server:', res);
        return pollStatusAndFetchTransaction(txTransferDivisibleSigned.id, API_PATH);
    })
    .then((res) => {
        // combine some coins:
        //     - 1 coin of amount 2 (carly)
        //     - 1 coin of amount 1 (bob)
        // and divide them:
        //     - 1 coin of amount 1 (carly)
        //     - 1 coin of amount 2 (alice)
        const txTransferDivisibleInputs = makeTransferTransaction(
            txTransferDivisibleSigned,
            {
                metaDataMessage: 'I am specific to this transfer transaction'
            },
            [
                makeOutput(makeEd25519Condition(carly.publicKey), 1),
                makeOutput(makeEd25519Condition(alice.publicKey), 2)
            ], 0, 1);
        txTransferDivisibleInputsSigned = signTransaction(
            txTransferDivisibleInputs,
            carly.privateKey, bob.privateKey);

        console.log('Posting signed transaction: ', txTransferDivisibleInputsSigned);
        return postTransaction(txTransferDivisibleInputsSigned, API_PATH)
    })
    .then((res) => {
        console.log('Response from BDB server:', res);
        return pollStatusAndFetchTransaction(txTransferDivisibleInputsSigned.id, API_PATH);
    })
    .then((res) => {
        listTransactions({asset_id: assetId}, API_PATH)
            .then((res) => {
                console.log('Retrieve list of transactions with asset_id', assetId, res);
            });
    });
