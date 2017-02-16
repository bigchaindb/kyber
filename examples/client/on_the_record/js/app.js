// Install necessary polyfills (see supported browsers) into global
import 'core-js/es6';
import 'core-js/stage/4';
import 'isomorphic-fetch';

import React from 'react';
import ReactDOM from 'react-dom';

import OnTheRecord from './components/on_the_record';

import '../../lib/css/scss/main.scss';


try {
    res = request('http://localhost:9984/api/v1/transactions', {
        method: 'POST',
        jsonBody: signedTx
    });
    res.then((res) => request('http://localhost:9984/api/v1/transactions', {
        method: 'POST',
        jsonBody: signedTxTransfer
    }))
} catch (e) {
    console.error(e);
    throw new Error('Unable to retrieve asset list');
}

const App = () => (
    <div className="app on-the-record">
        <OnTheRecord />
    </div>
);

ReactDOM.render(<App />, document.getElementById('bigchaindb-example-app'));
