import React from 'react';


const TransactionList = React.createClass({
    propTypes: {
        children: React.PropTypes.node,
        transactionList : React.PropTypes.array,
        handleTransactionClick: React.PropTypes.func
    },


    render() {
        const {
            children,
            handleTransactionClick,
            transactionList
        } = this.props;

        console.log(transactionList)
        if (!transactionList) return null;
        return (
            <div>
                {
                    transactionList.map(transaction =>
                        <TransactionWrapper
                            key={transaction.id}
                            transaction={transaction}
                            handleClick={handleTransactionClick}>
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
        handleClick: React.PropTypes.func,
        transaction: React.PropTypes.object
    },

    handleClick() {
        const { account, handleClick } = this.props;
        safeInvoke(handleClick, account);
    },

    render() {
        const {
            children,
            transaction
        } = this.props;

        return (
            <div>
                {
                    React.Children.map(children, (child) =>
                        React.cloneElement(child, {
                            transaction,
                            handleClick: this.handleClick
                        })
                    )
                }
            </div>
        );
    }
});

export default TransactionList;
