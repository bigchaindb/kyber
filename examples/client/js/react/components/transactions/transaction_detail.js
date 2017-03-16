import React from 'react';

import { Row, Col, Glyphicon } from 'react-bootstrap/lib';
import classnames from 'classnames';
import moment from 'moment';

import { safeInvoke } from 'js-utility-belt/es6';

import {getAssetIdFromTransaction} from '../../../utils/bigchaindb/transactions';


const TransactionDetail = React.createClass({
    propTypes: {
        transaction: React.PropTypes.object,
        className: React.PropTypes.string,
        handleAssetClick: React.PropTypes.func
    },

    handleAssetClick() {
        const {
            handleAssetClick,
            transaction
        } = this.props;
        safeInvoke(handleAssetClick, getAssetIdFromTransaction(transaction))
    },

    getAssetHTML() {
        const { transaction } = this.props;
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
                    <div className="transaction-body-title">
                        ASSET: {transaction.asset.id}
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
                    <div className="transaction-body-title">METADATA</div>
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
                            {transaction.id}
                        </span>
                        <span className="pull-right">
                            {transaction.operation} - V{transaction.version}
                        </span>
                    </div>
                    { this.getAssetHTML() }
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

const TransactionRow = React.createClass({
    propTypes: {
        label: React.PropTypes.string,
        handleClick: React.PropTypes.func,
        value: React.PropTypes.string,
        className: React.PropTypes.string,
    },

    render() {
        const {
            label,
            value,
            handleClick,
            className,
        } = this.props;
        return (
            <Row onClick={handleClick}>
                <Col xs={2} sm={3} className="transaction-row-label">
                    {label}
                </Col>
                <Col xs={10} sm={9} className="transaction-row-value">
                    {value}
                </Col>
            </Row>
        );
    }
});

const TransactionRowCollapsible = React.createClass({
    propTypes: {
        label: React.PropTypes.string,
        value: React.PropTypes.string,
        className: React.PropTypes.string,
        collapsed: React.PropTypes.bool
    },

    getDefaultProps() {
        return {
            collapsed: true
        }
    },

    getInitialState() {
        return {
            collapsed: this.props.collapsed
        }
    },

    handleCollapseClick() {
        this.setState({
            collapsed: !this.state.collapsed
        })
    },

    render() {
        const {
            label,
            value,
            className,
        } = this.props;

        const {
            collapsed
        } = this.state;

        return (
            <div>
                <Row
                    className="transaction-collapsible-container"
                    onClick={this.handleCollapseClick}>
                    <Col xs={12}>
                        {label}
                        <span>
                            {
                                collapsed ?
                                    <Glyphicon glyph="plus" /> :
                                    <Glyphicon glyph="minus" />
                            }
                        </span>
                    </Col>
                </Row>
                {
                    collapsed ? null: (
                        <Row>
                            <Col xs={12}>
                                <pre>
                                    {value}
                                </pre>
                            </Col>
                        </Row>

                    )
                }
            </div>
        );
    }
});



export default TransactionDetail;
