import React from 'react';

import classnames from 'classnames';
import { Col, Row } from 'react-bootstrap/lib';

import moment from 'moment';

import * as driver from 'js-bigchaindb-quickstart';

import { API_PATH } from '../../../js/constants/application_constants';

import TransactionActions from '../../../js/react/actions/transaction_actions';


const InputTransaction = React.createClass({

    propTypes: {
        activeAccount: React.PropTypes.object,
        accountList: React.PropTypes.array,
        className: React.PropTypes.string,
        frequencies: React.PropTypes.array,
        inputTransaction: React.PropTypes.object,
        placeHolder: React.PropTypes.string
    },

    getDefaultProps() {
        return {
            placeHolder: "Type what you want to share on the blockchain"
        }
    },

    getInitialState() {
        return { selectedFrequency: null };
    },

    handleInputSubmit(value) {
        const {
            activeAccount,
            inputTransaction
        } = this.props;

        const toAccount = activeAccount;
        let transaction;

        if (!inputTransaction) {
            transaction = this.createTransaction(toAccount, value);
        }
        else {
            transaction = this.transferTransaction(toAccount, inputTransaction, value);
        }
        const signedTransaction = driver.Transaction.signTransaction(transaction, activeAccount.sk);

        TransactionActions.postTransaction(signedTransaction);

        setTimeout(() => {
            driver.Connection.pollStatusAndFetchTransaction(signedTransaction.id, API_PATH)
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

        this.setState({ selectedFrequency: null });
    },

    createTransaction(activeAccount, value) {
        const asset = {
            'frequency': value,
            'timestamp': moment().format('x')
        };

        return driver.Transaction.makeCreateTransaction(
            asset,
            null,
            [driver.Transaction.makeOutput(driver.Transaction.makeEd25519Condition(activeAccount.vk))],
            activeAccount.vk
        );
    },

    handleFrequencyClick(frequency) {
        if (frequency === this.state.selectedFrequency) {
            this.setState({selectedFrequency: null});
            this.handleInputSubmit(frequency);
        } else {
            this.setState({selectedFrequency: frequency});
        }
    },

    render() {
        const {
            className,
            activeAccount,
            frequencies,
            placeHolder
        } = this.props;

        const { selectedFrequency } = this.state;

        if (!activeAccount) {
            return (
                <div className="content-text">
                    Select account from the list...
                </div>
            );
        }

        return (
            <div>
                <Row className="frequency-row transaction-input">
                    {
                        frequencies.map((frequency) => {
                            const selected = selectedFrequency == frequency;
                            return (
                                <Col
                                    className={classnames("frequency-col", {'selected': selected})}
                                    key={'frequency-input-' + frequency}
                                    onClick={() => this.handleFrequencyClick(frequency)}
                                    xs={Math.floor(frequencies.length/12)}>
                                    <div
                                        className={classnames("frequency-bar", {'selected': selected})}>
                                        {selected ? "OK?" : null}
                                    </div>
                                </Col>
                            );
                        })
                    }
                </Row>
            </div>
        );
    }
});

export default InputTransaction;
