import React from 'react';

import { Navbar } from 'react-bootstrap/lib';

import AccountList from '../../../js/react/components/account_list';
import AccountDetail from '../../../js/react/components/account_detail';

import BigchainDBConnection from '../../../js/react/components/bigchaindb_connection';

import TransactionActions from '../../../js/react/actions/transaction_actions';
import TransactionList from '../../../js/react/components/transactions/transaction_list';

import TransactionPanel from './transaction_panel';
import InputTransaction from './input_transaction';


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
                <Navbar fixedTop inverse>
                    <h1 style={{ textAlign: 'center'}}>BigchainDB Audio Lock</h1>
                </Navbar>
                <div id="wrapper">
                    <div id="sidebar-wrapper">
                        <div className="sidebar-nav">
                            <AccountList
                                activeAccount={activeAccount}
                                appName="txexplorer"
                                handleAccountClick={this.handleAccountChange}>
                                <AccountDetail />
                            </AccountList>
                        </div>
                    </div>
                    <div id="page-content-wrapper">
                        <InputTransaction
                            activeAccount={activeAccount}
                            className="input-asset-fixed"
                            frequencies={frequencies}
                            placeHolder="CREATE a new asset by typing"/>
                        <div className="page-content">
                            <TransactionList
                                transactionList={transactionsForAccount}
                                transactionMeta={transactionMeta}
                                transactionStatuses={transactionStatuses}
                                handleAssetClick={this.handleAssetClick}>
                                <TransactionPanel
                                    activeAccount={activeAccount}
                                    accountList={accountList}
                                    frequencies={frequencies}/>
                            </TransactionList>
                        </div>

                    </div>
                </div>
            </div>
        );
    }
});


export default BigchainDBConnection(AudioLock);
