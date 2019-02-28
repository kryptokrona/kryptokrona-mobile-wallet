// Copyright (C) 2018, Zpalmtree
//
// Please see the included LICENSE file for more information.

import React from 'react';

import { Animated, Image } from 'react-native';

export class Spinner extends React.Component {
    constructor(props) {
        super(props);
        this.animation = new Animated.Value(0);
    }

    componentDidMount() {
        Animated.loop(
            Animated.timing(this.animation, {toValue: 1, duration: 2000, useNativeDriver: true})
        ).start();
    }

    render() {
        const rotation = this.animation.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg']
        });

        return(
            <Animated.View style={{transform: [{rotate: rotation}], justifyContent: 'center', alignItems: 'center'}}>
                <Image
                    source={require('../assets/img/spinner.png')}
                    style={{resizeMode: 'contain', width: 200, height: 200}}
                />
            </Animated.View>
        );
    }
}
