import React from 'react';

import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';

import AccountActions from '../../../js/react/actions/account_actions';
import BigchainDBConnection from '../../../js/react/components/bigchaindb_connection';

import TransactionActions from '../../../js/react/actions/transaction_actions';

import AssetList from './asset_list';
import AudioLockSwitcher from './audio_lock_switcher';
import EmailInput from './email_input';
import TimeLine from './timeline';

import {
    IconLockUnlocked,
    IconArrowLeft,
    Logo,
} from '../../../js/react/components/icons';


const magicWords = [
    'daisy', 'hal', 'space', 'dave', 'data'
];

const magicWordsThreshold = 2;
const frequencyList = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];


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
                        magicWords={ magicWords }
                        magicWordsThreshold={ magicWordsThreshold }
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
        magicWords: React.PropTypes.array,
        magicWordsThreshold: React.PropTypes.number,
        onAccountChange: React.PropTypes.func,
        transactionList: React.PropTypes.array,
        transactionMeta: React.PropTypes.object
    },

    getDefaultProps() {
        return {
            frequencyList: frequencyList,
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
            currentState,
        } = this.state;

        const {
            assetAccount,
            assetList,
            frequencyList,
            magicWords,
            magicWordsThreshold,
            transactionList,
            transactionMeta
        } = this.props;

        return (
            <div>
                { (currentState === 'start') &&
                    <CSSTransitionGroup
                        transitionName="screenchange"
                        transitionEnter={false}
                        transitionLeaveTimeout={200}>
                        <StatusIntro
                            onClick={this.handleStart}/>
                    </CSSTransitionGroup>
                }
                { (currentState === 'login') &&
                    <CSSTransitionGroup
                        transitionName="screenchange"
                        transitionEnterTimeout={400}
                        transitionLeaveTimeout={200}>
                        <EmailInput onSubmit={this.handleLogin}/>
                    </CSSTransitionGroup>
                }
                { (currentState === 'list') &&
                    <AssetList
                        assetAccount={assetAccount}
                        assetList={assetList}
                        frequencyList={frequencyList}
                        magicWords={magicWords}
                        magicWordsThreshold={magicWordsThreshold}
                        onAssetClick={this.handleAssetClick}
                        transactionMeta={transactionMeta}/>
                }
                { (currentState === 'locked') &&
                    <AudioLockSwitcher
                        activeAccount={activeAccount}
                        activeAsset={activeAsset}
                        assetAccount={assetAccount}
                        frequencyList={frequencyList}
                        magicWords={magicWords}
                        magicWordsThreshold={magicWordsThreshold}
                        onUnlock={this.handleUnlock}/>
                }
                { (currentState === 'unlocked') &&
                    <div className="is-unlocked animation-fadein">
                        <div className="animation-slide-in-from-bottom">
                            <IconLockUnlocked />
                            <StatusUnlocked />
                        </div>
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
const StatusIntro = React.createClass({
    propTypes: {
        onClick: React.PropTypes.func
    },

    render() {
        const { onClick } = this.props;

        return (
            <div onClick={onClick} className="status status--intro animation-slide-in-from-bottom">
                <h2 className="status__title">Audio Lock</h2>
                <h3 className="status__subtitle">Unlock assets with your voice.</h3>
                <p className="status__text">This app demonstrates how to transfer an asset saved in BigchainDB by singing to your computer. HAL would be proud.</p>

                <button className="button button--primary status__button">Let’s roll</button>
            </div>
        )
    }
});


const StatusUnlocked = () => {
    return (
        <div className="status status--unlocked is-hidden">
            <h2 className="status__title">Unlocked</h2>
            <p className="status__text">That’s a very nice voice, Dave. Thank you for a very enjoyable game.</p>
        </div>
    )
};