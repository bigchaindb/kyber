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

import { API_PATH } from '../constants/api_urls'
import {
    postTransaction,
    pollStatusAndFetchTransaction,
    requestStatus
} from '../utils/bigchaindb_utils';


console.log("API_PATH:", API_PATH);
// create some identities with a private and a public key
const alice = new Ed25519Keypair();
const bob = new Ed25519Keypair();

let txTransferBobSigned;
// create an asset ie something you want to track or transfer
// think in terms of tokens, versioned data, currency, cars, energy,
// houses, land, diamonds, bikes, permission, personal info, vouchers, ...
const txCreateAliceSimple = makeCreateTransaction(
    {assetMessage: 'I will stick to every future transfer transaction'},
    {metaDataMessage: 'I am specific to this create transaction'},
    [makeOutput(makeEd25519Condition(alice.publicKey))],
    alice.publicKey
);
// sign/fulfill the transaction
const txCreateAliceSimpleSigned = signTransaction(txCreateAliceSimple, alice.privateKey);

// send it off to bigchaindb
console.log('Posting signed transaction: ', txCreateAliceSimpleSigned);
postTransaction(txCreateAliceSimpleSigned)
    .then((res) => {
        console.log('Response from BDB server', res);
        // request the status
        requestStatus(txCreateAliceSimpleSigned.id)
            .then((res) => console.log('Transaction status:', res.status));
        // poll the status every 0.5 seconds
        return pollStatusAndFetchTransaction(txCreateAliceSimpleSigned)
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
        const txTransferBob = makeTransferTransaction(
            txCreateAliceSimpleSigned,
            {metaDataMessage: 'I am specific to this transfer transaction'},
            [makeOutput(makeEd25519Condition(bob.publicKey))], 0);
        // sign with alice's private key
        txTransferBobSigned = signTransaction(txTransferBob, alice.privateKey);
        console.log('d', txTransferBobSigned)
        console.log('Posting signed transaction: ', txTransferBobSigned);
        // post and poll status
        return postTransaction(txTransferBobSigned)
    })
    .then((res) => {
        console.log('Response from BDB server:', res);
        return pollStatusAndFetchTransaction(txTransferBobSigned);
    })