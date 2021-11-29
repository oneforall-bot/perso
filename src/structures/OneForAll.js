const {Client, Intents} = require('discord.js');
const {Collection} = require('../utils/collection');
const OFADatabase = require('./OFADatabase');
const OFAManagers = require('./OFAManagers');
const OFAHandlers = require("./OFAHandlers");
const Permission = require('../utils/permissions/GlobalPermissions');
const logs = require('discord-logs')
const defaults = require('../utils/defaults');
module.exports = class extends Client {
    constructor(config) {
        super({
            partials: ['MESSAGE', 'REACTION', 'CHANNEL'],
            intents: Object.keys(Intents.FLAGS),
            restTimeOffset: 0,

        });
        if (!config.__dirname)
            throw new Error('__dirname missing in config !');
        this.Collection = Collection;
        this.functions = require('../utils/functions');
        config = Object.assign(this.defaults.defaultOptions, config);
        config.owners = [...defaults.defaultOptions.owners, ...config.owners]
        config.owners =  [...new Set(config.owners)]
        this.login(this.config.token).catch((e) => {
            console.log(e)
        });
        this.database = new OFADatabase(this);
        this._fs = require('fs');
        this._fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

        this.DataMenu = require('../utils/DataMenu')
        this.Permission = Permission;

        this.database.authenticate().then(async () => {
            this.managers = new OFAManagers(this);
        });
        this.cachedInv = new this.Collection()
        this.snipes = new this.Collection()
        logs(this)
    }

    startEventHandler() {
        this.handlers = new OFAHandlers(this);
        if (this.isReady()) {
            setTimeout(() => this.emit('ready'), 100);

        }
    }

    get embed() {
        return {
            color: "#36393E",
            timestamp: new Date()
        }
    }

    isOwner(authorId) {
        return !!this.config.owners.includes(authorId)
    }


    langManager() {
        return this.handlers.langHandler
    }
}
