import React from 'react';
import ReactModal from 'react-modal';
import moment from 'moment';
import classnames from 'classnames';

import * as driver from 'js-bigchaindb-quickstart';

import SyntaxHighlighter from 'react-syntax-highlighter';
import { zenburn } from 'react-syntax-highlighter/dist/styles'

import TransactionActions from '../../../js/react/actions/transaction_actions';

import { fetchAsset } from './utils';

import {
    IconShirt,
    IconPicasso,
    IconAdd,
    IconLoader
} from '../../../js/react/components/icons';


const createAssetCode =
`import * as driver from 'js-bigchaindb-driver';

const fromAccount = new driver.Ed25519Keypair(),
    toAccount = new driver.Ed25519Keypair();

let conditionSignature = driver.Transaction.makeEd25519Condition(
    toAccount.publicKey, 
    false
);

const secretThreshold = 2; 
let conditionSecrets = driver.Transaction.makeThresholdCondition(
    secretThreshold, 
    undefined, 
    false
);

["bigchaindb", "secret", "backupSecret"].forEach((secretWord) => {
    let conditionHashURI = driver.Transaction.makeSha256Condition(
        secretWord, 
        false
    ).getConditionUri();
    conditionSecrets.addSubconditionUri(conditionHashURI);
});

const outputThreshold = 1; 
const outputCondition = driver.Transaction.makeThresholdCondition(
    outputThreshold, 
    [conditionSignature, conditionThreshold]
);

let output = driver.Transaction.makeOutput(outputCondition);
output.public_keys = [toAccount.publicKey];

const transaction = driver.Transaction.makeCreateTransaction(
    {assetData: "I am a new asset"},
    {metaData: "...and this is my create transaction"},
    [output],
    fromAccount.publicKey
);

const signedTransaction = driver.Transaction.signTransaction(
    transaction, 
    fromAccount.privateKey
);

driver.Connection.postTransaction(signedTransaction, API_PATH);

console.log(signedTransaction);`;


const AssetList = React.createClass({
    propTypes: {
        assetAccount: React.PropTypes.object,
        assetList: React.PropTypes.array,
        frequencyList: React.PropTypes.array,
        magicWords: React.PropTypes.array,
        magicWordsThreshold: React.PropTypes.number,
        onAssetClick: React.PropTypes.func,
        transactionMeta: React.PropTypes.object
    },

    getInitialState() {
        return {
            newAssetClicked: null,
            showModal: false
        }
    },

    componentWillReceiveProps(nextProps) {
        if (!!nextProps.assetList
            && this.props.assetList
            && nextProps.assetList.length !== this.props.assetList.length) {
            this.setState({
                newAssetClicked: null
            })
        }
    },

    handleNewAssetClick(value) {
        const {
            assetAccount,
        } = this.props;

        this.setState({
            newAssetClicked: value
        });

        const transaction = this.createTransaction(assetAccount, value);
        const signedTransaction = driver.Transaction.signTransaction(transaction, assetAccount.sk);

        TransactionActions.postTransaction(signedTransaction);
        fetchAsset(signedTransaction.id, assetAccount.vk);
    },

    onAssetClick(asset) {
        const {
            assetAccount,
            onAssetClick
        } = this.props;

        onAssetClick(asset);
        fetchAsset(asset.id, assetAccount.vk);
    },

    createTransaction(account, value) {
        const {
            frequencyList,
            magicWords,
            magicWordsThreshold
        } = this.props;

        const asset = {
            'item': value,
            'frequency': frequencyList[Math.floor(Math.random() * frequencyList.length)],
            'timestamp': moment().format('X')
        };

        let subconditionAccount = driver.Transaction.makeEd25519Condition(account.vk, false);

        let subconditionWords = driver.Transaction.makeThresholdCondition(magicWordsThreshold, undefined, false);
        magicWords
            .forEach((magicWord) => {
                let subconditionWord = driver.Transaction.makeSha256Condition(magicWord, false);
                subconditionWords.addSubconditionUri(subconditionWord.getConditionUri());
            });

        let condition = driver.Transaction.makeThresholdCondition(1, [subconditionAccount, subconditionWords]);

        let output = driver.Transaction.makeOutput(condition);
        output.public_keys = [account.vk];


        return driver.Transaction.makeCreateTransaction(
            asset,
            null,
            [output],
            account.vk
        );
    },

    toggleModal() {
        this.setState({
            showModal: !this.state.showModal
        })
    },

    render() {
        const {
            assetList,
            transactionMeta
        } = this.props;

        const {
            newAssetClicked,
            showModal
        } = this.state;

        if (transactionMeta && transactionMeta.isFetchingList) {
            return (
                <IconLoader />
            )
        }

        return (
            <div className="assets-list">
                <button onClick={this.toggleModal} className="button button--secondary">Show code</button>
                <ReactModal
                    isOpen={showModal}
                    className="modal__content"
                    overlayClassName="modal__overlay"
                    contentLabel="Minimal Modal Example"
                    onRequestClose={this.toggleModal}>
                    <SyntaxHighlighter
                        language='javascript'
                        style={ zenburn }
                        showLineNumbers={true}
                        wrapLines={true}
                        lineStyle={lineNumber => {
                            let style = { display: 'block' };
                            if ([35, 36, 37, 38, 39, 40, 42, 43, 44, 45, 47].includes(lineNumber)) {
                                //@kremalicious not sure if we can use external css for this (ie set a class)
                                style.backgroundColor = 'rgba(57, 186, 145, .2)';
                            }
                          return style;
                        }}>
                        { createAssetCode }
                    </SyntaxHighlighter>
                </ReactModal>
                <div className="status">
                    <h2 className="status__title">Select asset</h2>
                    <p className="status__text">Affirmative, Dave. I read you. Now, please select an asset to unlock or create a new asset first.</p>
                </div>
                <div className="assets">
                    {
                        assetList.map((asset) => {
                            if (asset.asset.hasOwnProperty('data')) {
                                const assetDetails = asset.asset.data;

                                if ('item' in assetDetails
                                    && 'frequency' in assetDetails) {
                                    const
                                        item = assetDetails.item,
                                        frequency = assetDetails.frequency;

                                    return (
                                        <a className="asset" href="#"
                                           onClick={() => this.onAssetClick(asset)}
                                           key={asset.id}>
                                            { (item === 'shirt') && <IconShirt /> }
                                            { (item === 'sticker') && <IconPicasso /> }
                                            <span className="asset__title">
                                                {
                                                    asset.id
                                                }
                                            </span>
                                        </a>
                                    )
                                }
                            }
                        })
                    }
                    <a className={classnames("asset asset--create", {"asset--create--loading": newAssetClicked && newAssetClicked === 'shirt'})} href="#"
                       onClick={() => this.handleNewAssetClick('shirt')}
                       key="asset-create-shirt">
                        { newAssetClicked && newAssetClicked === 'shirt' ?
                             <IconLoader/> : <IconAdd />
                        }
                        <span className="asset__title">Create new asset</span>
                    </a>
                    <a className={classnames("asset asset--create", {"asset--create--loading": newAssetClicked && newAssetClicked === 'sticker'})} href="#"
                       onClick={() => this.handleNewAssetClick('sticker')}
                       key="asset-create-sticker">
                        { newAssetClicked && newAssetClicked === 'sticker' ?
                            <IconLoader/>: <IconAdd />
                        }
                        <span className="asset__title">Create new asset</span>
                    </a>
                </div>
            </div>
        )
    }
});

export default AssetList;