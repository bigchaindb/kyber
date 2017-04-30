import React, {PropTypes, Component} from 'react'
import SpeechRecognition from 'react-speech-recognition'

const propTypes = {
    // Props injected by SpeechRecognition
    transcript: PropTypes.string,
    resetTranscript: PropTypes.func,
    browserSupportsSpeechRecognition: PropTypes.bool
};

class Dictaphone extends Component {

    render() {
        const {transcript, resetTranscript, browserSupportsSpeechRecognition, recognition} = this.props;

        if (!browserSupportsSpeechRecognition) {
            return null
        }

        recognition.lang = 'en-US';

        return (
            <div>
                <button onClick={resetTranscript}>Reset</button>
                <span>{transcript}</span>
            </div>
        )
    }
}

Dictaphone.propTypes = propTypes;

export default SpeechRecognition(Dictaphone)