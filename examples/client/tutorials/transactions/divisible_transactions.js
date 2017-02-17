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

const txCreateAliceDivisible = makeCreateTransaction(
    {assetMessage: 'I will stick to every future transfer transaction'},
    {metaDataMessage: 'I am specific to this create transaction'},
    [makeOutput(makeEd25519Condition(alice.publicKey), 4)],
    alice.publicKey
);

// sign, post and poll status
const txCreateAliceDivisibleSigned = signTransaction(txCreateAliceDivisible, alice.privateKey);
const assetId = txCreateAliceDivisible.id;

console.log('Posting signed transaction: ', txCreateAliceDivisibleSigned);
postTransaction(txCreateAliceDivisibleSigned)
    .then((res) => {
        console.log('Response from BDB server', res);
        return pollStatusAndFetchTransaction(txCreateAliceDivisibleSigned)
    })
    .then((res) => {
        listTransactions({asset_id: assetId})
            .then((res) => {
                console.log('Retrieve list of transactions with asset_id', assetId, res);
            });

        listTransactions({asset_id: assetId, operation: 'create'})
            .then((res) => {
                console.log('Retrieve list of create transactions with asset_id', assetId, res);
            });

        listTransactions({asset_id: assetId, operation: 'transfer'})
            .then((res) => {
                console.log('Retrieve list of transfer transactions with asset_id', assetId, res);
            });
    });
