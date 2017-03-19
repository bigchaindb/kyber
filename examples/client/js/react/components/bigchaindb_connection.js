import React from 'react';

import { safeInvoke, safeMerge } from 'js-utility-belt/es6';

import AccountStore from '../stores/account_store';
import TransactionStore from '../stores/transaction_store';


export default function BigchainDBConnection(Component) {
    return React.createClass({
        displayName: `BigchainDBConnection(${Component.displayName || Component})`,

        getInitialState() {
            const accountStore = AccountStore.getState();
            const transactionStore = TransactionStore.getState();

            return safeMerge(
                {
                    activeAccount: null
                },
                accountStore,
                transactionStore
            );
        },

        componentDidMount() {
            AccountStore.listen(this.onAccountStoreChange);
            TransactionStore.listen(this.onChange);
        },

        componentWillUnmount() {
            AccountStore.unlisten(this.onAccountStoreChange);
            TransactionStore.unlisten(this.onChange)
        },

        onChange(state) {
            this.setState(state);
        },

        onAccountStoreChange(state) {
            const { oldAccountList } = this.state;
            state.accountList.forEach((account) => {
                if (account.ledger &&
                    (!oldAccountList ||
                     (oldAccountList && oldAccountList.indexOf(account) === -1))) {
                    account.ledger.on('incoming', this.handleLedgerChanges);
                }
            });

            this.setState(state);
        },

        handleAccountChange(activeAccount) {
            this.setState({
                activeAccount
            });
        },

        handleLedgerChanges(changes) {
            console.log('incoming: ', changes);

            if (changes && changes.client && this.refs.component) {
                const {
                    accountList
                } = this.state;

                const account = accountList.filter((account) => account.vk === changes.client)[0];
                // safeInvoke(this.refs.component.fetchUnspents, account);
            }
        },

        resetActiveAccount() {
            this.handleAccountChange(null);
        },

        render() {
            return (
                <Component
                    ref="component"
                    {...this.state}
                    handleAccountChange={this.handleAccountChange}
                    resetActiveAccount={this.resetActiveAccount} />
            );
        }
    });
}
