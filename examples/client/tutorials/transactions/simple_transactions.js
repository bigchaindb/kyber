// Install necessary polyfills (see supported browsers) into global
import 'core-js/es6';
import 'core-js/stage/4';
import 'isomorphic-fetch';

import {
    Ed25519Keypair,
    makeCreateTransaction,
    makeTransferTransaction,
    makeOutput,
    makeEd25519Condition,
    signTransaction,
} from 'js-bigchaindb-quickstart';

import {
    postTransaction,
    pollStatusAndFetchTransaction,
    requestStatus
} from '../utils/bigchaindb_utils';


const alice = new Ed25519Keypair();
const bob = new Ed25519Keypair();
const carly = new Ed25519Keypair();

const txCreateAliceSimple = makeCreateTransaction(
    {assetMessage: 'I will stick to every future transfer transaction'},
    {metaDataMessage: 'I am specific to this create transaction'},
    [makeOutput(makeEd25519Condition(alice.publicKey))],
    alice.publicKey
);
const txCreateAliceSimpleSigned = signTransaction(txCreateAliceSimple, alice.privateKey);

console.log('Posting signed transaction: ', txCreateAliceSimpleSigned);
postTransaction(txCreateAliceSimpleSigned)
    .then((res) => {
        console.log('Response from BDB server', res);
        requestStatus(txCreateAliceSimpleSigned.id)
            .then((res) => console.log('Transaction status:', res.status));
        pollStatusAndFetchTransaction(txCreateAliceSimpleSigned)
    });


const txCreateAliceDivisible = makeCreateTransaction(
    {assetMessage: 'I will stick to every future transfer transaction'},
    {metaDataMessage: 'I am specific to this create transaction'},
    [makeOutput(makeEd25519Condition(alice.publicKey), 4)],
    alice.publicKey
);
const txCreateAliceDivisibleSigned = signTransaction(txCreateAliceDivisible, alice.privateKey);

console.log('Posting signed transaction: ', txCreateAliceDivisibleSigned);
postTransaction(txCreateAliceDivisibleSigned)
    .then((res) => {
        console.log('Response from BDB server', res);
        return pollStatusAndFetchTransaction(txCreateAliceDivisibleSigned)
    })
