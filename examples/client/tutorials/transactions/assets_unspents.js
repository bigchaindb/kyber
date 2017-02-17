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

const txCreateAlice = makeCreateTransaction(
    {assetMessage: 'I will stick to every future transfer transaction'},
    {metaDataMessage: 'I am specific to this create transaction'},
    [makeOutput(makeEd25519Condition(alice.publicKey), 4)],
    alice.publicKey
);
const txCreateAliceSigned = signTransaction(txCreateAlice, alice.privateKey);

let txTransferBobSigned;
let txTransferCarlySigned;

console.log('Posting signed transaction: ', txCreateAliceSigned);
postTransaction(txCreateAliceSigned)
    .then((res) => {
        console.log('Response from BDB server', res);
        return pollStatusAndFetchTransaction(txCreateAliceSigned)
    })
    .then((res) => {
        const txTransferBob = makeTransferTransaction(
            txCreateAliceSigned,
            {metaDataMessage: 'I am specific to this transfer transaction'},
            [makeOutput(makeEd25519Condition(alice.publicKey), 3),
             makeOutput(makeEd25519Condition(bob.publicKey), 1)], 0);
        console.log(txTransferBob)
        txTransferBobSigned = signTransaction(txTransferBob, alice.privateKey);

        console.log('Posting signed transaction: ', txTransferBobSigned);
        return postTransaction(txTransferBobSigned)
    })
    .then((res) => {
        console.log('Response from BDB server:', res);
        return pollStatusAndFetchTransaction(txTransferBobSigned);
    })
    .then((res) => {
        const txTransferBobDouble = makeTransferTransaction(
            txCreateAliceSigned,
            {metaDataMessage: 'Double spending transaction: will fail'},
            [makeOutput(makeEd25519Condition(bob.publicKey))], 0);
        const txTransferBobDoubleSigned = signTransaction(txTransferBobDouble, alice.privateKey);

        console.log('Posting double spend transaction: ', txTransferBobDoubleSigned);
        return postTransaction(txTransferBobDoubleSigned)
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
        return postTransaction(txTransferCarlySigned)
    })
    .then((res) => {
        console.log('Response from BDB server:', res);
        return pollStatusAndFetchTransaction(txTransferCarlySigned);
    })
    .then((res) => {
        listTransactions({asset_id: txTransferCarlySigned.asset.id})
            .then((res) => {
                console.log('Retrieve list of transactions with asset_id',
                    txTransferCarlySigned.asset.id, res);
            });

        listTransactions({asset_id: txTransferCarlySigned.asset.id, operation: 'create'})
            .then((res) => {
                console.log('Retrieve list of create transactions with asset_id',
                    txTransferCarlySigned.asset.id, res);
            });

        listTransactions({asset_id: txTransferCarlySigned.asset.id, operation: 'transfer'})
            .then((res) => {
                console.log('Retrieve list of transfer transactions with asset_id',
                    txTransferCarlySigned.asset.id, res);
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
