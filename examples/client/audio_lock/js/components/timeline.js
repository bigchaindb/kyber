import React, {Component} from 'react';
import ReactModal from 'react-modal';
import classnames from 'classnames';

import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/styles'


class TimeLine extends Component {
    constructor () {
        super();
        this.state = {
            showModal: false
        };

        this.toggleModal = this.toggleModal.bind(this);
    }

    toggleModal () {
        this.setState({ showModal: !this.state.showModal });
    }

    render() {
        const {
            transactionList,
            onClick
        } = this.props;

        const { showModal } = this.state;

        return (
            <aside className="timeline-section animation-slide-in-from-bottom">

                <h2 className="timeline-section__title">Asset ownership</h2>
                <div className="timeline">
                    <div className="timeline__step">
                        <div className={classnames("timeline__indicator", { active: transactionList.length > 0 })}></div>
                        <h3 className="timeline__name">
                            BigchainDB
                        </h3>
                        <div className="timeline__description">
                            { transactionList.length > 0 ?
                                <div>
                                    <a onClick={this.toggleModal}>
                                        {transactionList[0].id}
                                    </a>
                                <ReactModal
                                    isOpen={showModal}
                                    className="modal__content"
                                    overlayClassName="modal__overlay"
                                    contentLabel="Minimal Modal Example"
                                    onRequestClose={this.toggleModal}>
                                    <SyntaxHighlighter language='javascript' style={docco}>
                                        {JSON.stringify(transactionList[0], null, 2)}
                                    </SyntaxHighlighter>
                              </ReactModal>
                              </div> : null
                            }
                        </div>
                    </div>

                    <div className="timeline__step">
                        <div className={classnames("timeline__indicator", { active: transactionList.length > 1 })}></div>
                        <h3 className="timeline__name">
                            You
                        </h3>
                        <div className="timeline__description">
                            { transactionList.length > 1 ?
                                <div>
                                    <a onClick={this.toggleModal}>
                                        {transactionList[1].id}
                                    </a>
                                    <ReactModal
                                        isOpen={showModal}
                                        className="modal__content"
                                        overlayClassName="modal__overlay"
                                        contentLabel="Minimal Modal Example"
                                        onRequestClose={this.toggleModal}>
                                        <SyntaxHighlighter language='javascript' style={docco}>
                                            {JSON.stringify(transactionList[1], null, 2)}
                                        </SyntaxHighlighter>
                                  </ReactModal>
                                </div> : null
                            }
                        </div>
                    </div>

                    <div className="timeline__step" style={{cursor : 'pointer'}}
                        onClick={onClick}>
                        <div className="timeline__indicator"></div>
                        <h3 className="timeline__name">
                            Someone
                        </h3>
                        <p className="timeline__description">
                        </p>
                    </div>

                </div>
            </aside>
        )
    }
}

TimeLine.propTypes = {
    transactionList: React.PropTypes.array,
    onClick: React.PropTypes.func,
    
};

export default TimeLine;