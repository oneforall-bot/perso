const { Message, Collection } = require('discord.js')
const OneForAll = require('../../structures/OneForAll')
module.exports = {
    name: "setavatar",
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
        
        const activityName = args.slice(1).join(" ");
        if (args[0].toLowerCase() === "streaming") {
            oneforall.user.setPresence({
                activity: {
                    name: activityName,
                    type: 'STREAMING',
                    url: "https://www.twitch.tv/discord"
                }
            })
                .then(p => message.channel.send(`${message.author}, Vous avez définis le statut de votre bot en \`${activityName.replace("streaming", " ")}\`.`))
                .catch(e => {
                    return message.channel.send(`${message.author}, Une erreur a été rencontré. \n **Plus d'informations:** \`🔻\` \`\`\`${e}\`\`\``);
                });


        } else if (args[0].toLowerCase() === "playing") {
            oneforall.user.setPresence({activity: {name: activityName, type: 'PLAYING'}})
                .then(p => message.channel.send(`${message.author}, Vous avez définis le statut de votre bot en \`${activityName.replace("playing", " ")}\`.`))
                .catch(e => {
                    return message.channel.send(`${message.author}, Une erreur a été rencontré. \n **Plus d'informations:** \`🔻\` \`\`\`${e}\`\`\``);
                });
        } else if (args[0] === "watching") {
            oneforall.user.setPresence({activity: {name: activityName, type: 'WATCHING'}})
                .then(p => message.channel.send(`${message.author}, Vous avez définis le statut de votre bot en \`${activityName.replace("watching", " ")}\`.`))
                .catch(e => {
                    return message.channel.send(`${message.author}, Une erreur a été rencontré. \n **Plus d'informations:** \`🔻\` \`\`\`${e}\`\`\``);
                });
        } else if (!args[0]) {
            message.channel.send(`${message.author}, Vous avez fournie aucune valeur pour l'activité`);

        } else if (args[0] && !args[1]) {
            message.channel.send(`${message.author}, Vous avez fournie aucune valeur pour le nom de l'activié`);

        }
    }
}