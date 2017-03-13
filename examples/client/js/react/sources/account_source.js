import AccountActions from '../actions/account_actions';

import request from '../../utils/request';

const mockAccounts = {
    accounts: [
        {
            "id": "2c62859d-0220-4fd4-af47-4b8f1c09add0",
            "ledger": {
                "api": "localhost:8000",
                "id": 0,
                "ws": "localhost:48888"
            },
            "name": "Carly",
            "sk": "6HgCvsvF7o1zFDPyXZsmU6ZZ7eiiY8i2ccB6z21sfNC8",
            "vk": "79K8SPZbeSDYXBrWgt3dsNmYTZbKNtdYQ5XrjA9XEWfG"
        },
        {
            "id": "f457538f-9011-448f-b351-0ef2df94c1b7",
            "ledger": {
                "api": "localhost:8000",
                "id": 0,
                "ws": "localhost:48888"
            },
            "name": "Bruce",
            "sk": "4HhPSKV9QGGJr2U6Mq5DoZRoqrCU38RfGK6gDtXKAn1L",
            "vk": "AkZUXyGrEygFF6R8vQveE2Wswkn4rSudEBuUSaV7Wiin"
        },
        {
            "id": "2c89d765-6db4-4fd0-b190-a06194bee44c",
            "ledger": {
                "api": "localhost:8000",
                "id": 0,
                "ws": "localhost:48888"
            },
            "name": "Albi",
            "sk": "GM5K9Nm6JbTJNKgfJZMCw87sgWgbxTF5ybju8DAReayW",
            "vk": "4NSFHRzjjQNJ6kpCkXfeUciGfCme6H1htVNLAgymJ7bu"
        },
        {
            "id": "ab0890bd-dfe5-49fb-9398-09a85e0229ff",
            "ledger": {
                "api": "localhost:8000",
                "id": 1,
                "ws": "localhost:48888"
            },
            "name": "Dimi",
            "sk": "2HhWSNirT4rG3WaZ88uL6eyx8p1RTNSCR2ZaCdJMiEt9",
            "vk": "4hfGNaQAZkwBk4maYxeAYUcuBDjkb9euQTGCi1d8QdhG"
        }
    ]
};


const AccountSource = {
    lookupAccount: {
        remote(state) {
            return request('accounts_detail', {
                urlTemplateSpec: {
                    accountId: state.accountMeta.idToFetch
                }
            });
        },

        success: AccountActions.successFetchAccount,
        error: AccountActions.errorAccount
    },

    lookupAccountList: {
        remote(state) {
            return new Promise((resolve, reject) => {
                // simulate an asynchronous action where data is fetched on
                // a remote server somewhere.
                setTimeout(function () {
                    // resolve with some mock data
                    resolve(mockAccounts);
                }, 50);
            });
        },

        success: AccountActions.successFetchAccountList,
        error: AccountActions.errorAccount
    },

    postAccount: {
        remote(state) {
            return request('accounts', {
                method: 'POST',
                jsonBody: state.accountMeta.payloadToPost
            });
        },

        success: AccountActions.successPostAccount,
        error: AccountActions.errorAccount
    }
};

export default AccountSource;
