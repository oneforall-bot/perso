const checkSoutien = require('../../utils/check/soutien')
const checkMute = require('../../utils/check/mute')
const GiveawaysManager = require("../../utils/Giveaway/Manager");
module.exports = async (ftSecurity) => {
    console.log(`FTSecurity is ready`);
    await checkSoutien(ftSecurity)
    await checkMute(ftSecurity)
    console.log(ftSecurity.user.username)
    ftSecurity.giveawaysManager = new GiveawaysManager(ftSecurity, {
        updateCountdownEvery: 5000,
        hasGuildMembersIntent: true,
        default: {
            botsCanWin: false,
            // exemptPermissions: ['MANAGE_MESSAGES', 'ADMINISTRATOR'],
            embedColor: "#36393F",
            embedColorEnd: "#36393F",
            reaction: '🎉',
            lastChance: {
                enabled: true,
                content: ' **LAST CHANCE TO ENTER !**️',
                threshold: 5000,
                embedColor: '#FF0000'
            }
        }
    })

}
