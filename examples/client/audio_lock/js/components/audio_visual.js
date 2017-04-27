'use strict';

import React from 'react';
import ReactDOM from 'react-dom';

import { Row, Col } from 'react-bootstrap/lib';

import classnames from 'classnames';


function hasGetUserMedia() {
    return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia || navigator.msGetUserMedia);
}

const AudioVisual = React.createClass({
    propTypes: {
        audioContext: React.PropTypes.object,
        frequencies: React.PropTypes.array,
        targetFrequency: React.PropTypes.number,
        handleFrequencyHit: React.PropTypes.func
    },

    getDefaultProps() {
        return {
            audioContext: new AudioContext(),
            targetFrequency: 400
        }
    },

    getInitialState() {

        return {
            audioAnalyser: null,
            audioBuffer: null
        }
    },

    componentDidMount() {
        if (!hasGetUserMedia()) return;

        if (!this.state.hasUserMedia) {
            this.requestUserMedia();
        }
    },

    componentDidMount() {
        if (!hasGetUserMedia()) return;

        navigator.getUserMedia = navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia;

        navigator.getUserMedia({audio: true}, (stream) => {
            this.handleUserMedia(null, stream);
        }, (e) => {
            this.handleUserMedia(e);
        });
    },


    handleUserMedia(error, stream) {
        if (error) {
            console.log(error);
            return;
        }

        const {audioContext} = this.props;
        const audioSource1 = audioContext.createMediaStreamSource(stream);

        this.setState({
            audioSource: audioSource1
        });
    },

    render() {
        const { audioSource } = this.state;
        const {
            frequencies,
            targetFrequency,
            handleFrequencyHit
        } = this.props;

        return (
            <FrequencyMeter
                audioSource={audioSource}
                targetFrequency={targetFrequency}
                handleFrequencyHit={handleFrequencyHit}
                frequencies={frequencies}/>
        )
    }
});


const FrequencyMeter = React.createClass({
    propTypes: {
        audioSource: React.PropTypes.object,
        bandsCount: React.PropTypes.number,
        latency: React.PropTypes.number,
        fftSize: React.PropTypes.number,
        dbAxis: React.PropTypes.object,
        smoothingTimeConstant: React.PropTypes.number,
        frequencies: React.PropTypes.array,
        targetFrequency: React.PropTypes.number,
        handleFrequencyHit: React.PropTypes.func
    },

    getDefaultProps() {
        const frequencies = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];

        return {
            audioSource: null,
            bandsCount: 256,
            latency: 20,
            fftSize: 256 * 2,
            dbAxis: {
                min: -100,
                max: 0
            },
            smoothingTimeConstant: 0.95,
            frequencies: frequencies,
        }
    },

    getInitialState() {
        return {
            isFrequencyHit: false
        }
    },

    componentWillUpdate(nextProps) {
        const {audioSource} = nextProps;

        if (this._audioAnalyser && audioSource !== this.props.audioSource) {
            this._audioAnalyser.disconnect();

            clearInterval(this._playingInterval);
            this._audioAnalyser = null;
        }

        if (audioSource && audioSource !== this.props.audioSource) {
            this._audioAnalyser = this.createAnalyzer(nextProps);

            const {latency, fftSize} = nextProps;

            this._playingInterval = this.startTimer(
                {
                    audioSource,
                    audioAnalyser: this._audioAnalyser,
                    latency,
                    fftSize
                });
        }
    },

    createAnalyzer({audioSource, fftSize, dbAxis, smoothingTimeConstant}) {
        if (!audioSource) {
            throw new Error('audioSource is expected');
        }

        const {min, max} = dbAxis;
        const audioAnalyser = audioSource.context.createAnalyser();

        audioAnalyser.fftSize = fftSize;
        audioAnalyser.minDecibels = min;
        audioAnalyser.maxDecibels = max;
        audioAnalyser.smoothingTimeConstant = smoothingTimeConstant;

        audioSource.connect(audioAnalyser, 0, 0);

        return audioAnalyser;
    },

    startTimer({audioSource, audioAnalyser, latency}) {
        const playingInterval = setInterval(
            renderFrame.bind(this, audioAnalyser),
            latency);

        audioSource.onended = () => {
            clearInterval(playingInterval);
        };

        return playingInterval;
    },

    handleFrequencyHit() {
        this.props.handleFrequencyHit();
        this.setState({ isFrequencyHit: true});
    },

    render() {
        const {
            frequencies,
            targetFrequency
        } = this.props;

        const { isFrequencyHit } = this.state;

        return (
            <aside className="audiobar">
                {
                    frequencies.map((frequency) => {
                        return (
                            <NoteNode
                                key={'note' + frequency}
                                ref={'note' + frequency}
                                isTarget={targetFrequency == frequency || isFrequencyHit}
                                frequency={frequency}/>
                        );
                    })
                }
            </aside>
        );
    }
});

const NoteNode = React.createClass({
    propTypes: {
        frequency: React.PropTypes.number,
        isTarget: React.PropTypes.bool
    },

    render() {
        const { isTarget } = this.props;

        return (
            <div className={classnames('audiobar__step', {'target': isTarget})}>
            </div>
        )
    }
});

function renderFrame(analyser) {
    const notes = this.refs;
    const frequencyData = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(frequencyData);

    Object.keys(notes).map((noteKey) => {
        const note = notes[noteKey];
        let domNode = ReactDOM.findDOMNode(note);

        let scale = Math.pow(frequencyData[note.props.frequency] / 255, 2);
        domNode.style.opacity = scale;
        domNode.style.zIndex = 1000;
        let multiplier = 1;
        if (analyser.targetTimer
            && note.props.frequency === this.props.targetFrequency) {
            multiplier = 1 + analyser.targetTimer / 300;
        }
        scale = scale < 0 ? 0 : scale * multiplier;
        domNode.style.transform = 'scale(1, ' + scale + ')';
    });

    if (analyser.targetTimer
        && frequencyData[this.props.targetFrequency] / 255 > 0.6) {
        analyser.targetTimer++;
    } else {
        analyser.targetTimer = 1;
    }

    if (analyser.targetTimer > 300) {
        this.handleFrequencyHit();
        analyser.targetTimer = 1;
    }
}

export default AudioVisual;