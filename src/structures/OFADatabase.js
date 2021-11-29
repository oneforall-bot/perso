const {Sequelize, DataTypes} = require('sequelize');

class OFADatabase extends Sequelize {
    constructor(oneforall) {
        super({
            dialect: 'sqlite',
            storage: `${oneforall.config.__dirname}/OneForAll_${oneforall.config.client}.db`,
            logging: false
        });
        this.DataTypes = DataTypes;
    }

    authenticate(options) {
        return new Promise((resolve, reject) => {
            try {
                super.authenticate(options).then(resolve).catch(reject);
            }catch (err) {
                reject(err);
            }
        })
    }
}

module.exports = OFADatabase;
