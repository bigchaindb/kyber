import React from 'react';
import { safeInvoke } from 'js-utility-belt/es6';
import classnames from 'classnames';

import AccountActions from '../actions/account_actions';
import AccountStore from '../stores/account_store';

import Spinner from './spinner';

const AccountList = React.createClass({
    propTypes: {
        activeAccount: React.PropTypes.object,
        accountList: React.PropTypes.array,
        appName: React.PropTypes.string,
        children: React.PropTypes.node,
        className: React.PropTypes.string,
        handleAccountClick: React.PropTypes.func
    },

    getInitialState() {
        return AccountStore.getState();
    },

    componentDidMount() {
        AccountStore.listen(this.onChange);
        this.fetchAccountList();
    },

    componentWillUnmount() {
        AccountStore.unlisten(this.onChange);
    },

    onChange(state) {
        this.setState(state);
    },

    fetchAccountList() {
        AccountActions.flushAccountList();
        AccountActions.fetchAccountList();
    },

    render() {
        const {
            activeAccount,
            accountList,
            children,
            className,
            handleAccountClick
        } = this.props;

        let accountListLocal = accountList;

        if (!accountList) {
            accountListLocal = this.state.accountList;
        }

        if (accountListLocal && accountListLocal.length > 0) {
            return (
                <div className={classnames(className)}>
                    {accountListLocal
                        .sort((a, b) => {
                            if (a.name < b.name) return -1;
                            if (a.name > b.name) return 1;
                            return 0;
                        })
                        .map(account => (
                            <AccountWrapper
                                key={account.vk}
                                account={account}
                                isActive={!!activeAccount && activeAccount.vk === account.vk}
                                handleClick={handleAccountClick}>
                                {children}
                            </AccountWrapper>
                        ))}
                </div>
            );
        } else {
            return (
                <div style={{ margin: '2em' }}>
                    <Spinner />
                </div>
            );
        }
    }
});

const AccountWrapper = React.createClass({
    propTypes: {
        account: React.PropTypes.object,
        children: React.PropTypes.node,
        handleClick: React.PropTypes.func,
        isActive: React.PropTypes.bool
    },

    handleClick() {
        const { account, handleClick } = this.props;
        safeInvoke(handleClick, account);
    },

    render() {
        const {
            account,
            isActive,
            children
        } = this.props;

        return (
            <div className="account-wrapper">
                {
                    React.Children.map(children, (child) =>
                        React.cloneElement(child, {
                            account,
                            isActive,
                            handleClick: this.handleClick
                        })
                    )
                }
            </div>
        );
    }
});

export default AccountList;
