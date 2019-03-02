// Copyright (C) 2018, Zpalmtree
//
// Please see the included LICENSE file for more information.

import React from 'react';

import { Animated, StyleSheet, View, Easing } from 'react-native';

import Config from './Config';

var styles = StyleSheet.create({
    background: {
        backgroundColor: '#bbbbbb',
        height: 5,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    fill: {
        backgroundColor: Config.theme.primaryColour,
        height: 5
    }
});

export class ProgressBar extends React.Component {
    constructor(props) {
        super(props);

        this.state = { 
            progress: new Animated.Value(this.props.initialProgress || 0),
        };
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.progress >= 0 && this.props.progress != prevProps.progress) {
          this.update();
        }
    }

    render() {
        const width = this.props.style.width || 300;

        var fillWidth = this.state.progress.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1 * width],
        });

        return(
            <View style={[styles.background, this.props.style]}>
                <Animated.View style={[styles.fill, { width: fillWidth }]}/>
            </View>
        );
    }

    update() {
        Animated.timing(this.state.progress, {
            easing: Easing.inOut(Easing.ease),
            duration: 500,
            toValue: this.props.progress,
        }).start();
    }
}
