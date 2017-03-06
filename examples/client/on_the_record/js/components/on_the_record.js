import React from 'react';

import { Navbar } from 'react-bootstrap/lib';

import Scroll from 'react-scroll';

import { safeInvoke } from 'js-utility-belt/es6';

import AccountList from '../../../js/react/components/account_list';
import AccountDetail from '../../../js/react/components/account_detail';

import Assets from './assets';
import Search from '../../../js/react/components/search';

import TransactionActions from '../../../js/react/actions/transaction_actions';
import AssetActions from '../../../js/react/actions/asset_actions';

import BigchainDBConnection from '../../../js/react/components/bigchaindb_connection';
import TransactionDetail from '../../../js/react/components/transactions/transaction_detail';
import TransactionList from '../../../js/react/components/transactions/transaction_list';

import {
    outputListContains
} from '../../../js/utils/bigchaindb/transactions';


const OnTheRecord = React.createClass({
    propTypes: {
        // Injected through BigchainDBConnection
        activeAccount: React.PropTypes.object,
        activeAsset: React.PropTypes.string,
        assetList: React.PropTypes.object,
        assetMeta: React.PropTypes.object,
        handleAccountChange: React.PropTypes.func,
        handleAssetChange: React.PropTypes.func,
        unspentTransactions: React.PropTypes.object
    },

    getInitialState() {
        return {
            search: null
        };
    },

    fetchAssetList({ account, search }) {
        if (account) {
            AssetActions.fetchAssetList({
                account,
                search,
                blockWhenFetching: true
            });
            Scroll.animateScroll.scrollToBottom();
        }
    },

    fetchChat(account){
        if (account) {
            TransactionActions.fetchOutputList({
                public_key: account.vk,
                unspent: false
            })
        }
    },

    fetchWallet({ account, search }) {
        if (account) {
            TransactionActions.fetchOutputList({
                public_key: account.vk,
                unspent: true
            });
            Scroll.animateScroll.scrollToBottom();
        }
    },

    handleAccountChangeAndScroll(account) {
        this.props.handleAccountChange(account);
        this.fetchWallet({ account });
        Scroll.animateScroll.scrollToBottom();
    },

    handleAssetChange(asset) {
        this.props.handleAssetChange(asset);
    },

    handleSearch(query) {
        const { activeAccount } = this.props;

        this.setState({
            search: query
        });

        this.fetchAssetList({
            account: activeAccount,
            search: query
        });
    },

    render() {
        const {
            activeAccount,
            activeAsset,
            assetList,
            assetMeta,
            transactionList,
            unspentTransactions
        } = this.props;

        const assetListForAccount = (
            assetList && activeAccount && Array.isArray(assetList[activeAccount.vk])) ?
            assetList[activeAccount.vk] : null;

        const transactionListForAsset =
            (transactionList && activeAsset && Array.isArray(transactionList[activeAsset])) ?
                transactionList[activeAsset] : null;

        if (transactionListForAsset && transactionListForAsset[0]){
            console.log(transactionListForAsset[0], activeAccount.vk)
            console.log(outputListContains(transactionListForAsset[0].outputs, 'public_keys', activeAccount.vk))
        }

        const unspentTransactionsForAccount = (
            unspentTransactions && activeAccount &&
            Array.isArray(unspentTransactions[activeAccount.vk])) ? unspentTransactions[activeAccount.vk] : null;

        console.log('unspentTransactionsForAccount',unspentTransactionsForAccount)

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
                                initialQuery={assetMeta.search} />
                            <AccountList
                                activeAccount={activeAccount}
                                appName="ontherecord"
                                assetList={Object.keys(transactionList)}
                                handleAccountClick={this.handleAccountChangeAndScroll}>
                                <AccountDetail />
                            </AccountList>
                        </div>
                    </div>
                    <div id="page-content-wrapper">
                        <div className="page-content">
                            <TransactionList
                                transactionList={unspentTransactionsForAccount}>
                                <TransactionDetail />
                            </TransactionList>
                            <Assets
                                activeAccount={activeAccount}
                                assetList={assetListForAccount} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});


export default BigchainDBConnection(OnTheRecord);
