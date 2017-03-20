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
            AccountStore.listen(this.onChange);
            TransactionStore.listen(this.onChange);
        },

        componentWillUnmount() {
            AccountStore.unlisten(this.onChange);
            TransactionStore.unlisten(this.onChange)
        },

        onChange(state) {
            this.setState(state);
        },

        handleAccountChange(activeAccount) {
            this.setState({
                activeAccount
            });
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
