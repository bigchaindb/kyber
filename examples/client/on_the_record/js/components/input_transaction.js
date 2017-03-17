import React from 'react';

import classnames from 'classnames';
import { Glyphicon } from 'react-bootstrap/lib';

import {
    makeCreateTransaction,
    makeTransferTransaction,
    makeOutput,
    makeEd25519Condition,
    signTransaction
} from 'js-bigchaindb-quickstart';

import TransactionActions from '../../../js/react/actions/transaction_actions';


const InputTransaction = React.createClass({

    propTypes: {
        activeAccount: React.PropTypes.object,
        className: React.PropTypes.string,
        inputTransaction: React.PropTypes.object,
        placeHolder: React.PropTypes.string
    },

    getDefaultProps() {
        return {
            placeHolder: "Type what you want to share on the blockchain"
        }
    },

    getInitialState() {
        return { value: "" };
    },

    handleInputSubmit(event) {
        event.preventDefault();
        const {
            activeAccount,
            inputTransaction
        } = this.props;
        const { value } = this.state;

        let transaction;
        if (!inputTransaction) {
            transaction = this.createTransaction(activeAccount, value);
        }
        else {
            transaction = this.transferTransaction(activeAccount, inputTransaction, value);
        }
        const signedTransaction = signTransaction(transaction, activeAccount.sk);
        TransactionActions.postTransaction(signedTransaction);

        this.setState({ value: "" });
    },

    createTransaction(activeAccount, value) {
        const asset = {
            'chat': value
        };

        return makeCreateTransaction(
            asset,
            null,
            [makeOutput(makeEd25519Condition(activeAccount.vk))],
            activeAccount.vk
        );
    },


    transferTransaction(activeAccount, inputTransaction, value) {
        const metadata = {
            'message': value
        };

        return makeTransferTransaction(
            inputTransaction,
            metadata,
            [makeOutput(makeEd25519Condition(activeAccount.vk))],
            0
        );
    },

    handleInputChange(event) {
        this.setState({ value: event.target.value });
    },

    render() {
        const {
            className,
            activeAccount,
            placeHolder
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
            <form
                className={className}
                onSubmit={this.handleInputSubmit}>
                <div className="inner-addon left-addon">
                    <Glyphicon glyph="console" className="glyphicon-input"/>
                    <input
                        className="input-content"
                        onChange={this.handleInputChange}
                        placeholder={placeHolder}
                        value={value} />
                 </div>
            </form>
        );
    }
});

export default InputTransaction;
