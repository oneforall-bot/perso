const { Message, Collection } = require('discord.js')
const OneForAll = require('../../structures/OneForAll')
module.exports = {
    name: "owner",
    aliases: [],
    description: "Add, remove, list the guild owners | Ajouter, enlever ou lister les owners du serveur",
    usage: "owner <add/remove/list> [member]",
    clientPermissions: ['SEND_MESSAGES', "EMBED_LINKS"],
    ownersOnly: true,
    cooldown: 0,
    /**
    * 
    * @param {OneForAll} oneforall
    * @param {Message} message 
    * @param {Collection} memberData 
    * @param {Collection} guildData 
    * @param {[]} args
    */
    run: async (oneforall, message, guildData, memberData, args) => {
        const subCommand = args[0]
        const lang = guildData.langManager
        const user = args[1] ? (await oneforall.users.fetch(args[1]).catch(() => { })) || message.mentions.users.first() : undefined
        if (subCommand === 'add') {
            const isOwner = oneforall.config.owners.includes(user.id)
            if (isOwner) return oneforall.functions.tempMessage(message, lang.owners.add.alreadyOwner)
            oneforall.config.owners.push(user.id)
            ftSecurity._fetch(`http://localhost:5006/api/client/${ftSecurity.config.client}/${ftSecurity.user.id}`, {
                method: 'patch',
                body: JSON.stringify({ owners: oneforall.config.owners }),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'cabe1ba8-9561-48fc-ab2c-dd9e856d57cf'
                }
            }).then(() => {
            })
            oneforall.functions.tempMessage(message, lang.owners.add.success(user.toString()))

        }
        if (subCommand === 'remove') {
            const isOwner = oneforall.config.owners.includes(user.id)
            if (!isOwner) return oneforall.functions.tempMessage(message, lang.owners.remove.notOwner)
            oneforall.config.owners = oneforall.config.owners.filter(id => id !== user.id)
            ftSecurity._fetch(`http://localhost:5006/api/client/${ftSecurity.config.client}/${ftSecurity.user.id}`, {
                method: 'patch',
                body: JSON.stringify({ owners: oneforall.config.owners }),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'cabe1ba8-9561-48fc-ab2c-dd9e856d57cf'
                }
            }).then(() => {
            })
            oneforall.functions.tempMessage(message, lang.owners.remove.success(user.toString()))


        }

        if (subCommand === 'list') {
            const embedChange = (page, slicerIndicatorMin, slicerIndicatorMax, totalPage) => {
                return {
                    ...oneforall.embed(guildData),
                    title: `Owner list (${oneforall.config.owners.length})`,
                    footer: {
                        text: `Owner Page ${page + 1}/${totalPage || 1}`
                    },
                    description: oneforall.config.owners.map((id, i) => `${i + 1} - <@${id}>`).slice(slicerIndicatorMin, slicerIndicatorMax).join('\n') || 'No data'
                }
            }
            await new oneforall.DataMenu(oneforall.config.owners, embedChange, message, oneforall).sendEmbed()
        }
    }
}
