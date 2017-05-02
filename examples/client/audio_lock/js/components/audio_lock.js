import React from 'react';
import moment from 'moment';
import base58 from 'bs58';
import classnames from 'classnames';
import Tone from 'tone';

import * as driver from 'js-bigchaindb-quickstart';

import {API_PATH} from '../../../js/constants/application_constants';

import AccountActions from '../../../js/react/actions/account_actions';
import BigchainDBConnection from '../../../js/react/components/bigchaindb_connection';

import TransactionActions from '../../../js/react/actions/transaction_actions';
import AudioVisual from './audio_visual';
import Dictaphone from './dictaphone';
import { fetchAsset } from './utils';

import {
    IconLockLocked,
    IconLockUnlocked,
    IconShirt,
    IconDiamond,
    IconPicasso,
    IconDocument,
    IconSong,
    IconTruck,
    IconBitcoin,
    IconHouse,
    IconPackage,
    IconAdd,
    IconArrowLeft,
    Logo,
    IconLoader
} from '../../../js/react/components/icons';

const AudioLock = React.createClass({
    propTypes: {
        // Injected through BigchainDBConnection
        activeAccount: React.PropTypes.object,
        handleAccountChange: React.PropTypes.func,
        transactionMap: React.PropTypes.object,
        unspentOutputs: React.PropTypes.object
    },

    getInitialState() {
        return {
            showHistory: false
        };
    },

    componentDidMount() {
        AccountActions.flushAccountList();
        AccountActions.fetchAccountList();
    },

    fetchTransactionListForAsset(assetId) {
        if (assetId) {
            TransactionActions.fetchTransactionList({
                assetId
            })
        }
    },

    fetchUnspents(account) {
        if (account) {
            TransactionActions.fetchOutputList({
                public_key: account.vk,
                unspent: true
            });
        }
    },

    handleAccountChange(account) {
        this.props.handleAccountChange(account);
        this.fetchUnspents(account);
    },

    render() {
        const {
            activeAccount,
            accountList,
            transactionList,
            transactionMap,
            transactionMeta,
            transactionStatuses,
            unspentOutputs
        } = this.props;

        if (accountList && accountList.length === 0) {
            return null;
        }

        const assetAccount = activeAccount || accountList[0];

        const unspentsForAccount = (
            unspentOutputs
            && activeAccount
            && unspentOutputs[assetAccount.vk]
        ) ? unspentOutputs[assetAccount.vk] : [];

        const transactionsForAccount =
            unspentsForAccount
                .map((transactionId) => {
                    return transactionMap[transactionId];
                })
                .filter(
                    transaction => !!transaction && transaction.operation === 'CREATE'
                    && transaction.asset.data.hasOwnProperty('frequency'));

        return (
            <div>
                <nav className="menu">
                    <a className="menu__link" href="../"><IconArrowLeft /> Back to examples</a>
                    <Logo />
                    <h1 className="menu__title">BigchainDB Audio Lock</h1>
                </nav>
                <section className="app__content">
                    <StateSwitcher
                        assetAccount={ assetAccount }
                        assetList={ transactionsForAccount }
                        onAccountChange={ this.handleAccountChange }
                        transactionList={ transactionList }
                        transactionMeta={ transactionMeta }/>
                </section>
            </div>
        );
    }
});

export default BigchainDBConnection(AudioLock);

const StateSwitcher = React.createClass({
    propTypes: {
        assetAccount: React.PropTypes.object,
        assetList: React.PropTypes.array,
        availableStates: React.PropTypes.array,
        frequencyList: React.PropTypes.array,
        onAccountChange: React.PropTypes.func,
        transactionList: React.PropTypes.array,
        transactionMeta: React.PropTypes.object
    },

    getDefaultProps() {
        return {
            frequencyList: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
            availableStates: [
                'start',
                'login',
                'list',
                'locked',
                'unlocked'
            ]
        }
    },

    getInitialState() {
        return {
            activeAsset: null,
            activeAccount: null,
            currentState: 'start'
        }
    },

    handleStart() {
        this.setState({
            currentState: 'login'
        })
    },

    handleLogin(user) {
        const {
            assetAccount,
            onAccountChange
        } = this.props;

        onAccountChange(assetAccount);

        this.setState({
            activeAccount: user,
            currentState: 'list'
        })
    },

    handleAssetClick(asset) {
        this.setState({
            activeAsset: asset,
            currentState: 'locked'
        })
    },

    handleUnlock() {
        this.setState({
            currentState: 'unlocked'
        })
    },

    handleReset() {
        this.setState({
            currentState: 'start'
        });
        TransactionActions.flushTransactionList();
    },

    render() {
        const {
            activeAsset,
            activeAccount,
            currentState
        } = this.state;

        const {
            assetAccount,
            assetList,
            frequencyList,
            transactionList,
            transactionMeta
        } = this.props;

        return (
            <div>
                { (currentState === 'start') &&
                    <StatusIntro
                        onClick={this.handleStart}/>
                }
                { (currentState === 'login') &&
                    <StatusLockedEmail
                        onSubmit={this.handleLogin}/>
                }
                { (currentState === 'list') &&
                    <AssetsList
                        assetAccount={assetAccount}
                        assetList={assetList}
                        frequencyList={frequencyList}
                        onAssetClick={this.handleAssetClick}
                        transactionMeta={transactionMeta}/>
                }
                { (currentState === 'locked') &&
                    <div>
                        <AssetAudioLock
                            activeAsset={activeAsset}
                            activeAccount={activeAccount}
                            assetAccount={assetAccount}
                            targetFrequency={activeAsset.asset.data.frequency}
                            frequencyList={frequencyList}
                            onFrequencyHit={this.handleUnlock}/>
                        <Dictaphone
                            activeAsset={activeAsset}
                            activeAccount={activeAccount}
                            assetAccount={assetAccount}
                            magicWords={magicWords}
                            magicWordsThreshold={magicWordsThreshold}
                            onWordHit={this.handleUnlock}/>
                    </div>
                }
                { (currentState === 'unlocked') &&
                    <div className="is-unlocked">
                        <IconLockUnlocked />
                        <StatusUnlocked />
                    </div>
                }
                { (currentState === 'locked'
                    || currentState === 'unlocked') &&
                    <TimeLine
                        transactionList={transactionList}
                        onClick={this.handleReset}/>
                }
            </div>
        )
    }
});

//
// Le components
//

const magicWords = [
    'daisy', 'hal', 'space', 'dave', 'data'
];

const magicWordsThreshold = 2;

const AssetsList = React.createClass({
    propTypes: {
        assetAccount: React.PropTypes.object,
        assetList: React.PropTypes.array,
        frequencyList: React.PropTypes.array,
        onAssetClick: React.PropTypes.func,
        transactionMeta: React.PropTypes.object
    },


    handleNewAssetClick(value) {
        const {
            assetAccount,
        } = this.props;

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
        const {frequencyList} = this.props;

        const asset = {
            'item': value,
            'frequency': frequencyList[Math.floor(Math.random() * frequencyList.length)],
            'timestamp': moment().format('X')
        };

        let condition = driver.Transaction.makeThresholdCondition(null, true);
        condition.threshold = 1;
        let subconditionAccount = driver.Transaction.makeEd25519Condition(account.vk, true);
        condition.addSubfulfillment(subconditionAccount);
        let subconditionWords = driver.Transaction.makeThresholdCondition(null, true);
        subconditionWords.threshold = magicWordsThreshold;
        magicWords
            .forEach((magicWord) => {
                let subconditionWord = driver.Transaction.makeSha256Condition(magicWord, true);
                subconditionWords.addSubconditionUri(subconditionWord.getConditionUri());
            });
        condition.addSubfulfillment(subconditionWords);

        let output = driver.Transaction.makeOutput(
            driver.Transaction.makeThresholdCondition(condition)
        );
        output.public_keys = [account.vk];


        return driver.Transaction.makeCreateTransaction(
            asset,
            null,
            [output],
            account.vk
        );
    },

    render() {
        const {
            assetList,
            transactionMeta
        } = this.props;

        if (transactionMeta && transactionMeta.isFetchingList) {
            return (
                <IconLoader />
            )
        }

        return (
            <div className="assets-list">
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

                    <a className="asset asset--create" href="#"
                       onClick={() => this.handleNewAssetClick('shirt')}
                       key="asset-create-shirt">
                        <IconAdd />
                        <span className="asset__title">Create new asset</span>
                    </a>
                    <a className="asset asset--create" href="#"
                       onClick={() => this.handleNewAssetClick('sticker')}
                       key="asset-create-sticker">
                        <IconAdd />
                        <span className="asset__title">Create new asset</span>
                    </a>
                </div>
            </div>
        )
    }
});


const StatusIntro = React.createClass({
    propTypes: {
        onClick: React.PropTypes.func
    },

    render() {
        const { onClick } = this.props;

        return (
            <div onClick={onClick} className="status status--intro">
                <h2 className="status__title">Audio Lock</h2>
                <h3 className="status__subtitle">Unlock assets with your voice.</h3>
                <p className="status__text">This app demonstrates how to transfer an asset saved in BigchainDB by
                    singing to your computer. HAL would be proud.</p>

                <button className="button button--primary status__button">Let’s roll</button>
            </div>
        )
    }
});

const AssetAudioLock = React.createClass({
    propTypes: {
        activeAsset: React.PropTypes.object,
        activeAccount: React.PropTypes.object,
        assetAccount: React.PropTypes.object,
        targetFrequency: React.PropTypes.number,
        frequencyList: React.PropTypes.array,
        onFrequencyHit: React.PropTypes.func
    },

    componentDidMount() {
        const { activeAsset } = this.props;
        this.renderTone(parseInt(activeAsset.asset.data.frequency, 10), "+1")
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

        let fulfillment = driver.Transaction.makeThresholdCondition(null, true);
        fulfillment.threshold = 1;

        let fulfillmentAssetAccount = driver.Transaction.makeEd25519Condition(assetAccount.vk, true);
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
            <div className="is-locked">
                <IconLockLocked />
                <StatusLocked />
                <div className="audio-container">
                    <AudioVisual
                        frequencies={frequencyList}
                        onFrequencyClick={this.handleFrequencyClick}
                        onFrequencyHit={this.onFrequencyHit}
                        targetFrequency={targetFrequency}/>

                </div>
            </div>
        );
    }
});


const StatusLockedEmail = React.createClass({
    propTypes: {
        onSubmit: React.PropTypes.func
    },

    getInitialState() {
        return {
            emailValue: null
        }
    },

    handleSubmit(event) {
        event.preventDefault();

        const {emailValue} = this.state;
        const {onSubmit} = this.props;

        const keyPair = new driver.Ed25519Keypair(emailValue);

        const user = {
            "name": emailValue,
            "sk": keyPair.privateKey,
            "vk": keyPair.publicKey
        };

        onSubmit(user);
    },

    handleInputChange(event) {
        this.setState({
            emailValue: event.target.value
        })
    },

    render() {
        return (
            <div className="status">
                <h2 className="status__title">Create user</h2>
                <p className="status__text">First, I need to create a key pair based on your email so you can receive transactions on BigchainDB.</p>

                <form className="form" onSubmit={this.handleSubmit}>
                    <p>Enter your email to get started, Dave.</p>
                    <p className="form__group">
                        <input className="form__control" type="email" name="email" id="email" onChange={this.handleInputChange} required/>
                        <label className="form__label" htmlFor="email">Your email</label>
                    </p>
                    <p className="form__group">
                        <button type="submit" className="button button--primary status__button">Create user</button>
                    </p>
                </form>
            </div>
        )
    }
});

const StatusLocked = () => {
    return (
        <div className="status status--locked">
            <h2 className="status__title">Locked</h2>
            <p className="status__text">Sing to unlock. Have you heard of Daisy?</p>
        </div>
    )
};

const StatusUnlocked = () => {
    return (
        <div className="status status--unlocked is-hidden">
            <h2 className="status__title">Unlocked</h2>
            <p className="status__text">What a lovely voice, Dave. Thank you for a very enjoyable game.</p>
        </div>
    )
};

const TimeLine = React.createClass({
    propTypes: {
        transactionList: React.PropTypes.array,
        onClick: React.PropTypes.func
    },

    render() {
        const {
            transactionList,
            onClick
        } = this.props;

        return (
            <aside className="timeline-section">

                <h2 className="timeline-section__title">Asset ownership</h2>
                <div className="timeline">
                    <div className="timeline__step">
                        <div className={classnames("timeline__indicator", { active: transactionList.length > 0 })}></div>
                        <h3 className="timeline__name">
                            BigchainDB
                        </h3>
                        <p className="timeline__description">
                            { transactionList.length > 0 ?
                                    <a href={API_PATH + 'transactions/' + transactionList[0].id} target="_blank">
                                        {transactionList[0].id}
                                    </a> : null
                            }
                        </p>
                    </div>

                    <div className="timeline__step">
                        <div className={classnames("timeline__indicator", { active: transactionList.length > 1 })}></div>
                        <h3 className="timeline__name">
                            You
                        </h3>
                        <p className="timeline__description">
                            { transactionList.length > 1 ?
                                    <a href={API_PATH + 'transactions/' + transactionList[1].id} target="_blank">
                                        {transactionList[1].id}
                                    </a> : null
                            }
                        </p>
                    </div>

                    <div className="timeline__step" style={{cursor : 'pointer'}}
                        onClick={onClick}>
                        <div className="timeline__indicator"></div>
                        <h3 className="timeline__name">
                            Someone
                        </h3>
                        <p className="timeline__description">
                        </p>
                    </div>

                </div>
            </aside>
        )
    }
});