import React from 'react';

import classnames from 'classnames';
import { Row } from 'react-bootstrap/lib';


const AccountDetail = ({
        account,
        assetList,
        isActive,
        handleClick
    }) => {
    return (
        <Row
            className={classnames('list-row', { 'active': isActive })}
            onClick={handleClick}>
            <div className="list-row-name">
                {account.name}
            </div>
            <div className="list-row-detail">
                {account.vk}
            </div>
            <div>
                {
                    assetList.map((assetId) => {
                        return (
                            <AssetItem
                                key={assetId}
                                asset={assetId}/>
                        )
                    })
                }
            </div>
        </Row>
    );
};

AccountDetail.propTypes = {
    account: React.PropTypes.object,
    assetList: React.PropTypes.array,
    handleClick: React.PropTypes.func,
    isActive: React.PropTypes.bool
};

export default AccountDetail;

const AssetItem = React.createClass({
    propTypes: {
        asset: React.PropTypes.string,
        // children: React.PropTypes.node,
        handleClick: React.PropTypes.func,
        // isActive: React.PropTypes.bool
    },

    handleClick() {
        const { asset, handleClick } = this.props;
        safeInvoke(handleClick, asset);
    },

    render() {
        const { asset } = this.props;
        return (
            <div className="asset"
                key={asset}
                onClick={this.handleClick}>
                    {asset}
            </div>
       );
   }
});
