import React from 'react';

import classnames from 'classnames';

import {
    makeTransferTransaction,
    makeOutput,
    makeEd25519Condition,
    signTransaction,
    pollStatusAndFetchTransaction
} from 'js-bigchaindb-quickstart';

import { API_PATH } from '../../../js/constants/application_constants';

import TransactionActions from '../../../js/react/actions/transaction_actions';
import TransactionDetail from '../../../js/react/components/transactions/transaction_detail';

import AudioVisual from './audio_visual';


const TransactionPanel = React.createClass({
    propTypes: {
        activeAccount: React.PropTypes.object,
        accountList: React.PropTypes.array,
        frequencies: React.PropTypes.array,
        transaction: React.PropTypes.object,
        transactionStatuses: React.PropTypes.object,
        className: React.PropTypes.string,
        handleAssetClick: React.PropTypes.func
    },

    getInitialState() {
        return ({
            isFrequencyHit: false
        })
    },

    getTargetFrequency() {
        const { transaction } = this.props;
        return parseInt(transaction.asset.data.frequency, 10);
    },

    handleFrequencyHit() {
        this.setState({ isFrequencyHit: true });
        this.transferTransaction(this.getTargetFrequency());
    },

    transferTransaction(value) {
        const {
            activeAccount,
            transaction
        } = this.props;

        const toAccount = activeAccount;

        const metadata = {
            'message': value
        };

        const transactionTransfer = makeTransferTransaction(
            transaction,
            metadata,
            [makeOutput(makeEd25519Condition(toAccount.vk))],
            0
        );

        const signedTransaction = signTransaction(transactionTransfer, activeAccount.sk);

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
    },

    render() {
        const {
            frequencies,
            transaction,
            transactionStatuses,
            className,
            handleAssetClick
        } = this.props;

        const { isFrequencyHit } = this.state;

        return (
            <div className={classnames("transaction-panel", {'hit': isFrequencyHit})}>
                <TransactionDetail
                    transaction={transaction}
                    transactionStatuses={transactionStatuses}
                    className={className}
                    handleAssetClick={handleAssetClick} />
                <AudioVisual
                    targetFrequency={this.getTargetFrequency()}
                    frequencies={frequencies}
                    handleFrequencyHit={this.handleFrequencyHit}/>
            </div>
        )
    }
});

export default TransactionPanel;
