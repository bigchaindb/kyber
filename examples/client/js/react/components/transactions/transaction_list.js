import React from 'react';

import { safeInvoke } from 'js-utility-belt/es6';

const TransactionList = React.createClass({
    propTypes: {
        children: React.PropTypes.node,
        transactionList : React.PropTypes.array,
        handleAssetClick: React.PropTypes.func
    },


    render() {
        const {
            children,
            handleAssetClick,
            transactionList
        } = this.props;

        if (!transactionList) return null;
        return (
            <div className="transaction-list">
                {
                    transactionList
                        .sort((a, b) => {
                            if (a.id < b.id) return -1;
                            if (a.id > b.id) return 1;
                            return 0;
                        })
                        .map(transaction =>
                            <TransactionWrapper
                                key={transaction.id}
                                transaction={transaction}
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
        transaction: React.PropTypes.object
    },

    render() {
        const {
            children,
            handleAssetClick,
            transaction
        } = this.props;

        return (
            <div>
                {
                    React.Children.map(children, (child) =>
                        React.cloneElement(child, {
                            transaction,
                            handleAssetClick: handleAssetClick
                        })
                    )
                }
            </div>
        );
    }
});

export default TransactionList;
