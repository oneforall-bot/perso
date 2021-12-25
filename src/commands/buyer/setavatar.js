const { Message, Collection } = require('discord.js')
const OneForAll = require('../../structures/OneForAll')
module.exports = {
    name: "setavatar",
    aliases: ["changeavatar"],
    description: "Change the avatar of the bot perso | Changer l'avatar du bot perso",
    usage: "setavatar <avatar>",
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
        if (message.attachments.size > 0) {
            message.attachments.forEach(attachment => {
                oneforall.user.setAvatar(attachment.url)
                    .then(u => message.channel.send(`${message.author}, Vous avez changé la photo de profil de votre bot.`))
                    .catch(e => {
                        return message.channel.send(`${message.author}, Une erreur a été rencontré. \n **Plus d'informations:** \`🔻\` \`\`\`${e}\`\`\``);
                    });
            });
        } else if (args.length) {
            let str_content = args.slice(0).join(" ")
            oneforall.user.setAvatar(str_content)
                .then(u => message.channel.send(` ${message.author}, Vous avez changé la photo de profil de votre bot.`))
                .catch(e => {
                    return message.channel.send(`${message.author}, Une erreur a été rencontré. \n **Plus d'informations:** \`🔻\` \`\`\`${e}\`\`\``);
                });
        } else {
            message.channel.send(`${message.author}, Vous avez fournie aucune valeur, veuillez mettre sois une image sois un lien`);
        }
    }
}