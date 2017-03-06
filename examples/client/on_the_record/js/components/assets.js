import React from 'react';

import Scroll from 'react-scroll';

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
import AssetActions from '../../../js/react/actions/asset_actions';

import AssetHistory from './asset_history';


const Assets = React.createClass({

    propTypes: {
        activeAccount: React.PropTypes.object,
        assetList: React.PropTypes.array
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

        Scroll.animateScroll.scrollToBottom();
    },

    handleInputChange(event) {
        this.setState({ value: event.target.value });
    },

    render() {
        const {
            activeAccount,
            assetList
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
            <div>
                <AssetHistory
                    assetList={assetList} />
                <form onSubmit={this.handleInputSubmit}>
                    <input
                        autoFocus
                        className="navbar-fixed-bottom"
                        onChange={this.handleInputChange}
                        placeholder="Type what you want to share on the blockchain"
                        value={value} />
                </form>
            </div>
        );
    }
});

export default Assets;
