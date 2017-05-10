// Install necessary polyfills (see supported browsers) into global
import 'core-js/es6';
import 'core-js/stage/4';
import 'isomorphic-fetch';

import React from 'react';
import ReactDOM from 'react-dom';

import ShareTrader from './components/share_trader';

import '../../scss/main.scss';


const App = () => (
    <div className="app--share_trader">
        <ShareTrader />
    </div>
);

ReactDOM.render(<App />, document.getElementsByClassName('app')[0]);
