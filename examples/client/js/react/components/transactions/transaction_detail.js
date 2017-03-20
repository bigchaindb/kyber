import React from 'react';

import { Row, Col, Glyphicon } from 'react-bootstrap/lib';
import classnames from 'classnames';
import moment from 'moment';

import { safeInvoke, safeMerge } from 'js-utility-belt/es6';

import { getAssetIdFromTransaction } from '../../../utils/bigchaindb/transactions';

import BlockActions from '../../actions/block_actions';
import BlockStore from '../../stores/block_store';

import VoteActions from '../../actions/vote_actions';
import VoteStore from '../../stores/vote_store';

const TransactionDetail = React.createClass({
    propTypes: {
        transaction: React.PropTypes.object,
        transactionStatuses: React.PropTypes.object,
        className: React.PropTypes.string,
        handleAssetClick: React.PropTypes.func
    },
    
    getInitialState() {
        const blockStore = BlockStore.getState();

        return safeMerge(
            {
                statusCollapsed: false
            },
            blockStore
        );
    },

    componentDidMount() {
        BlockStore.listen(this.onChange);
    },

    componentWillUnmount() {
        BlockStore.unlisten(this.onChange)
    },

    onChange(state) {
        this.setState(state);
    },

    handleAssetClick() {
        const {
            handleAssetClick,
            transaction
        } = this.props;
        safeInvoke(handleAssetClick, getAssetIdFromTransaction(transaction))
    },

    getAssetHTML() {
        const {
            transaction,
            handleAssetClick
        } = this.props;

        if (transaction.operation.toLowerCase() == 'create') {
            if (transaction.asset && transaction.asset.data) {
                return (
                    <div className="transaction-body">
                        <div className="transaction-body-title">ASSET</div>
                        <div className="transaction-body-body">
                            <pre>
                                {JSON.stringify(transaction.asset.data, null, 4)}
                            </pre>
                        </div>
                    </div>
                )
            }
        }
        else if (transaction.operation.toLowerCase() == 'transfer') {
            return (
                <div className="transaction-body">
                    <div
                        onClick={() => safeInvoke(handleAssetClick, transaction.asset.id)}
                        className="transaction-body-title transaction-link">
                        ASSET: {transaction.asset.id} { 
                            !!handleAssetClick && 
                            <span>[<Glyphicon glyph="share-alt" />]</span> 
                        }
                    </div>
                </div>
            )
        }
        return null;
    },

    getMetadataHTML() {
        const { transaction } = this.props;
        if (transaction.metadata) {
            return (
                <div className="transaction-body">
                    <div className="transaction-body-title">
                        METADATA:
                    </div>
                    <div className="transaction-body-body">
                    <pre>
                        {JSON.stringify(transaction.metadata, null, 4)}
                    </pre>
                </div>
                </div>
            )
        }
        return null;
    },

    getStatusHTML() {
        const {
            transaction,
            transactionStatuses
        } = this.props;

        const { statusCollapsed } = this.state;

        if (transactionStatuses
            && transactionStatuses.hasOwnProperty(transaction.id)
            && transactionStatuses[transaction.id].status) {
            return (
                <div className="transaction-body">
                    <div onClick={this.handleStatusToggle}
                        className="transaction-body-title transaction-link">
                        STATUS:&nbsp;
                        {
                            transactionStatuses[transaction.id].status.toUpperCase()
                        } [
                        <Glyphicon glyph={statusCollapsed ? "triangle-top" : "triangle-bottom"} />]
                    </div>
                </div>
            )
        }
        return null;
    },

    getBlockHTML() {
        const {
            statusCollapsed,
            blockMap
        } = this.state;

        const { transaction } = this.props;

        if (statusCollapsed
            && blockMap
            && blockMap.hasOwnProperty(transaction.id)
            && Array.isArray(blockMap[transaction.id])) {
            return (
                <BlockList blockList={blockMap[transaction.id]}/>
            )
        }
        return null;
    },

    handleStatusToggle() {
        const {
            transaction
        } = this.props;

        BlockActions.fetchBlockList({ txId: transaction.id });

        this.setState({
            statusCollapsed: !this.state.statusCollapsed
        })
    },

    render() {
        const {
            transaction,
            className
        } = this.props;

        return (
            <div className={classnames('transaction-container', className)} >
                <div className="transaction-container-summary">
                    <div className="transaction-header">
                        <span>
                            ID: {transaction.id}
                        </span>
                        <span className="pull-right">
                            {transaction.operation} - V{transaction.version}
                        </span>
                    </div>
                    { this.getAssetHTML() }
                    { this.getStatusHTML() }
                    { this.getBlockHTML() }
                    { this.getMetadataHTML() }
                    <TransactionFlow transaction={transaction}/>
                </div>
            </div>
        );
    }
});

const TransactionFlow = React.createClass({
    propTypes: {
        transaction: React.PropTypes.object
    },

    render() {
        const { inputs, outputs } = this.props.transaction;
        return (
            <Row className="transaction-flow-row">
                <Col xs={6} className="transaction-flow-col transaction-flow-col-left">
                    <div className="transaction-flow-body">
                        {
                            inputs ?
                                inputs.map((input) => {
                                    return input.owners_before.map((publicKey) => {
                                        return (
                                            <div>
                                                {publicKey}
                                            </div>
                                        );
                                    })
                                }) : <div>*</div>
                        }
                    </div>
                </Col>
                <Col xs={6} className="transaction-flow-col">
                    <div className="transaction-flow-body">
                        <Glyphicon glyph="chevron-right" className="transaction-flow-glyph-right"/>
                        {
                            outputs ?
                                outputs.map((output) => {
                                    return output.public_keys.map((publicKey) => {
                                        return (
                                            <div>
                                                {publicKey}
                                            </div>
                                        );
                                    })
                                }): <div>*</div>
                        }
                    </div>
                </Col>
            </Row>
        )
    }
});

const BlockList = React.createClass({
    propTypes : {
        blockList: React.PropTypes.array
    },

    render() {
        const { blockList } = this.props;

        if (Array.isArray(blockList)) {
            return (
                <div>
                    {
                        blockList.map((blockId) => <BlockDetail key={blockId} blockId={blockId} />)
                    }
                </div>
            )
        }
        return null;
    }
});

const BlockDetail = React.createClass({
    propTypes: {
        blockId: React.PropTypes.string
    },
    
    getInitialState() {
        const voteStore = VoteStore.getState();

        return safeMerge(
            {
                collapsed: false
            },
            voteStore
        );
    },

    componentDidMount() {
        VoteStore.listen(this.onChange);
    },

    componentWillUnmount() {
        VoteStore.unlisten(this.onChange)
    },

    onChange(state) {
        this.setState(state);
    },
    
    handleToggle() {
        const { blockId } = this.props;

        this.setState({ 
            collapsed: !this.state.collapsed
        });

        VoteActions.fetchVoteList(blockId);
    },
    
    render() {
        const {
            collapsed,
            voteMap
        } = this.state;

        const { blockId } = this.props;

        return (
            <div>
                <div className="transaction-body">
                    <div onClick={this.handleToggle}
                        className="transaction-body-title transaction-link">
                        BLOCK: {blockId} [<Glyphicon glyph={collapsed ? "triangle-top" : "triangle-bottom"} />]
                    </div>
                </div>
                {
                    collapsed
                    && voteMap
                    && voteMap.hasOwnProperty(blockId)
                    && Array.isArray(voteMap[blockId]) ?
                        <VoteList voteList={voteMap[blockId]} /> : null
                }
            </div>
        )
    }
});

const VoteList = React.createClass({
    propTypes: {
        voteList: React.PropTypes.array
    },

    render() {
        const { voteList } = this.props;

        return (
            <div>
                {
                    voteList.map((vote) => <VoteDetail vote={vote} key={vote.signature} />)
                }
            </div>
        )
    }
});

const VoteDetail = React.createClass({
    propTypes: {
        vote: React.PropTypes.object
    },

    render() {
        const { vote } = this.props;
        const timestamp =
            moment(parseInt(vote.vote.timestamp, 10) * 1000).toDate().toGMTString();
        const valid = vote.vote.is_block_valid;

        return (
            <div className="transaction-body">
                <div className="transaction-body-title">
                    {valid ? <Glyphicon glyph="ok" /> : <Glyphicon glyph="remove" />} {vote.node_pubkey} ({ timestamp })
                </div>
            </div>
        )

    }
});

export default TransactionDetail;

