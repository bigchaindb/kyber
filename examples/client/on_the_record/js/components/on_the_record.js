import React from 'react';

import { Navbar, Glyphicon } from 'react-bootstrap/lib';

import { safeInvoke } from 'js-utility-belt/es6';

import AccountList from '../../../js/react/components/account_list';
import AccountDetail from '../../../js/react/components/account_detail';

import BigchainDBConnection from '../../../js/react/components/bigchaindb_connection';

import TransactionActions from '../../../js/react/actions/transaction_actions';
import TransactionList from '../../../js/react/components/transactions/transaction_list';
import TransactionDetail from '../../../js/react/components/transactions/transaction_detail';

import InputTransaction from './input_transaction';
import TransactionPanel from './transaction_panel';

const OnTheRecord = React.createClass({
    propTypes: {
        // Injected through BigchainDBConnection
        activeAccount: React.PropTypes.object,
        handleAccountChange: React.PropTypes.func,
        wallets: React.PropTypes.object
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
            transactionList,
            wallets
        } = this.props;

        const { showHistory } = this.state;

        const walletForAccount = (wallets && activeAccount && wallets[activeAccount.vk]) ?
            wallets[activeAccount.vk] : null;

        const unspentsForAccount = (walletForAccount && Array.isArray(walletForAccount.unspents)) ?
            walletForAccount.unspents : null;

        return (
            <div>
                <Navbar fixedTop inverse>
                    <h1 style={{ textAlign: 'center'}}>BigchainDB Transaction Explorer</h1>
                </Navbar>
                <div id="wrapper">
                    <div id="sidebar-wrapper">
                        <div className="sidebar-nav">
                            <AccountList
                                activeAccount={activeAccount}
                                appName="ontherecord"
                                handleAccountClick={this.handleAccountChange}>
                                <AccountDetail />
                            </AccountList>
                        </div>
                    </div>
                    <div id="page-content-wrapper">
                        <InputTransaction
                            activeAccount={activeAccount}
                            className="input-asset-fixed"
                            placeHolder="CREATE a new asset by typing"/>
                        <div className="page-content">
                            <TransactionList
                                transactionList={unspentsForAccount}
                                handleAssetClick={this.handleAssetClick}>
                                <TransactionPanel
                                    activeAccount={activeAccount} />
                            </TransactionList>
                        </div>
                    </div>
                    {
                        showHistory ?
                            <div id="transaction-history-wrapper">
                                <div className="transaction-history">
                                    <div
                                        onClick={this.handleHistoryClose}
                                        className="transaction-history-header">
                                        [x] Close History
                                    </div>
                                    <TransactionList
                                        transactionList={transactionList}>
                                        <TransactionDetail />
                                    </TransactionList>
                                </div>
                            </div> : null
                    }
                </div>
            </div>
        );
    }
});


export default BigchainDBConnection(OnTheRecord);
