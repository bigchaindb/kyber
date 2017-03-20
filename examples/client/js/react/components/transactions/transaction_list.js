import React from 'react';

import { safeInvoke } from 'js-utility-belt/es6';

import {
    getAssetIdFromTransaction
} from '../../../utils/bigchaindb/transactions';

const TransactionList = React.createClass({
    propTypes: {
        children: React.PropTypes.node,
        transactionList: React.PropTypes.array,
        transactionMeta: React.PropTypes.object,
        transactionStatuses: React.PropTypes.object,
        handleAssetClick: React.PropTypes.func
    },


    render() {
        const {
            children,
            handleAssetClick,
            transactionList,
            transactionMeta,
            transactionStatuses,
        } = this.props;

        if (!transactionList || transactionList.length == 0) {
            if (transactionMeta && transactionMeta.isFetchingList) {
                return (
                    <div className="transaction-list-null">
                        Fetching transactions...
                    </div>
                )
            }
            return (
                <div className="transaction-list-null">
                    No transactions found...
                </div>
            );
        }

        return (
            <div className="transaction-list">
                {
                    transactionList
                        .sort((a, b) => {
                            if (getAssetIdFromTransaction(a) < getAssetIdFromTransaction(b)) return -1;
                            if (getAssetIdFromTransaction(a) > getAssetIdFromTransaction(b)) return 1;
                            return 0;
                        })
                        .map(transaction =>
                            <TransactionWrapper
                                key={transaction.id}
                                transaction={transaction}
                                transactionStatuses={transactionStatuses}
                                handleAssetClick={handleAssetClick}>
                                {children}
                            </TransactionWrapper>
                        )
                }
            </div>
        );
    }
});

const TransactionWrapper = React.createClass({
    propTypes: {
        children: React.PropTypes.node,
        handleAssetClick: React.PropTypes.func,
        transaction: React.PropTypes.object,
        transactionStatuses: React.PropTypes.object
    },

    render() {
        const {
            children,
            handleAssetClick,
            transaction,
            transactionStatuses
        } = this.props;

        return (
            <div>
                {
                    React.Children.map(children, (child) =>
                        React.cloneElement(child, {
                            transaction,
                            transactionStatuses,
                            handleAssetClick
                        })
                    )
                }
            </div>
        );
    }
});

export default TransactionList;
