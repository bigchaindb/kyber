import React from 'react';

import {
    Ed25519Keypair,
    getStatus,
    makeCreateTransaction,
    makeTransferTransaction,
    makeOutput,
    makeEd25519Condition,
    pollStatusAndFetchTransaction,
    postTransaction,
    signTransaction,
} from 'js-bigchaindb-quickstart';

import TransactionActions from '../../../js/react/actions/transaction_actions';


const InputTransaction = React.createClass({

    propTypes: {
        activeAccount: React.PropTypes.object,
    },

    getInitialState() {
        return { value: "" };
    },

    handleInputSubmit(event) {
        event.preventDefault();
        const { activeAccount } = this.props;
        const { value } = this.state;
        const asset = {
            'chat': ''
        };

        const metadata = {
            'message': value
        };

        const transaction = makeCreateTransaction(
            asset,
            metadata,
            [makeOutput(makeEd25519Condition(activeAccount.vk))],
            activeAccount.vk
        );
        const signedTransaction = signTransaction(transaction, activeAccount.sk);
        TransactionActions.postTransaction(signedTransaction);

        this.setState({ value: "" });

    },

    handleInputChange(event) {
        this.setState({ value: event.target.value });
    },

    render() {
        const {
            activeAccount,
        } = this.props;

        const { value } = this.state;

        if (!activeAccount) {
            return (
                <div className="content-text">
                    Select account from the list...
                </div>
            );
        }

        return (
           <form onSubmit={this.handleInputSubmit}>
                <input
                    autoFocus
                    className="input-content"
                    onChange={this.handleInputChange}
                    placeholder="Type what you want to share on the blockchain"
                    value={value} />
            </form>
        );
    }
});

export default InputTransaction;
