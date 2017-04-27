import React from 'react';

import AccountActions from '../../../js/react/actions/account_actions';
import BigchainDBConnection from '../../../js/react/components/bigchaindb_connection';

import TransactionActions from '../../../js/react/actions/transaction_actions';
import TransactionList from '../../../js/react/components/transactions/transaction_list';

import TransactionPanel from './transaction_panel';
import InputTransaction from './input_transaction';


const AudioLock = React.createClass({
    propTypes: {
        // Injected through BigchainDBConnection
        activeAccount: React.PropTypes.object,
        handleAccountChange: React.PropTypes.func,
        transactionMap: React.PropTypes.object,
        unspentOutputs: React.PropTypes.object
    },

    getInitialState() {
        return {
            showHistory: false
        };
    },

    componentDidMount() {
        AccountActions.flushAccountList();
        AccountActions.fetchAccountList();
    },

    fetchTransactionListForAsset(assetId) {
        if (assetId) {
            TransactionActions.fetchTransactionList({
                assetId
            })
        }
    },

    fetchUnspents(account) {
        if (account) {
            TransactionActions.fetchOutputList({
                public_key: account.vk,
                unspent: true
            });
        }
    },

    handleAccountChange(account) {
        this.props.handleAccountChange(account);
        this.fetchUnspents(account);
    },

    handleAssetClick(assetId) {
        this.fetchTransactionListForAsset(assetId);
        this.setState({showHistory: true});
    },

    handleHistoryClose() {
        this.setState({showHistory: false});
    },

    render() {
        const {
            activeAccount,
            accountList,
            transactionList,
            transactionMap,
            transactionMeta,
            transactionStatuses,
            unspentOutputs
        } = this.props;

        if (accountList && accountList.length == 0) {
            return null;
        }

        const
            frequencies = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
            assetAccount = accountList[0];

        const unspentsForAccount = (
            unspentOutputs
            && activeAccount
            && unspentOutputs[assetAccount.vk]
        ) ? unspentOutputs[assetAccount.vk] : [];

        const transactionsForAccount =
            unspentsForAccount
                .map((transactionId) => {
                    return transactionMap[transactionId];
                })
                .filter(transaction => transaction.operation == 'CREATE' && transaction.asset.data.hasOwnProperty('frequency'));
        
        return (
            <div>
                <nav className="menu">
                    <a className="menu__link" href="../">Back to examples</a>
                    <h1 className="menu__title">BigchainDB Audio Lock</h1>
                </nav>
                <section className="app__content">
                    {
                        transactionsForAccount && transactionsForAccount.length > 0 ?
                            <StateSwitcher
                                assetList={ transactionsForAccount }/> :
                            <div style={{ cursor: "pointer" }}
                                onClick={ () => this.handleAccountChange(accountList[0]) }>
                                <IconLockLocked />
                            </div>
                    }
                </section>
            </div>
        );
    }
});

export default BigchainDBConnection(AudioLock);

const StateSwitcher = React.createClass({
    propTypes: {
        assetList: React.PropTypes.array,
        availableStates: React.PropTypes.array
    },

    getDefaultProps() {
        return {
            availableStates: [
                'list',
                'email',
                'locked',
                'unlocked'
            ]
        }
    },

    getInitialState() {
        return {
            activeAsset: null,
            currentState: 'list'
        }
    },

    handleAssetClick(asset) {
        this.setState({
            activeAsset: asset,
            currentState: 'lock'
        })
    },

    render() {
        const {
            activeAsset,
            currentState
        } = this.state;

        const { assetList } = this.props;

        return (
            <div>
                { (currentState === 'list') &&
                    <AssetsList
                        assetList={assetList}
                        handleAssetClick={this.handleAssetClick}/>
                }
                { (currentState === 'email') &&
                    <StatusLockedEmail />
                }
                { (currentState === 'locked') &&
                    <div>
                        <IconLockLocked />
                        <StatusLocked />
                    </div>
                }
                { (currentState === 'unlocked') &&
                    <div>
                        <IconLockUnlocked />
                        <StatusUnlocked />
                    </div>
                }
            </div>
        )
    }
});

//
// Le components
//
const AssetsList = React.createClass({
    propTypes: {
        assetList: React.PropTypes.array,
        handleAssetClick: React.PropTypes.func
    },

    render() {
        const {
            assetList,
            handleAssetClick
        } = this.props;

        return (
            <div className="assets-list">
                <p>Please select an asset to unlock</p>
                <div className="assets">
                    {
                        assetList.map((asset) => {
                            return (
                                <a className="asset" href="#"
                                    onClick={() => handleAssetClick(asset)}
                                    key={asset.id}>
                                    Asset 1
                                </a>
                            )
                        })
                    }
                </div>
            </div>
        )
    }
});


const IconLockLocked = () => {
    return (
        <svg className="icon icon--lock icon--lock--locked" xmlns="http://www.w3.org/2000/svg" width="18" height="24" viewBox="0 0 18 24">
            <circle cx="9" cy="15" r="1"/>
            <path d="M9,15.5 L9,18.5" />
            <rect width="17" height="14" x=".5" y="9.5"/>
            <path d="M3.5,6 C3.5,2.962 5.962,0.5 9,0.5 C12.038,0.5 14.5,2.962 14.5,6 L14.5,9.5 L3.5,9.5 L3.5,6 Z"/>
        </svg>
    )
};

const IconLockUnlocked = () => {
    return (
        <svg className="icon icon--lock icon--lock--unlocked" xmlns="http://www.w3.org/2000/svg" width="18" height="24" viewBox="0 0 18 24">
            <circle cx="9" cy="15" r="1"/>
            <path d="M9,15.5 L9,18.5"/>
            <rect width="17" height="14" x=".5" y="9.5"/>
            <path d="M3.5,6 C3.5,2.962 5.962,0.5 9,0.5 C12.037,0.5 14.5,2.962 14.5,6 L14.5,9.5"/>
        </svg>
    )
};

const StatusLockedEmail = () => {
    return (
        <div className="status status--locked">
            <h2 className="status__title">Locked</h2>
            <p className="status__text">Enter your email to receive instructions for unlocking this asset.</p>
            
            <form>
                <input className="form__control" type="email" name="email" placeholder="Your email" />
            </form>
        </div>
    )
};

const StatusLocked = () => {
    return (
        <div className="status status--locked">
            <h2 className="status__title">Locked</h2>
            <p className="status__text">Speak to unlock, my dear.</p>
        </div>
    )
};

const StatusUnlocked = () => {
    return (
        <div className="status status--unlocked is-hidden">
            <h2 className="status__title">Unlocked</h2>
            <p className="status__text">Well spoken, eloquent human!</p>
        </div>
    )
};
