import React from 'react';
import base58 from 'bs58';
import Tone from 'tone';

import * as driver from 'js-bigchaindb-quickstart';

import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/styles'

import TransactionActions from '../../../js/react/actions/transaction_actions';
import AudioVisual from './audio_visual';

import { fetchAsset } from './utils';

import { IconLockLocked } from '../../../js/react/components/icons';


const AssetAudioLock = React.createClass({
    propTypes: {
        activeAsset: React.PropTypes.object,
        activeAccount: React.PropTypes.object,
        assetAccount: React.PropTypes.object,
        targetFrequency: React.PropTypes.number,
        frequencyList: React.PropTypes.array,
        onFrequencyHit: React.PropTypes.func
    },

    onFrequencyHit() {
        const {onFrequencyHit} = this.props;

        onFrequencyHit();

        const {
            activeAsset,
            activeAccount,
            assetAccount,
        } = this.props;

        let transaction = this.transferTransaction(activeAsset, activeAccount);

        let fulfillment = driver.Transaction.makeThresholdCondition(1, undefined, false);

        let fulfillmentAssetAccount = driver.Transaction.makeEd25519Condition(assetAccount.vk, false);
        fulfillmentAssetAccount.sign(
            new Buffer(driver.Transaction.serializeTransactionIntoCanonicalString(transaction)),
            new Buffer(base58.decode(assetAccount.sk))
        );
        fulfillment.addSubfulfillment(fulfillmentAssetAccount);

        let subconditionWordsUri = driver.Transaction
            .ccJsonLoad(activeAsset.outputs[0].condition.details)
            .subconditions[1].body
            .getConditionUri();
        fulfillment.addSubconditionUri(subconditionWordsUri);

        transaction.inputs[0].fulfillment = fulfillment.serializeUri();

        TransactionActions.postTransaction(transaction);
        fetchAsset(activeAsset.id, assetAccount.vk)
    },

    transferTransaction(inputTransaction, toAccount) {
        const metadata = {
            'message': 'Greetings from BigchainDB'
        };

        return driver.Transaction.makeTransferTransaction(
            inputTransaction,
            metadata,
            [driver.Transaction.makeOutput(driver.Transaction.makeEd25519Condition(toAccount.vk))],
            0
        );
    },

    handleFrequencyClick(frequencyBin) {
        this.renderTone(frequencyBin, "+3")
    },

    renderTone(frequencyBin, duration) {
        const frequency = 200 + (frequencyBin-2)/(13-2) * (1100 - 200);
        //create a synth and connect it to the master output (your speakers)
        const synth = new Tone.Oscillator(frequency, "sine").toMaster();
        synth.start();
        synth.stop(duration);
    },

    render() {
        const {
            targetFrequency,
            frequencyList,
        } = this.props;

        return (
            <div>
                <IconLockLocked />
                <StatusLocked />
                <AudioVisual
                    frequencies={frequencyList}
                    onFrequencyClick={this.handleFrequencyClick}
                    onFrequencyHit={this.onFrequencyHit}
                    targetFrequency={targetFrequency}/>
            </div>
        );
    }
});

const StatusLocked = () => {
    return (
        <div className="status status--locked">
            <h2 className="status__title">Locked</h2>
            <p className="status__text">Sing to unlock. Can you hit that green note?</p>
        </div>
    )
};

export default AssetAudioLock;