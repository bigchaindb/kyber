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

    render() {
        const {
            transaction,
            className
        } = this.props;
        // const timestamp =
        //     moment(parseInt(asset.transaction.timestamp, 10) * 1000).toDate().toGMTString();

        return (
            <div className={classnames('transaction-container', className)} >
                <div className="transaction-container-summary">
                    <TransactionRow label="ID" value={transaction.id} />
                    <TransactionRow
                        label="AssetID"
                        handleClick={this.handleAssetClick}
                        value={getAssetIdFromTransaction(transaction)} />
                    <TransactionRow label="Operation" value={transaction.operation} />
                    <TransactionRow label="Version" value={transaction.version} />
                    <TransactionRow
                        label="I/O"
                        value={transaction.inputs.length + "/" + transaction.outputs.length} />
                    <TransactionRowCollapsible
                        label="Asset Data"
                        value={JSON.stringify(transaction.asset, null, 4)}/>
                    <TransactionRowCollapsible
                        label="Meta Data"
                        value={JSON.stringify(transaction.metadata, null, 4)}
                        collapsed={false}/>
                    <TransactionRowCollapsible
                        label="Inputs"
                        value={JSON.stringify(transaction.inputs, null, 4)}/>
                    <TransactionRowCollapsible
                        label="Outputs"
                        value={JSON.stringify(transaction.outputs, null, 4)}/>
                </div>
            </div>
        );
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
                        <span className="monospace">
                            {collapsed ? '[+]' : '[-]'}
                        </span>
                        {label}
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
