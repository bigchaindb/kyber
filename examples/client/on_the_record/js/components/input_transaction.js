import React from 'react';

import classnames from 'classnames';
import { Glyphicon } from 'react-bootstrap/lib';

import {
    makeCreateTransaction,
    makeTransferTransaction,
    makeOutput,
    makeEd25519Condition,
    signTransaction,
    pollStatusAndFetchTransaction
} from 'js-bigchaindb-quickstart';

import { API_PATH } from '../../../js/constants/application_constants';

import TransactionActions from '../../../js/react/actions/transaction_actions';


const InputTransaction = React.createClass({

    propTypes: {
        activeAccount: React.PropTypes.object,
        accountList: React.PropTypes.array,
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

    getToAccountFromValue(value) {
        const {
            activeAccount,
            accountList,
        } = this.props;

        let toAccount = activeAccount;

        if (accountList) {
            const matchHandles = value
                .match(/(?:^|\s)(?:@)([a-zA-Z\d]+)/gm);

            if (matchHandles) {
                const matchHandlesClean = matchHandles
                .map((match) => match
                    .replace(/ /g,'')
                    .replace(/@/g,'')
                    .toLowerCase())
                .filter((v, i, a) => a.indexOf(v) === i);

                const matchedAccounts = accountList.map((account) => {
                    if (matchHandlesClean.indexOf(account.name.toLowerCase()) > -1) {
                        return account;
                    }
                }).filter((v) => typeof v === 'object');
                if (matchedAccounts.length) toAccount = matchedAccounts[0];
            }
        }
        return toAccount;
    },

    handleInputSubmit(event) {
        event.preventDefault();

        const {
            activeAccount,
            inputTransaction
        } = this.props;

        const { value } = this.state;

        let toAccount = activeAccount;
        let transaction;

        if (!inputTransaction) {
            transaction = this.createTransaction(toAccount, value);
        }
        else {
            toAccount = this.getToAccountFromValue(value);
            transaction = this.transferTransaction(toAccount, inputTransaction, value);
        }
        const signedTransaction = signTransaction(transaction, activeAccount.sk);

        TransactionActions.postTransaction(signedTransaction);

        setTimeout(() => {
            pollStatusAndFetchTransaction(signedTransaction.id, API_PATH)
                .then(() => {
                    TransactionActions.fetchOutputList({
                        public_key: activeAccount.vk,
                        unspent: true
                    });
                    if (toAccount !== activeAccount) {
                        TransactionActions.fetchOutputList({
                            public_key: toAccount.vk,
                            unspent: true
                        });
                    }
                })
        }, 1000);

        this.setState({ value: "" });
    },

    createTransaction(activeAccount, value) {
        const asset = {
            'definition': value
        };

        return makeCreateTransaction(
            asset,
            null,
            [makeOutput(makeEd25519Condition(activeAccount.vk))],
            activeAccount.vk
        );
    },


    transferTransaction(toAccount, inputTransaction, value) {
        const metadata = {
            'message': value
        };

        return makeTransferTransaction(
            inputTransaction,
            metadata,
            [makeOutput(makeEd25519Condition(toAccount.vk))],
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
                    <Glyphicon glyph="console" className="glyphicon-input blink"/>
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
