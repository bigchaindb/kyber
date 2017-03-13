import React from 'react';

import { Navbar } from 'react-bootstrap/lib';

import { safeInvoke } from 'js-utility-belt/es6';

import AccountList from '../../../js/react/components/account_list';
import AccountDetail from '../../../js/react/components/account_detail';

import InputTransaction from './input_transaction';
import Search from '../../../js/react/components/search';

import TransactionActions from '../../../js/react/actions/transaction_actions';

import BigchainDBConnection from '../../../js/react/components/bigchaindb_connection';
import TransactionDetail from '../../../js/react/components/transactions/transaction_detail';
import TransactionList from '../../../js/react/components/transactions/transaction_list';

const OnTheRecord = React.createClass({
    propTypes: {
        // Injected through BigchainDBConnection
        activeAccount: React.PropTypes.object,
        handleAccountChange: React.PropTypes.func,
        wallets: React.PropTypes.object
    },

    getInitialState() {
        return {
            search: null
        };
    },

    fetchTransactionListForAsset(assetId) {
        if (assetId) {
            console.log('assetId', assetId)
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
        this.fetchTransactionListForAsset(assetId)
    },

    handleSearch(query) {
        const { activeAccount } = this.props;

        this.setState({
            search: query
        });
    },

    render() {
        const {
            activeAccount,
            wallets
        } = this.props;

        const walletForAccount = (wallets && activeAccount && wallets[activeAccount.vk]) ?
            wallets[activeAccount.vk] : null;

        const unspentsForAccount = (walletForAccount && Array.isArray(walletForAccount.unspents)) ?
            walletForAccount.unspents : null;

        return (
            <div>
                <Navbar fixedTop inverse>
                    <h1 style={{ textAlign: 'center', color: 'white' }}>"On the Record"</h1>
                </Navbar>
                <div id="wrapper">
                    <div id="sidebar-wrapper">
                        <div className="sidebar-nav">
                            <Search
                                handleSearch={this.handleSearch}
                                initialQuery="" />
                            <AccountList
                                activeAccount={activeAccount}
                                appName="ontherecord"
                                handleAccountClick={this.handleAccountChange}>
                                <AccountDetail />
                            </AccountList>
                        </div>
                    </div>
                    <div id="page-content-wrapper">
                        <InputTransaction activeAccount={activeAccount} />
                        <div className="page-content">
                            <TransactionList
                                transactionList={unspentsForAccount}
                                handleAssetClick={this.handleAssetClick}>
                                <TransactionDetail />
                            </TransactionList>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});


export default BigchainDBConnection(OnTheRecord);
