import React from 'react';
import ReactModal from 'react-modal';

import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/styles'

import AssetAudioLock from './asset_audio_lock';

import Dictaphone from './dictaphone';


const AudioLockSwitcher = React.createClass({
    propTypes: {
        activeAccount: React.PropTypes.object,
        activeAsset: React.PropTypes.object,
        assetAccount: React.PropTypes.object,
        frequencyList: React.PropTypes.array,
        magicWords: React.PropTypes.array,
        magicWordsThreshold: React.PropTypes.number,
        onUnlock: React.PropTypes.func
    },

    getInitialState() {
        return {
            fallback: false,
            showModal: false
        }
    },

    toggleFallback() {
        this.setState({
            fallback: !this.state.fallback
        })
    },

    toggleModal() {
        this.setState({
            showModal: !this.state.showModal
        })
    },

    render() {
        const {

            fallback,
            showModal
        } = this.state;

        const {
            assetAccount,
            activeAccount,
            activeAsset,
            frequencyList,
            magicWords,
            magicWordsThreshold,
            onUnlock
        } = this.props;

        return (
            <div className="is-locked animation-fadein">
                <button onClick={this.toggleModal} className="button button--secondary">Show code</button>
                <ReactModal
                    isOpen={showModal}
                    className="modal__content"
                    overlayClassName="modal__overlay"
                    contentLabel="Minimal Modal Example"
                    onRequestClose={this.toggleModal}>
                    <SyntaxHighlighter
                        language='javascript'
                        style={docco}
                        showLineNumbers={true}
                        wrapLines={true}
                        lineStyle={lineNumber => {
                            let style = {display: 'block'};
                            if ([35, 36, 37, 38, 39, 40, 42, 43, 44, 45, 47].includes(lineNumber)) {
                                //@kremalicious not sure if we can use external css for this (ie set a class)
                                style.backgroundColor = '#dbffdb';
                            }
                            return style;
                        }}>
                        const test;
                    </SyntaxHighlighter>
                </ReactModal>
                { (!fallback) ?
                    <AssetAudioLock
                        activeAsset={activeAsset}
                        activeAccount={activeAccount}
                        assetAccount={assetAccount}
                        targetFrequency={activeAsset.asset.data.frequency}
                        frequencyList={frequencyList}
                        onFrequencyHit={onUnlock}/> :
                    <Dictaphone
                        activeAsset={activeAsset}
                        activeAccount={activeAccount}
                        assetAccount={assetAccount}
                        magicWords={magicWords}
                        magicWordsThreshold={magicWordsThreshold}
                        onWordHit={onUnlock}/>
                }
                <button onClick={this.toggleFallback}
                        className="button button--secondary button--xs button--switchchallenge">Switch challenge
                </button>
            </div>
        )
    }
});

export default AudioLockSwitcher;