const checkSoutien = require('../../utils/check/soutien')
const checkMute = require('../../utils/check/mute')
const checkCounter = require('../../utils/check/counter')
const GiveawaysManager = require("../../utils/Giveaway/Manager");
module.exports = async (oneforall) => {
    await oneforall.functions.sleep(500)
    console.log(`${oneforall.user.username} is ready`);
    for await(const guild of oneforall.guilds.cache.filter(guild => guild.me?.permissions.has('MANAGE_GUILD', true)).values()){
        oneforall.cachedInv.set(guild.id, (await guild.invites.fetch()))
    }
    await checkSoutien(oneforall)
    await checkMute(oneforall)
    await checkCounter(oneforall)
    oneforall.giveawaysManager = new GiveawaysManager(oneforall, {
        updateCountdownEvery: 5000,
        hasGuildMembersIntent: true,
        default: {
            botsCanWin: false,
            exemptPermissions: ['MANAGE_MESSAGES', 'ADMINISTRATOR'],
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
