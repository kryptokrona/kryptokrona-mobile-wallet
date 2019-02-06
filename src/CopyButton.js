// Copyright (C) 2018, Zpalmtree
//
// Please see the included LICENSE file for more information.

import React from 'react';

import {
    View, Button, Clipboard
} from 'react-native'

import Config from './Config';

import { Styles } from './Styles';
import { toastPopUp } from './Utilities';

/**
 * Copy the data to clipboard
 */
export class CopyButton extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return(
            <View style={[Styles.buttonContainer, {
                    alignItems: 'flex-end',
                }]}>
                <Button
                    title='Copy'
                    onPress={() => {
                        Clipboard.setString(this.props.data);
                        toastPopUp(this.props.name + ' copied');
                    }}
                    color={Config.theme.primaryColour}
                />
            </View>
        );
    }
}
