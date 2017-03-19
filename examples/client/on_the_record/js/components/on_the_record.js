import React from 'react';

import { Navbar, Glyphicon } from 'react-bootstrap/lib';

import { safeInvoke } from 'js-utility-belt/es6';

import AccountList from '../../../js/react/components/account_list';
import AccountDetail from '../../../js/react/components/account_detail';

import BigchainDBConnection from '../../../js/react/components/bigchaindb_connection';

import { getAssetIdFromTransaction } from '../../../js/utils/bigchaindb/transactions';

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
        console.log('handle', account)
        new Promise((resolve, reject) => this.fetchUnspents(account));
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
            transactionContext,
            transactionList,
            transactionMap,
            unspentOutputs
        } = this.props;

        const { showHistory } = this.state;

        const unspentsForAccount = (
            unspentOutputs
            && activeAccount
            && unspentOutputs[activeAccount.vk]
        ) ? unspentOutputs[activeAccount.vk] : [];

        const transactionsForAccount =
            unspentsForAccount.map((transactionId) => {
                return transactionMap[transactionId];
            });

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
                                transactionList={transactionsForAccount}
                                transactionContext={transactionContext}
                                handleAssetClick={this.handleAssetClick}>
                                <TransactionPanel
                                    activeAccount={activeAccount}
                                    accountList={accountList}/>
                            </TransactionList>
                        </div>
                    </div>
                    {
                        showHistory && transactionList ?
                            <div id="transaction-history-wrapper">
                                <div className="transaction-history">
                                    <div
                                        onClick={this.handleHistoryClose}
                                        className="transaction-history-header">
                                        [x] Close History for Asset {getAssetIdFromTransaction(transactionList[0])}
                                    </div>
                                    <TransactionList
                                        transactionList={transactionList}
                                        transactionContext={transactionContext}>
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
