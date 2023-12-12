// Copyright (C) 2018, Zpalmtree
//
// Please see the included LICENSE file for more information.

import React from 'react';

import { View, Text } from 'react-native';

export class Spinner extends React.Component {
    constructor(props) {
        super(props);
    }


    render() {

        return(
            <View style={{justifyContent: 'center', alignItems: 'center', backgroundColor: 'black', width: "100%", height: "100%"}}>
            <Text style={{
                color: 'white',
                fontSize: 212,
                fontFamily: 'icomoon'
            }}>
                
            </Text>
            </View>
        );
    }
}
