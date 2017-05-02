import React, {PropTypes, Component} from 'react'
import SpeechRecognition from 'react-speech-recognition'
import classnames from 'classnames';
import moment from 'moment';

import TransactionActions from '../../../js/react/actions/transaction_actions';
import { fetchAsset } from './utils';

import * as driver from 'js-bigchaindb-quickstart';


const propTypes = {
    magicWords: PropTypes.array,
    assetAccount: PropTypes.object,
    activeAccount: PropTypes.object,
    onWordHit: PropTypes.func,
    // Props injected by SpeechRecognition
    transcript: PropTypes.string,
    resetTranscript: PropTypes.func,
    browserSupportsSpeechRecognition: PropTypes.bool
};


class Dictaphone extends Component {

    componentWillReceiveProps(nextProps) {
        const {
            magicWords,
            activeAsset,
            assetAccount,
            activeAccount,
            onWordHit
        } = nextProps;

        if (nextProps.transcript !== this.props.transcript) {
            const magicFulfillments = this.filterTranscript(nextProps.transcript)
                .filter((item) => magicWords.indexOf(item) > -1)
                .map((word) => driver.Transaction.makeSha256Condition(word, true));

            const magicConditionUris = magicFulfillments
                .map((magicFulfillments) => magicFulfillments.getConditionUri());

            const inputCondition = driver.Transaction.ccJsonLoad(activeAsset.outputs[0].condition.details);
            const magicThreshold = inputCondition.subconditions[1].body.threshold;

            let numMagicFulfillments = 0;
            const targetSubfulfillments = inputCondition
                .subconditions[1].body.subconditions
                .map((condition) => {
                    const conditionUri = condition.body.serializeUri();
                    if (magicConditionUris.indexOf(conditionUri) > -1) {
                        numMagicFulfillments += 1;
                        return magicFulfillments[magicConditionUris.indexOf(conditionUri)];
                    }
                    return condition.body;
                });

            console.log('magic hits', numMagicFulfillments, magicThreshold);
            if (numMagicFulfillments < magicThreshold)
                return;

            const transaction = this.transferTransaction(activeAsset, activeAccount);

            let fulfillment = driver.Transaction.makeThresholdCondition(null, true);
            fulfillment.threshold = 1;

            let fulfillmentAssetAccount = driver.Transaction.makeEd25519Condition(assetAccount.vk, true);
            fulfillment.addSubconditionUri(fulfillmentAssetAccount.getConditionUri());
            let subconditionWords = driver.Transaction.makeThresholdCondition(null, true);
            subconditionWords.threshold = magicThreshold;

            targetSubfulfillments.forEach((targetSubfulfillment) => {
                if ('preimage' in targetSubfulfillment && !!targetSubfulfillment.preimage) {
                    subconditionWords.addSubfulfillment(targetSubfulfillment);
                } else {
                    subconditionWords.addSubconditionUri(targetSubfulfillment.serializeUri());
                }
            });
            fulfillment.addSubfulfillment(subconditionWords);

            transaction.inputs[0].fulfillment = fulfillment.serializeUri();
            TransactionActions.postTransaction(transaction);
            fetchAsset(activeAsset.id, assetAccount.vk);

            onWordHit();
        }
    }

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
    }

    filterTranscript(transcript) {
        return transcript
            .split(" ")
            .map((transcriptItem) => {
                return transcriptItem
                    .replace(/[\s.]/g, "")
                    .toLowerCase()
            })
            .filter((value, index, self) => self.indexOf(value) === index)
    }

    render() {
        const {
            transcript,
            finalTranscript,
            interimTranscript,
            resetTranscript,
            browserSupportsSpeechRecognition,
            recognition,
            magicWords
        } = this.props;

        console.log(finalTranscript, interimTranscript)
        if (!browserSupportsSpeechRecognition) {
            return null
        }

        recognition.lang = 'en-US';

        const transcriptArray = this.filterTranscript(transcript);

        return (
            <div className="dictaphone--container">
                {
                    transcriptArray.map((transcriptItem) => {
                        const inMagicList = magicWords.indexOf(transcriptItem) > -1;

                        return (
                            <span className={classnames("dictaphone--word", {"active": inMagicList})}
                                key={transcriptItem}>
                                { transcriptItem }
                            </span>
                        )
                    })
                }
                <div className="dictaphone--interim">
                    { transcript }
                </div>
            </div>
        )
    }
}

Dictaphone.propTypes = propTypes;

export default SpeechRecognition(Dictaphone)