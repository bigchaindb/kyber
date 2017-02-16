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
    listTransactions,
    listOutputs
} from '../utils/bigchaindb_utils';


const alice = new Ed25519Keypair();
const bob = new Ed25519Keypair();
const carly = new Ed25519Keypair();

const tx = makeCreateTransaction(
    {assetMessage: 'I will stick to every future transfer transaction'},
    {metaDataMessage: 'I am specific to this create transaction'},
    [makeOutput(makeEd25519Condition(alice.publicKey))],
    alice.publicKey
);
const signedTx = signTransaction(tx, alice.privateKey);

let signedTxTransferToBob;
let signedTxTransferToCarly;

console.log('Posting signed transaction: ', signedTx);
postTransaction(signedTx)
    .then((res) => {
        console.log('Response from BDB server', res);
        return pollStatusAndFetchTransaction(signedTx)
    })
    .then((res) => {
        const txTransferToBob = makeTransferTransaction(
            signedTx,
            {metaDataMessage: 'I am specific to this transfer transaction'},
            [makeOutput(makeEd25519Condition(bob.publicKey))], 0);
        signedTxTransferToBob = signTransaction(txTransferToBob, alice.privateKey);

        console.log('Posting signed transaction: ', signedTxTransferToBob);
        return postTransaction(signedTxTransferToBob)
    })
    .then((res) => {
        console.log('Response from BDB server:', res);
        return pollStatusAndFetchTransaction(signedTxTransferToBob);
    })
    .then((res) => {
        const txTransferToBobDouble = makeTransferTransaction(
            signedTx,
            {metaDataMessage: 'Double spending transaction: will fail'},
            [makeOutput(makeEd25519Condition(bob.publicKey))], 0);
        const signedTxTransferToBobDouble = signTransaction(txTransferToBobDouble, alice.privateKey);

        console.log('Posting double spend transaction: ', signedTxTransferToBobDouble);
        return postTransaction(signedTxTransferToBobDouble)
    })
    .then((res) => {
        console.log('We shouldnt be in here, as double spents fail');
    })
    .catch((res) => {
        const txTransferToCarly = makeTransferTransaction(
            signedTxTransferToBob,
            {metaDataMessage: 'I am specific to this transfer transaction'},
            [makeOutput(makeEd25519Condition(carly.publicKey))], 0);
        signedTxTransferToCarly = signTransaction(txTransferToCarly, bob.privateKey);

        console.log('Posting signed transaction: ', signedTxTransferToCarly);
        return postTransaction(signedTxTransferToCarly)
    })
    .then((res) => {
        console.log('Response from BDB server:', res);
        return pollStatusAndFetchTransaction(signedTxTransferToCarly);
    })
    .then((res) => {
        listTransactions({asset_id: signedTxTransferToCarly.asset.id})
            .then((res) => {
                console.log('Retrieve list of transactions with asset_id',
                    signedTxTransferToCarly.asset.id, res);
            });

        listTransactions({asset_id: signedTxTransferToCarly.asset.id, operation: 'create'})
            .then((res) => {
                console.log('Retrieve list of create transactions with asset_id',
                    signedTxTransferToCarly.asset.id, res);
            });

        listTransactions({asset_id: signedTxTransferToCarly.asset.id, operation: 'transfer'})
            .then((res) => {
                console.log('Retrieve list of transfer transactions with asset_id',
                    signedTxTransferToCarly.asset.id, res);
            });

        listOutputs({public_key: alice.publicKey})
            .then((res) => {
                console.log('Retrieve list of outputs with public_key', alice.publicKey, res);
            });

        listOutputs({public_key: alice.publicKey, unspent: true})
            .then((res) => {
                console.log('Retrieve list of unspent outputs with public_key', alice.publicKey, res);
            });

        listOutputs({public_key: bob.publicKey})
            .then((res) => {
                console.log('Retrieve list of outputs with public_key', bob.publicKey, res);
            });

        listOutputs({public_key: bob.publicKey, unspent: true})
            .then((res) => {
                console.log('Retrieve list of unspent outputs with public_key', bob.publicKey, res);
            });

        listOutputs({public_key: carly.publicKey})
            .then((res) => {
                console.log('Retrieve list of outputs with public_key', carly.publicKey, res);
            });

        listOutputs({public_key: carly.publicKey, unspent: true})
            .then((res) => {
                console.log('Retrieve list of unspent outputs with public_key', carly.publicKey, res);
            });
    });
