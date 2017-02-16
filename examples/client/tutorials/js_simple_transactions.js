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
    pollStatusAndFetchTransaction
} from './bigchaindb_utils';


const alice = new Ed25519Keypair();
const bob = new Ed25519Keypair();
const carly = new Ed25519Keypair();

const tx = makeCreateTransaction(
    {assetMessage: 'I will stick to every future transfer transaction'},
    {metaDataMessage: 'I am specific to this create transaction'},
    [makeOutput(makeEd25519Condition(bob.publicKey))],
    alice.publicKey
);
const signedTx = signTransaction(tx, alice.privateKey);

const txTransfer = makeTransferTransaction(
    signedTx,
    {metaDataMessage: 'I am specific to this transfer transaction'},
    [makeOutput(makeEd25519Condition(carly.publicKey))], 0);
const signedTxTransfer = signTransaction(txTransfer, bob.privateKey);

console.log('Posting signed transaction: ', signedTx);
postTransaction(signedTx)
    .then((res) => {
        console.log('Response from BDB server', res);
        pollStatusAndFetchTransaction(signedTx, () => {
            console.log('Posting signed transaction: ', signedTxTransfer);
            postTransaction(signedTxTransfer)
                .then((res) => {
                    console.log('Response from BDB server:', res);
                    pollStatusAndFetchTransaction(signedTxTransfer)
                });
        });
});
