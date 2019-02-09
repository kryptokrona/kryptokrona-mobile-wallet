// Copyright (C) 2018, Zpalmtree
//
// Please see the included LICENSE file for more information.

import * as React from 'react';

import { StyleSheet, View } from 'react-native';

import { legacyRNElementsColors } from './Styles';

const styles = StyleSheet.create({
    listContainer: {
        marginTop: 20,
        borderTopWidth: 1,
        borderColor: legacyRNElementsColors.greyOutline,
        backgroundColor: legacyRNElementsColors.white,
    },
});

/* https://github.com/react-native-training/react-native-elements/issues/1565 */
const ListContainer: React.SFC<{ children: React.ReactNode }> = ({
    children,
}) => <View style={styles.listContainer}>{children}</View>;

export default ListContainer;
