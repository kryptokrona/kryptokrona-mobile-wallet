// Copyright (C) 2018, Zpalmtree
//
// Please see the included LICENSE file for more information.

const request = require('request-promise-native');

import Config from './Config';
import Constants from './Constants';

import { Globals } from './Globals';
import { loadPriceDataFromDatabase, savePriceDataToDatabase } from './Database';

export async function getCoinPrice() {
    if (Globals.coinPrice !== undefined) {
        return Globals.coinPrice;
    }

    /* Fetch from DB */
    Globals.coinPrice = await loadPriceDataFromDatabase();

    if (Globals.coinPrice !== undefined) {
        return Globals.coinPrice;
    }

    return {};
}

export async function getCoinPriceFromAPI() {
    /* Note: Coingecko has to support your coin for this to work */
    let uri = `${Config.priceApiLink}?ids=${Config.coinName.toLowerCase()}&vs_currencies=${getCurrencyTickers()}`;

    try {
        const data = await request({
            json: true,
            method: 'GET',
            timeout: Config.requestTimeout,
            url: uri,
        });

        const coinData = data[Config.coinName.toLowerCase()];

        savePriceDataToDatabase(coinData);

        return coinData;
    } catch (error) {
        console.log('Failed to get price from API: ' + error);

        return undefined;
    }
}

function getCurrencyTickers() {
    return Constants.currencies.map((currency) => currency.ticker).join('%2C');
}

export async function coinsToFiat(amount, currencyTicker) {
    /* Coingecko returns price with decimal places, not atomic */
    let nonAtomic = amount / (10 ** Config.decimalPlaces);

    let prices = await getCoinPrice();

    for (const currency of Constants.currencies) {
        if (currencyTicker === currency.ticker) {
            let converted = prices[currency.ticker] * nonAtomic;

            if (converted === undefined || isNaN(converted)) {
                return '';
            }

            let convertedString = converted.toString();

            /* Only show two decimal places if we've got more than '1' unit */
            if (converted > 1) {
                convertedString = converted.toFixed(2);
            } else {
                convertedString = converted.toFixed(8);
            }

            if (currency.symbolLocation === 'prefix') {
                return currency.symbol + convertedString;
            } else {
                return convertedString + ' ' + currency.symbol;
            }
        }
    }

    console.log('Failed to find currency: ' + currencyTicker);

    return '';
}
