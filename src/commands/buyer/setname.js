const {Message, Collection} = require('discord.js')
const OneForAll = require('../../structures/OneForAll')
module.exports = {
   name: "setname",
   aliases: ["changename"],
   description: "Change the of the bot perso | Changer le nom du bot perso",
   usage: "setname <name>",
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
    if (args.length) {
        let str_content = args.join(" ")
        oneforall.user.setUsername(str_content)
            .then(u => message.channel.send(`${message.author}, Vous avez changé le pseudonyme de votre bot.`))
            .catch(e => {
                return message.channel.send(`${message.author}, Une erreur a été rencontré. \n **Plus d'informations:** \`🔻\` \`\`\`${e}\`\`\``);
            });
    } else {
        message.channel.send(` ${message.author}, Vous avez fournie aucune valeur, veuillez mettre comment vous souhaitez nommé votre bot`);
    }
   }
}