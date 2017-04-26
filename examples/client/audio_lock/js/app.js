// Install necessary polyfills (see supported browsers) into global

import './components/audiocontext-polyfill';

import 'core-js/es6';
import 'core-js/stage/4';
import 'isomorphic-fetch';

import React from 'react';
import ReactDOM from 'react-dom';

import AudioLock from './components/audio_lock'

import '../../scss/main.scss';


const App = () => (
    <div className="app audio-lock">
        <AudioLock />
    </div>
);

ReactDOM.render(<App />, document.getElementById('bigchaindb-example-app'));

