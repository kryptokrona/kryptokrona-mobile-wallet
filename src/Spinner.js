// Copyright (C) 2018, Zpalmtree
//
// Please see the included LICENSE file for more information.

import React from 'react';

import { Animated, Image, Text } from 'react-native';

export class Spinner extends React.Component {
    constructor(props) {
        super(props);
        this.animation = new Animated.Value(0);
    }


    componentWillMount() {
      this.animatedValue = new Animated.Value(0);
    }

    componentDidMount() {
        Animated.loop(
            Animated.timing(this.animation, {toValue: 1, duration: 2000, useNativeDriver: true})
        ).start();
        Animated.timing(this.animatedValue, {
          toValue: 224,
          duration: 3000
        }).start(() => {
      Animated.timing(this.animatedValue,{
        toValue:0,
        duration: 3000
      }).start()
    });
    }

    render() {
        const rotation = this.animation.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '0deg']
        });

       const interpolateColor =  this.animatedValue.interpolate({
       inputRange: [0, 32, 64, 96, 128, 160, 192, 224],
       outputRange:['#5f86f2','#a65ff2','#f25fd0','#f25f61','#f2cb5f','#abf25f','#5ff281','#5ff2f0']
     });

        return(
            <Animated.View style={{justifyContent: 'center', alignItems: 'center', backgroundColor: interpolateColor, width: "100%", height: "100%"}}>
            <Text style={{
                color: 'black',
                fontSize: 212,
                fontFamily: 'icomoon'
            }}>
                
            </Text>
            </Animated.View>
        );
    }
}
