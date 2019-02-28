// Copyright (C) 2018, Zpalmtree
//
// Please see the included LICENSE file for more information.

import moment from 'moment';

export class Logger {
    constructor() {
        this.logs = [];
        this.MAX_LOG_SIZE = 1000;
    }

    addLogMessage(message) {
        this.logs.push(`[${moment().format('HH:mm:ss')}]: ${message}`);

        if (this.logs.length > this.MAX_LOG_SIZE) {
            this.logs.shift();
        }
    }

    getLogs() {
        return this.logs;
    }
}
