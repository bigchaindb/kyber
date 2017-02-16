// Install necessary polyfills (see supported browsers) into global
import 'core-js/es6';
import 'core-js/stage/4';
import 'isomorphic-fetch';

import request from '../lib/js/utils/request';

import {
    Ed25519Keypair,
    makeCreateTransaction,
    makeTransferTransaction,
    makeOutput,
    makeEd25519Condition,
    signTransaction,
} from 'js-bigchaindb-quickstart';

const alice = new Ed25519Keypair();
const bob = new Ed25519Keypair();
const carly = new Ed25519Keypair();

const tx = makeCreateTransaction(
    {assetData: 'assetdata'},
    {metaData: 'metadata'},
    [makeOutput(makeEd25519Condition(bob.publicKey))],
    alice.publicKey
);

const signedTx = signTransaction(tx, alice.privateKey);
console.log(signedTx);

const txTransfer = makeTransferTransaction(
    signedTx,
    {metaData: 'metadata'},
    [makeOutput(makeEd25519Condition(carly.publicKey))],
    0);
const signedTxTransfer = signTransaction(txTransfer, bob.privateKey);
console.log(signedTxTransfer);

let res;

try {
    res = request('http://localhost:9984/api/v1/transactions', {
        method: 'POST',
        jsonBody: signedTx
    });
    res.then((res) => request('http://localhost:9984/api/v1/transactions', {
        method: 'POST',
        jsonBody: signedTxTransfer
    }))
} catch (e) {
    console.error(e);
    throw new Error('Unable to retrieve asset list');
}
