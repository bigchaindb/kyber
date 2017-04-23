import React from 'react';

import { Glyphicon } from 'react-bootstrap/lib';


const ButtonMenu = React.createClass({
    propTypes: {
        children: React.PropTypes.node,
        glyphIcon: React.PropTypes.string
    },

    getInitialState() {
        return {
            showMenu: true
        }
    },

    handleMenuShow() {
        this.setState({
            showMenu: !this.state.showMenu
        });
    },

    render() {
        const {
            showMenu
        } = this.state;

        const {
            children,
            glyphIcon
        } = this.props;

        return (
            <div onClick={this.handleMenuShow}>
                {
                    showMenu ?
                        <div id="sidebar-wrapper">
                            <div className="sidebar-nav">
                                { children }
                            </div>
                        </div> : null
                }
                <div className="cd-picture sidebar-button">
                    <Glyphicon glyph={ !showMenu ? glyphIcon : "remove"} />
                </div>
            </div>

        );
    }
});


export default ButtonMenu;
