import React from 'react';

import { safeInvoke } from 'js-utility-belt/es6';
import TransactionDetail from '../../../js/react/components/transactions/transaction_detail';
import InputTransaction from './input_transaction';

const TransactionPanel = React.createClass({
    propTypes: {
        activeAccount: React.PropTypes.object,
        accountList: React.PropTypes.array,
        transaction: React.PropTypes.object,
        transactionStatuses: React.PropTypes.object,
        className: React.PropTypes.string,
        handleAssetClick: React.PropTypes.func
    },

    render() {
        const {
            activeAccount,
            accountList,
            transaction,
            transactionStatuses,
            className,
            handleAssetClick
        } = this.props;

        return (
            <div className="transaction-panel">
                <TransactionDetail
                    transaction={transaction}
                    transactionStatuses={transactionStatuses}
                    className={className}
                    handleAssetClick={handleAssetClick} />
                <InputTransaction
                    activeAccount={activeAccount}
                    accountList={accountList}
                    className="input-content-panel"
                    inputTransaction={transaction}
                    placeHolder="TRANSFER the asset by typing: <msg> <@user:optional>"/>
            </div>
        )
    }
});

export default TransactionPanel;
