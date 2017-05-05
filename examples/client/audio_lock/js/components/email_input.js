import React from 'react';
import ReactModal from 'react-modal';

import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';

import * as driver from 'js-bigchaindb-quickstart';

import SyntaxHighlighter from 'react-syntax-highlighter';
import { zenburn } from 'react-syntax-highlighter/dist/styles'


const keypairCode =
`import * as driver from 'js-bigchaindb-driver';

const email = "example@bigchaindb.com";
const user = new driver.Ed25519Keypair(email);

console.log(user.publicKey, user.privateKey);`;


const EmailInput = React.createClass({
    propTypes: {
        onSubmit: React.PropTypes.func
    },

    getInitialState() {
        return {
            emailValue: null,
            showModal: false
        }
    },

    toggleModal() {
        this.setState({
            showModal: !this.state.showModal
        })
    },

    handleSubmit(event) {
        event.preventDefault();

        const {emailValue} = this.state;
        const {onSubmit} = this.props;

        const keyPair = new driver.Ed25519Keypair(emailValue);

        const user = {
            "name": emailValue,
            "sk": keyPair.privateKey,
            "vk": keyPair.publicKey
        };

        onSubmit(user);
    },

    handleInputChange(event) {
        this.setState({
            emailValue: event.target.value
        })
    },

    render() {
        const { showModal } = this.state;

        return (
            <CSSTransitionGroup
                transitionName="screenchange"
                transitionAppear={true}
                transitionAppearTimeout={400}
                transitionEnterTimeout={400}
                transitionLeaveTimeout={200}>
                <div className="status">
                    <button onClick={this.toggleModal} className="button button--secondary">Show code</button>
                    <ReactModal
                        isOpen={showModal}
                        className="modal__content"
                        overlayClassName="modal__overlay"
                        contentLabel="Minimal Modal Example"
                        onRequestClose={this.toggleModal}>
                        <SyntaxHighlighter
                            language='javascript'
                            style={zenburn}
                            wrapLines={true}
                            lineStyle={lineNumber => {
                                let style = { display: 'block' };
                                if ([1, 4].includes(lineNumber)) {
                                    //@kremalicious not sure if we can use external css for this (ie set a class)
                                    style.backgroundColor = 'rgba(57, 186, 145, .2)';
                                }
                              return style;
                            }}>
                            {keypairCode}
                        </SyntaxHighlighter>
                    </ReactModal>
                    <h2 className="status__title">Create user</h2>
                    <p className="status__text">First, I need to create a key pair based on your email so you can receive transactions on BigchainDB.</p>

                    <form className="form" onSubmit={this.handleSubmit}>
                        <p>Enter your email to get started, Dave.</p>
                        <p className="form__group">
                            <input className="form__control" type="email" name="email" id="email" onChange={this.handleInputChange} required/>
                            <label className="form__label" htmlFor="email">Your email</label>
                        </p>
                        <p className="form__group">
                            <button type="submit" className="button button--primary status__button">Create user</button>
                        </p>
                    </form>
                </div>
            </CSSTransitionGroup>
        )
    }
});

export default EmailInput;