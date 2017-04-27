import React from 'react';

import AccountList from '../../../js/react/components/account_list';
import AccountDetail from '../../../js/react/components/account_detail';

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

        const frequencies = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]

        const unspentsForAccount = (
            unspentOutputs
            && activeAccount
            && unspentOutputs[activeAccount.vk]
        ) ? unspentOutputs[activeAccount.vk] : [];

        const transactionsForAccount =
            unspentsForAccount
                .map((transactionId) => {
                    return transactionMap[transactionId];
                })
                .filter(transaction => transaction.operation == 'CREATE' && transaction.asset.data.hasOwnProperty('frequency'));
        
        return (
            <div>
                <nav className="menu">
                    <a className="menu__link" href="../">Back to examples</a>
                    <h1 className="menu__title">BigchainDB Audio Lock</h1>
                </nav>
                <section className="app__content">
                    <AssetsList />
                    <IconLockLocked />
                    <StatusLockedEmail />
                    <StatusLocked />
                    <AudioVisual />
                    
                    <IconLockUnlocked />
                    <StatusUnlocked />
                </section>
            </div>
        );
    }
});

export default BigchainDBConnection(AudioLock);


//
// Le components
//
const AssetsList = () => {
    return (
        <div className="assets-list">
            <p>Please select an asset to unlock</p>
            <div className="assets">
                <a className="asset" href=""><IconShirt /> <span className="asset__title">Asset 1</span></a>
                <a className="asset" href=""><IconDiamond /> <span className="asset__title">Asset 2</span></a>
                <a className="asset" href=""><IconSong /> <span className="asset__title">Asset 3</span></a>
                <a className="asset" href=""><IconDocument /> <span className="asset__title">Asset 4</span></a>
                <a className="asset" href=""><IconPicasso /> <span className="asset__title">Asset 5</span></a>
                <a className="asset" href=""><IconTruck /> <span className="asset__title">Asset 6</span></a>
                <a className="asset" href=""><IconBitcoin /> <span className="asset__title">Asset 7</span></a>
                <a className="asset" href=""><IconHouse /> <span className="asset__title">Asset 8</span></a>
                <a className="asset" href=""><IconPackage /> <span className="asset__title">Asset 9</span></a>
            </div>
        </div>
    )
};

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
