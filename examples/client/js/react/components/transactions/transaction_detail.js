import React from 'react';

import { Row, Col, Glyphicon } from 'react-bootstrap/lib';
import classnames from 'classnames';
import moment from 'moment';

import {getAssetIdFromTransaction} from '../../../utils/bigchaindb/transactions';


const TransactionDetail = React.createClass({
    propTypes: {
        transaction: React.PropTypes.object,
        className: React.PropTypes.string,
        onClick: React.PropTypes.func
    },

    getTransactionContent() {
        const {
            asset,
            assetContent
        } = this.props;

        if (assetContent) {
            return assetContent;
        }
        // TODO: Validate
        const { data: { payload: { content } } = {} } = asset.transaction;
        return content || '-';
    },



    render() {
        const {
            transaction,
            className,
            onClick
        } = this.props;
        // const timestamp =
        //     moment(parseInt(asset.transaction.timestamp, 10) * 1000).toDate().toGMTString();

        return (
            <div className={classnames('transaction-container', className)}>
                <div className="transaction-container-summary">
                    <TransactionRow label="ID" value={transaction.id} />
                    <TransactionRow label="AssetID" value={getAssetIdFromTransaction(transaction)} />
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
                        value={JSON.stringify(transaction.metadata, null, 4)}/>
                    <TransactionRowCollapsible
                        label="Inputs" value={JSON.stringify(transaction.inputs, null, 4)}/>
                    <TransactionRowCollapsible
                        label="Outputs" value={JSON.stringify(transaction.outputs, null, 4)}/>
                </div>
            </div>
        );
    }
});

const TransactionRow = React.createClass({
    propTypes: {
        label: React.PropTypes.string,
        value: React.PropTypes.string,
        className: React.PropTypes.string,
        onClick: React.PropTypes.func
    },

    render() {
        const {
            label,
            value,
            className,
            onClick
        } = this.props;
        return (
            <Row>
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
        onClick: React.PropTypes.func
    },

    getInitialState() {
        return {
            collapsed: true
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
            onClick
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
