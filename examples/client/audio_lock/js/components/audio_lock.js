import React from 'react';
import moment from 'moment';

import * as driver from 'js-bigchaindb-quickstart';

import { API_PATH } from '../../../js/constants/application_constants';

import AccountActions from '../../../js/react/actions/account_actions';
import BigchainDBConnection from '../../../js/react/components/bigchaindb_connection';

import TransactionActions from '../../../js/react/actions/transaction_actions';
import TransactionList from '../../../js/react/components/transactions/transaction_list';

import TransactionPanel from './transaction_panel';
import InputTransaction from './input_transaction';
import AudioVisual from './audio_visual';

import { IconLockLocked, IconLockUnlocked, IconShirt, IconDiamond, IconPicasso, IconDocument, IconSong, IconTruck, IconBitcoin, IconHouse, IconPackage } from '../../../js/react/components/icons';

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
        console.log('change', account)
        this.props.handleAccountChange(account);
        this.fetchUnspents(account);
    },

    handleAssetClick(assetId) {
        this.fetchTransactionListForAsset(assetId);
        this.setState({showHistory: true});
    },

    handleHistoryClose() {
        this.setState({showHistory: false});
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

        if (accountList && accountList.length == 0) {
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
                    transaction => transaction.operation == 'CREATE'
                    && transaction.asset.data.hasOwnProperty('frequency'));

        return (
            <div>
                <nav className="menu">
                    <a className="menu__link" href="../">Back to examples</a>
                    <h1 className="menu__title">BigchainDB Audio Lock</h1>
                </nav>
                <section className="app__content">
                    <StateSwitcher
                        assetAccount={ assetAccount }
                        assetList={ transactionsForAccount }
                        onAccountChange={ this.handleAccountChange }/>
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
        onAccountChange: React.PropTypes.func
    },

    getDefaultProps() {
        return {
            frequencyList: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
            availableStates: [
                'login',
                'list',
                'email',
                'locked',
                'unlocked'
            ]
        }
    },

    getInitialState() {
        return {
            activeAsset: null,
            currentState: 'login'
        }
    },

    handleLoginClick() {
        const {
            assetAccount,
            onAccountChange
        } = this.props;

        onAccountChange(assetAccount);

        this.setState({
            currentState: 'list'
        })
    },

    handleAssetClick(asset) {
        this.setState({
            activeAsset: asset,
            currentState: 'locked'
        })
    },

    handleFrequencyHit() {
        this.setState({
            currentState: 'unlocked'
        })
    },

    render() {
        const {
            activeAsset,
            currentState
        } = this.state;

        const {
            assetAccount,
            assetList,
            frequencyList
        } = this.props;

        return (
            <div>
                { (currentState === 'login') &&
                    <div style={{ cursor: "pointer" }}
                        onClick={ this.handleLoginClick }>
                        <IconLockLocked />
                    </div>
                }
                { (currentState === 'list') &&
                    <AssetsList
                        assetAccount={assetAccount}
                        assetList={assetList}
                        frequencyList={frequencyList}
                        handleAssetClick={this.handleAssetClick}/>
                }
                { (currentState === 'email') &&
                    <StatusLockedEmail />
                }
                { (currentState === 'locked') &&
                    <div>
                        <IconLockLocked />
                        <div className="audio-container">
                            <AudioVisual
                                frequencies={frequencyList}
                                onFrequencyHit={this.handleFrequencyHit}
                                targetFrequency={3}/>
                            <StatusLocked />
                        </div>
                    </div>
                }
                { (currentState === 'unlocked') &&
                    <div>
                        <IconLockUnlocked />
                        <StatusUnlocked />
                    </div>
                }
            </div>
        )
    }
});

//
// Le components
//
const AssetsList = React.createClass({
    propTypes: {
        assetAccount: React.PropTypes.object,
        assetList: React.PropTypes.array,
        frequencyList: React.PropTypes.array,
        handleAssetClick: React.PropTypes.func
    },


    handleNewAssetClick(value) {
        const {
            assetAccount,
        } = this.props;

        const transaction = this.createTransaction(assetAccount, value);
        const signedTransaction = driver.Transaction.signTransaction(transaction, assetAccount.sk);

        TransactionActions.postTransaction(signedTransaction);

        setTimeout(() => {
            driver.Connection.pollStatusAndFetchTransaction(signedTransaction.id, API_PATH)
                .then(() => {
                    TransactionActions.fetchOutputList({
                        public_key: assetAccount.vk,
                        unspent: true
                    });
                })
        }, 1000);
    },

    createTransaction(account, value) {
        const { frequencyList } = this.props;

        const asset = {
            'item': value,
            'frequency': frequencyList[Math.floor(Math.random()*frequencyList.length)],
            'timestamp': moment().format('X')
        };

        return driver.Transaction.makeCreateTransaction(
            asset,
            null,
            [driver.Transaction.makeOutput(driver.Transaction.makeEd25519Condition(account.vk))],
            account.vk
        );
    },

    render() {
        const {
            assetList,
            handleAssetClick
        } = this.props;

        return (
            <div className="assets-list">
                <p>Please select an asset to unlock</p>
                <div className="assets">
                    {
                        assetList.map((asset) => {
                            if (asset.asset.hasOwnProperty('data')){
                                const assetDetails = asset.asset.data;

                                if ('item' in assetDetails
                                    && 'frequency' in assetDetails) {
                                    const
                                        item = assetDetails.item,
                                        frequency = assetDetails.frequency;

                                    return (
                                        <a className="asset" href="#"
                                           onClick={() => handleAssetClick(asset)}
                                           key={asset.id}>
                                            { (item == 'shirt') && <IconShirt /> }
                                            { (item == 'sticker') && <IconPicasso /> }
                                            <span className="asset__title">
                                                {
                                                    // @kremalicious: overflow ellipsis would be better here
                                                    asset.id.slice(0, 8)
                                                }...
                                            </span>
                                        </a>
                                    )
                                }
                            }
                        })
                    }

                    <a className="asset asset__create" href="#"
                        onClick={() => this.handleNewAssetClick('shirt')}
                        key="asset-create-shirt">
                        <IconShirt />
                        <span className="asset__title">+ Create New</span>
                    </a>
                    <a className="asset asset__create" href="#"
                        onClick={() => this.handleNewAssetClick('sticker')}
                        key="asset-create-sticker">
                        <IconPicasso />
                        <span className="asset__title">+ Create New</span>
                    </a>
                </div>
            </div>
        )
    }
});


const StatusLockedEmail = () => {
    return (
        <div className="status status--locked">
            <h2 className="status__title">Locked</h2>
            <p className="status__text">Enter your email to receive instructions for unlocking this asset.</p>
            
            <form>
                <input className="form__control" type="email" name="email" placeholder="Your email" />
            </form>
        </div>
    )
};

const StatusLocked = () => {
    return (
        <div className="status status--locked">
            <h2 className="status__title">Locked</h2>
            <p className="status__text">Speak to unlock, my dear.</p>
        </div>
    )
};

const StatusUnlocked = () => {
    return (
        <div className="status status--unlocked is-hidden">
            <h2 className="status__title">Unlocked</h2>
            <p className="status__text">Well spoken, eloquent human!</p>
        </div>
    )
};
