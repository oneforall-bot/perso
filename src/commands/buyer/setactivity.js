const { Message, Collection } = require('discord.js')
const OneForAll = require('../../structures/OneForAll')
module.exports = {
    name: "setactivity",
    aliases: ["setactivity"],
    description: "Change the avatar of the bot perso | Changer l'avatar du bot perso",
    usage: "setactivity <streaming/wathing/playing> <name>",
    clientPermissions: ['SEND_MESSAGES'],
    ofaPerms: [],
    ownersOnly: true,
    cooldown: 1500,
    /**
    * 
    * @param {OneForAll} oneforall
    * @param {Message} message 
    * @param {Collection} memberData 
    * @param {Collection} guildData 
    * @param {[]} args
    */
    run: async (oneforall, message, guildData, memberData, args) => {
        const types=  ['steaming', 'playing', 'watching']
        if(!types.includes(args[0].toLowerCase())) return message.channel.send('Missing type')
        const activityName = args.slice(1).join(" ");

        const activities = [{
            name: activityName,
            type: args[0].toLowerCase(),
            url: 'https://www.twitch.tv/discord'
        }]
        oneforall._fetch(`http://localhost:5006/api/client/${oneforall.config.client}/${oneforall.user.id}`, {
            method: 'patch',
            body: JSON.stringify({ activity: activities }),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'cabe1ba8-9561-48fc-ab2c-dd9e856d57cf'
            }
        })
        oneforall.user.setPresence({status: 'online', activities})
    }
}