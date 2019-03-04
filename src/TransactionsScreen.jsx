// Copyright (C) 2018, Zpalmtree
//
// Please see the included LICENSE file for more information.

import React from 'react';

import Ionicons from 'react-native-vector-icons/Ionicons';

import TextTicker from 'react-native-text-ticker';

import { View, Text, FlatList, Button, Linking, ScrollView } from 'react-native';
import { prettyPrintAmount } from 'turtlecoin-wallet-backend';

import Config from './Config';
import ListItem from './ListItem';
import List from './ListContainer';

import { Styles } from './Styles';
import { Globals } from './Globals';
import { coinsToFiat } from './Currency';
import { prettyPrintUnixTimestamp, prettyPrintDate } from './Utilities';

class ItemDescription extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            fontSize: this.props.fontSize || 20,
        }
    }

    render() {
        return(
            <View>
                <Text style={{
                    color: this.props.screenProps.theme.slightlyMoreVisibleColour,
                    fontSize: 15,
                    marginTop: 10
                }}>
                    {this.props.title}
                </Text>

                <TextTicker
                    style={{ color: this.props.screenProps.theme.primaryColour, fontSize: this.state.fontSize, marginBottom: 10 }}
                    marqueeDelay={1000}
                    duration={220 * this.props.item.length}
                >
                    {this.props.item}
                </TextTicker>
            </View>
        )
    }
}

export class TransactionDetailsScreen extends React.Component {
    static navigationOptions = {
        title: 'Transaction Details',
    };

    constructor(props) {
        super(props);

        const tx = props.navigation.state.params.transaction;

        this.state = {
            transaction: tx,
            amount: Math.abs(tx.totalAmount()) - (tx.totalAmount() > 0 ? 0 : tx.fee),
            complete: tx.timestamp !== 0,
            coinValue: '0',
        };

        (async () => {
            const coinValue = await coinsToFiat(
                this.state.amount,
                Globals.preferences.currency,
            );

            this.setState({
                coinValue,
            });
        })();
    }

    render() {
        return(
            <View style={{
                flex: 1,
                backgroundColor: this.props.screenProps.theme.backgroundColour,
            }}>
                <View style={{
                    flex: 1,
                    alignItems: 'flex-start',
                    marginTop: 60,
                    backgroundColor: this.props.screenProps.theme.backgroundColour
                }}>
                    <ScrollView
                        style={{
                            flex: 1,
                        }}
                        contentContainerStyle={{
                            alignItems: 'flex-start',
                            justifyContent: 'flex-start',
                            marginHorizontal: 15,
                            paddingBottom: 60,
                        }}
                    >
                        <ItemDescription
                            title={this.state.transaction.totalAmount() > 0 ? 'Received' : 'Sent'}
                            item={this.state.complete ? prettyPrintUnixTimestamp(this.state.transaction.timestamp) : prettyPrintDate()}
                            {...this.props}
                        />

                        <ItemDescription
                            title='Amount'
                            item={prettyPrintAmount(this.state.amount)}
                            {...this.props}
                        />

                        {this.state.transaction.totalAmount() < 0 && <ItemDescription
                            title='Fee'
                            item={prettyPrintAmount(this.state.transaction.fee)}
                            {...this.props}
                        />}

                        <ItemDescription
                            title='Value'
                            item={this.state.coinValue}
                            {...this.props}
                        />

                        <ItemDescription
                            title='State'
                            item={this.state.complete ? 'Complete' : 'Processing'}
                            {...this.props}
                        />

                        {this.state.complete && <ItemDescription
                            title='Block Height'
                            item={this.state.transaction.blockHeight.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                            {...this.props}
                        />}
                        
                        <ItemDescription
                            title='Hash'
                            item={this.state.transaction.hash}
                            {...this.props}
                        />

                        {this.state.transaction.paymentID !== '' && <ItemDescription
                            title='Payment ID'
                            item={this.state.transaction.paymentID}
                            {...this.props}
                        />}
                    </ScrollView>

                    {this.state.complete && <View style={[Styles.buttonContainer, {width: '100%', marginBottom: 20 }]}>
                        <Button
                            title='View on Block Explorer'
                            onPress={() => {
                                Linking.openURL(Config.explorerBaseURL + this.state.transaction.hash)
                                       .catch((err) => Globals.logger.addLogMessage('Failed to open url: ' + err));
                            }}
                            color={this.props.screenProps.theme.primaryColour}
                        />
                    </View>}
                </View>
            </View>
        );
    }
}

/**
 * List of transactions sent + received 
 */
export class TransactionsScreen extends React.Component {
    static navigationOptions = {
        title: 'Transactions',
        header: null
    };

    constructor(props) {
        super(props);

        const [walletHeight, localHeight, networkHeight] = Globals.wallet.getSyncStatus();

        /* Don't display fusions, and display newest first */
        const transactions = Globals.wallet.getTransactions().filter((x) => x.totalAmount() !== 0);

        this.state = {
            numTransactions: transactions.length,
            transactions,
            walletHeight,
            networkHeight,
        };

        /* Only update transactions list when transaction is sent/received.
           With lots of transactions, it can be very inefficient to constantly
           refetch. */
        Globals.wallet.on('transaction', () => {
            this.updateTransactions();
        });

        /* When we create a transaction, it is in pending state, which we
           want to display. The on('transaction') will be triggered when it
           gets scanned by the wallet, updating it to confirmed. */
        Globals.wallet.on('createdtx', () => {
            this.updateTransactions();
        });
    }

    updateTransactions() {
        /* Don't display fusions */
        const transactions = Globals.wallet.getTransactions().filter((x) => x.totalAmount() !== 0);

        this.setState({
            numTransactions: transactions.length,
            transactions,
        });
    }

    tick() {
        const numTransactions = Globals.wallet.getNumTransactions();

        /* If we have no transactions, update the heights, to display the
           not sent / not synced msg */
        if (numTransactions === 0) {
            const [walletHeight, localHeight, networkHeight] = Globals.wallet.getSyncStatus();

            this.setState({
                walletHeight,
                networkHeight,
            });
        }
    }

    componentDidMount() {
        this.interval = setInterval(() => this.tick(), 10000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }
    
    render() {

        const syncedMsg = this.state.walletHeight + 10 >= this.state.networkHeight ? 
            '' 
          : "\nYour wallet isn't fully synced. If you're expecting some transactions, please wait.";

        const noTransactions = 
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: this.props.screenProps.theme.backgroundColour }}>
                <Text style={{ fontSize: 20, color: this.props.screenProps.theme.primaryColour, justifyContent: 'center', textAlign: 'center' }}>
                    Looks like you haven't sent{"\n"}or received any transactions yet!{"\n"}
                    {syncedMsg}
                </Text>
            </View>;

        return(
            this.state.numTransactions === 0 ? noTransactions : <TransactionList {...this.props} transactions={this.state.transactions}/>
        );
    }
}

class TransactionList extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            index: 0,
        }
    }

    getIconName(transaction) {
        if (transaction.totalAmount() >= 0) {
            return 'ios-arrow-dropleft';
        }

        return 'ios-arrow-dropright';
    }

    getIconColour(transaction) {
        if (transaction.totalAmount() >= 0) {
            /* Intentionally using the TurtleCoin green here, instead of the
               theme colour - we want green/red, not to change based on theme */
            return '#40C18E';
        }

        return 'red';
    }

    /* Dumb hack because the flatlist won't re-render when we change the theme
       otherwise */
    componentWillReceiveProps(nextProps) {
        this.setState(prevState => ({
            index: prevState.index + 1,
        }));
    }

    render() {
        return(
            <View style={{
                backgroundColor: this.props.screenProps.theme.backgroundColour,
                flex: 1,
            }}>
                <List style={{
                    backgroundColor: this.props.screenProps.theme.backgroundColour,
                }}>
                    <FlatList
                        extraData={this.state.index}
                        data={this.props.transactions}
                        keyExtractor={item => item.hash}
                        renderItem={({item}) => (
                            <ListItem
                                title={prettyPrintAmount(Math.abs(item.totalAmount()) - (item.totalAmount() > 0 ? 0 : item.fee))}
                                subtitle={item.timestamp === 0 ? 'Processing at ' + prettyPrintDate() : 'Completed on ' + prettyPrintUnixTimestamp(item.timestamp)}
                                leftIcon={
                                    <View style={{width: 30, alignItems: 'center', justifyContent: 'center', marginRight: 10}}>
                                        <Ionicons name={this.getIconName(item)} size={30} color={this.getIconColour(item)}/>
                                    </View>
                                }
                                titleStyle={{
                                    color: this.props.screenProps.theme.slightlyMoreVisibleColour,
                                }}
                                subtitleStyle={{
                                    color: this.props.screenProps.theme.slightlyMoreVisibleColour,
                                }}
                                onPress={() => this.props.navigation.navigate('TransactionDetails', { transaction: item })}
                            />
                        )}
                    />
                </List>
            </View>
        )
    }
}
