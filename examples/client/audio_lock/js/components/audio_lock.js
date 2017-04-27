import React from 'react';

import AccountList from '../../../js/react/components/account_list';
import AccountDetail from '../../../js/react/components/account_detail';

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

        const frequencies = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]

        const unspentsForAccount = (
            unspentOutputs
            && activeAccount
            && unspentOutputs[activeAccount.vk]
        ) ? unspentOutputs[activeAccount.vk] : [];

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
                    <AssetsList />
                    <IconLockLocked />
                    <StatusLockedEmail />
                    <StatusLocked />
                    
                    <IconLockUnlocked />
                    <StatusUnlocked />
                </section>
            </div>
        );
    }
});

export default BigchainDBConnection(AudioLock);


//
// Le components
//
const AssetsList = () => {
    return (
        <div className="assets-list">
            <p>Please select an asset to unlock</p>
            <div className="assets">
                <a className="asset" href=""><IconShirt /> <span className="asset__title">Asset 1</span></a>
                <a className="asset" href=""><IconDiamond /> <span className="asset__title">Asset 2</span></a>
                <a className="asset" href=""><IconSong /> <span className="asset__title">Asset 3</span></a>
                <a className="asset" href=""><IconDocument /> <span className="asset__title">Asset 4</span></a>
                <a className="asset" href=""><IconPicasso /> <span className="asset__title">Asset 5</span></a>
                <a className="asset" href=""><IconTruck /> <span className="asset__title">Asset 6</span></a>
                <a className="asset" href=""><IconBitcoin /> <span className="asset__title">Asset 7</span></a>
                <a className="asset" href=""><IconHouse /> <span className="asset__title">Asset 8</span></a>
                <a className="asset" href=""><IconPackage /> <span className="asset__title">Asset 9</span></a>
            </div>
        </div>
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


//
// Icons
//
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

const IconShirt = () => {
    return (
      <svg className="icon icon--shirt" xmlns="http://www.w3.org/2000/svg" width="23" height="21" viewBox="0 0 23 21">
          <polyline  points="6.999 2.001 5.5 2.001 .5 7.501 3 10.501 5.5 8.001 5.5 20.501 11.499 20.501 17.5 20.501 17.5 8.001 19.999 10.501 22.5 7.501 17.499 2.001 15.999 2.001" />
          <polygon  points="11.499 3.501 8.499 .501 14.499 .501" />
          <rect width="4.243" height="2.121" x="11.627" y="1.69" transform="rotate(-45 13.749 2.75)"/>
          <rect width="4.243" height="2.121" x="7.127" y="1.691" transform="rotate(-135 9.248 2.751)"/>
          <path  d="M11.499,20.501 L11.499,3.501" />
          <path d="M12.999 8.001C12.722 8.001 12.499 8.224 12.499 8.501 12.499 8.777 12.722 9.001 12.999 9.001 13.274 9.001 13.499 8.777 13.499 8.501 13.499 8.224 13.274 8.001 12.999 8.001L12.999 8.001zM12.999 10.001C12.722 10.001 12.499 10.224 12.499 10.501 12.499 10.777 12.722 11.001 12.999 11.001 13.274 11.001 13.499 10.777 13.499 10.501 13.499 10.224 13.274 10.001 12.999 10.001L12.999 10.001zM12.999 12.001C12.722 12.001 12.499 12.224 12.499 12.501 12.499 12.777 12.722 13.001 12.999 13.001 13.274 13.001 13.499 12.777 13.499 12.501 13.499 12.224 13.274 12.001 12.999 12.001L12.999 12.001zM12.999 14.001C12.722 14.001 12.499 14.224 12.499 14.501 12.499 14.777 12.722 15.001 12.999 15.001 13.274 15.001 13.499 14.777 13.499 14.501 13.499 14.224 13.274 14.001 12.999 14.001L12.999 14.001zM12.999 16.001C12.722 16.001 12.499 16.224 12.499 16.501 12.499 16.777 12.722 17.001 12.999 17.001 13.274 17.001 13.499 16.777 13.499 16.501 13.499 16.224 13.274 16.001 12.999 16.001L12.999 16.001z"/>
      </svg>
    )
};

const IconDiamond = () => {
    return (
      <svg className="icon icon--diamond" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path d="M23.5,7.5 L0.5,7.5"/>
          <polygon points="12 23.5 .5 7.5 5.5 .5 18.5 .5 23.5 7.5"/>
          <polygon points="7.5 7.5 12 .5 16.5 7.5 12 23.5"/>
          <path d="M5.5.5L7.5 7.5M18.5.5L16.5 7.5"/>
      </svg>
    )
};

const IconPicasso = () => {
    return (
      <svg className="icon icon--picasso" xmlns="http://www.w3.org/2000/svg" width="20" height="24" viewBox="0 0 20 24">
          <rect width="19" height="23" x=".5" y=".5"/>
          <rect width="13" height="17" x="3.5" y="3.5"/>
          <path d="M16.5 3.5L19.5.5M3.5 3.5L.5.5M.5 23.5L3.5 20.5M16.5 20.5L19.5 23.5M14 9C14 9 12 10.5 11 10.5 10 10.5 8 9 8 9 8 9 10 7.5 11 7.5 12 7.5 14 9 14 9zM11 9L11 10.5M13.5 7L14.5 6M12 6L12.5 5.5M8 7L7 6M9.5 6L9 5.5"/>
          <polyline points="14.5 12 13.5 13 14.5 14 13.5 15"/>
          <polyline points="7 11 5.5 13.5 8.5 13.5 8.5 15.5 11 15.5 8.5 17.5 8.5 18.5"/>
      </svg>
    )
};

const IconDocument = () => {
    return (
      <svg className="icon icon--document" xmlns="http://www.w3.org/2000/svg" width="18" height="24" viewBox="0 0 18 24">
          <polygon points="17.5 23.5 .5 23.5 .5 .5 11.5 .5 17.5 6.5"/>
          <polyline points="11.5 .5 11.5 6.5 17.5 6.5"/>
          <path d="M4.5 7.5L9 7.5M4.5 10.5L13.5 10.5M4.5 13.5L13.5 13.5M4.5 16.5L13.5 16.5M4.5 19.5L13.5 19.5"/>
      </svg>
    )
};

const IconSong = () => {
    return (
      <svg className="icon icon--song" xmlns="http://www.w3.org/2000/svg" width="18" height="24" viewBox="0 0 18 24">
          <polygon points="17.5 23.5 .5 23.5 .5 .5 11.5 .5 17.5 6.5"/>
          <polyline points="11.5 .5 11.5 6.5 17.5 6.5"/>
          <ellipse cx="7.564" cy="17.554" transform="rotate(-11.887 7.564 17.554)" rx="3.001" ry="2"/>
          <path d="M10.5,17.5 L11.211,9.743 C11.211,9.743 14.767,9.512 14.5,12.5"/>
      </svg>
    )
};

const IconTruck = () => {
    return (
      <svg className="icon icon--truck" xmlns="http://www.w3.org/2000/svg" width="24" height="18" viewBox="0 0 24 18">
          <circle cx="8" cy="15" r="2.5"/>
          <circle cx="19" cy="15" r="2.5"/>
          <polyline points="8.5 10.5 8.5 .5 23.5 .5 23.5 14.5"/>
          <path d="M.5 15.5L.5 8.5C.5 6.301 2.301 4.5 4.5 4.5L8.5 4.5M12.5 14.5L14.5 14.5M.5 15.5L3.5 15.5"/>
          <path d="M2.5 10.5L2.5 8C2.5 7.175 3.176 6.5 4 6.5L6.5 6.5M.5 13.5L4 13.5"/>
      </svg>
    )
};

const IconBitcoin = () => {
    return (
      <svg className="icon icon--bitcoin" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <path d="M10.5 7L10.5 8.5M12.5 7L12.5 8.5M10.5 14.5L10.5 16M12.5 14.5L12.5 16M14.5 10C14.5 10.828 13.828 11.5 13 11.5L9.5 11.5 9.5 8.5 13 8.5C13.828 8.5 14.5 9.173 14.5 10zM14.5 13C14.5 13.828 13.828 14.5 13 14.5L9.5 14.5 9.5 11.5 13 11.5C13.828 11.5 14.5 12.173 14.5 13z"/>
          <path d="M19.5 18.5C19.5 19.05 19.051 19.5 18.5 19.5L5.5 19.5C4.95 19.5 4.5 19.05 4.5 18.5L4.5 5.5C4.5 4.951 4.95 4.5 5.5 4.5L18.5 4.5C19.051 4.5 19.5 4.951 19.5 5.5L19.5 18.5zM11.5.5L11.5 4.5M7.5.5L7.5 4.5M16.5.5L16.5 4.5M.5 12.5L4.5 12.5M.5 16.5L4.5 16.5M.5 7.5L4.5 7.5M12.5 23.5L12.5 19.5M16.5 23.5L16.5 19.5M7.5 23.5L7.5 19.5M23.5 11.5L19.5 11.5M23.5 7.5L19.5 7.5M23.5 16.5L19.5 16.5"/>
      </svg>
    )
};

const IconHouse = () => {
    return (
      <svg className="icon icon--house" xmlns="http://www.w3.org/2000/svg" width="24" height="20" viewBox="0 0 24 20">
          <path d="M0.5,18.5 L23.5,18.5" />
          <rect width="17" height="10" x="3.5" y="8.5" />
          <polygon points="12 0 .5 8.5 23.5 8.5" />
          <polyline points="20.5 6.291 20.5 1.5 17.5 1.5 17.5 4.078"/>
          <rect width="3" height="5" x="6.5" y="11.5"/>
          <rect width="5" height="3" x="12.5" y="11.5"/>
          <rect width="5" height="2" x="5.5" y="16.5"/>
      </svg>
    )
};

const IconPackage = () => {
    return (
      <svg className="icon icon--package" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
          <rect width="23" height="16" x=".5" y="7.5"/>
          <polygon points="23.5 7.5 .5 7.5 5.5 .5 18.5 .5"/>
          <path d="M11.5,0.5 L11.5,7.5"/>
          <rect width="8" height="3" x="13.5" y="18.5"/>
      </svg>
    )
};
