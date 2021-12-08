const {MessageActionRow, MessageButton} = require("discord.js");
module.exports = {
    data: {
        name: 'client',
        description: 'Manage the client settings',
        options: [
            {
                type: 'SUB_COMMAND_GROUP',
                name: 'owner',
                description: 'Manage the owner of the bot',
                options: [
                    {
                        type: 'SUB_COMMAND',
                        name: 'add',
                        description: 'Add a owner',
                        options: [
                            {
                                type: 'USER',
                                name: 'owner',
                                description: 'The owner to add',
                                required: true
                            }
                        ]
                    },
                    {
                        type: 'SUB_COMMAND',
                        name: 'remove',
                        description: 'Remove a owner',
                        options: [
                            {
                                type: 'USER',
                                name: 'owner',
                                description: 'The owner to remove',
                                required: true
                            }
                        ]
                    },
                    {
                        type: 'SUB_COMMAND',
                        name: 'list',
                        description: 'List the owners',
                    }
                ]

            },
            {
                name: 'guild',
                type: 'SUB_COMMAND_GROUP',
                description: 'Managed the allowed guilds',
                options: [
                    {
                        type: 'SUB_COMMAND',
                        name: 'add',
                        description: 'Add a guild to the authorized guilds list',
                        options: [
                            {
                                type: 'STRING',
                                name: 'guild',
                                description: 'The id guild of the guild to authorized',
                                required: true
                            }
                        ]
                    },
                    {
                        type: 'SUB_COMMAND',
                        name: 'remove',
                        description: 'Remove a guild to the authorized guilds list',
                        options: [
                            {
                                type: 'STRING',
                                name: 'guild',
                                description: 'The id guild of the guild to unauthorized',
                                required: true
                            }
                        ]
                    },
                    {
                        type: 'SUB_COMMAND',
                        name: 'list',
                        description: 'Show the authorized guilds list',
                    }
                ]
            }
        ]
    },
    run: async (ftSecurity, interaction, memberData, guildData) => {
        if (!ftSecurity.isOwner(interaction.user.id)) return
        await interaction.deferReply({ephemeral: true})
        const {options} = interaction
        const owner = options.getUser('owner')
        const guild = options.getString('guild')
        const subCommand = options.getSubcommand()
        const subCommandGroup = options.getSubcommandGroup()
        if (subCommandGroup === 'owner') {
            if (subCommand === 'list') {
                const owners = ftSecurity.config.owners
                const ownerEmbed = {
                    title: `List of owners (${owners.length})`,
                    timestamp: new Date(),
                    color: '#36393F',
                    footer: {
                        text: 'Page 1/1',
                        icon_url: interaction.user.displayAvatarURL({dynamic: true}) || ''
                    }
                }
                let maxPerPage = 10
                if (owners.length > maxPerPage) {
                    let page = 0,
                        slicerIndicatorMin = 0,
                        slicerIndicatorMax = 10,
                        totalPage = Math.ceil(owners.length / maxPerPage)

                    const embedPageChanger = (page) => {
                        ownerEmbed.description = owners.map((x, i) => `${i + 1} - <@${x}>`).slice(slicerIndicatorMin, slicerIndicatorMax).join('\n')
                        ownerEmbed.footer.text = `Page ${page + 1} / ${totalPage}`
                        return ownerEmbed
                    }
                    const row = new MessageActionRow().addComponents(
                        new MessageButton()
                            .setCustomId(`left.${interaction.id}`)
                            .setEmoji('◀️')
                            .setStyle('SECONDARY')
                    ).addComponents(
                        new MessageButton()
                            .setCustomId(`cancel.${interaction.id}`)
                            .setEmoji('❌')
                            .setStyle('SECONDARY')
                    ).addComponents(
                        new MessageButton()
                            .setCustomId(`right.${interaction.id}`)
                            .setEmoji('➡️')
                            .setStyle('SECONDARY')
                    )
                    const componentFilter = {
                        filter: interactionChanger => interactionChanger.customId.includes(interaction.id) && interactionChanger.user.id === interaction.user.id,
                        time: 900000
                    }
                    await interaction.editReply({content: null, embeds: [embedPageChanger(page)], components: [row]})
                    const collector = interaction.channel.createMessageComponentCollector(componentFilter)
                    collector.on('collect', async (interactionChanger) => {
                        await interactionChanger.deferUpdate()
                        const selectedButton = interactionChanger.customId.split('.')[0]
                        if (selectedButton === 'left') {
                            page = page === 0 ? page = totalPage - 1 : page <= totalPage - 1 ? page -= 1 : page += 1
                            slicerIndicatorMin -= maxPerPage
                            slicerIndicatorMax -= maxPerPage
                        }
                        if (selectedButton === 'right') {
                            page = page !== totalPage - 1 ? page += 1 : page = 0
                            slicerIndicatorMin += maxPerPage
                            slicerIndicatorMax += maxPerPage

                        }
                        if (selectedButton === 'cancel') {
                            return collector.stop()
                        }
                        if (slicerIndicatorMax < 0 || slicerIndicatorMin < 0) {
                            slicerIndicatorMin += maxPerPage * totalPage
                            slicerIndicatorMax += maxPerPage * totalPage
                        } else if ((slicerIndicatorMax >= maxPerPage * totalPage || slicerIndicatorMin >= maxPerPage * totalPage) && page === 0) {
                            slicerIndicatorMin = 0
                            slicerIndicatorMax = maxPerPage
                        }
                        await interaction.editReply({
                            embeds: [embedPageChanger(page)]
                        })
                    })
                    collector.on('end', () => {
                        interaction.editReply({embeds: [embedPageChanger(page)], components: []})
                    })
                } else {
                    ownerEmbed.description = owners.map((x, i) => `${i + 1} - <@${x}>`).join('\n')
                    await interaction.editReply({embeds: [ownerEmbed]})
                }
            } else {
                if (interaction.user.id === owner.id) return interaction.editReply({
                    content: 'Can remove or add client',
                    ephemeral: true
                })
                if (subCommand === 'add' ? ftSecurity.config.owners.includes(owner.id) : !ftSecurity.config.owners.includes(owner.id)) return interaction.editReply({
                    content: subCommand === 'add' ? 'User already is owner' : 'User is not owner',
                    ephemeral: true
                })
                const tempOwner = subCommand === 'add' ? [...ftSecurity.config.owners, owner.id] : ftSecurity.config.owners.filter(x => x !== owner.id)
                ftSecurity._fetch(`http://localhost:5006/api/client/${ftSecurity.config.client}/${ftSecurity.user.id}`, {
                    method: 'patch',
                    body: JSON.stringify({owners: tempOwner}),
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'cabe1ba8-9561-48fc-ab2c-dd9e856d57cf'
                    }
                }).then(() => {
                })
                interaction.editReply({ephemeral: true, content: 'Owner list changed successfully'})


            }
        }
        if (subCommandGroup === 'guild') {
            if (subCommand === 'list') {
                const guilds = ftSecurity.config.guildIds
                const guildsEmbed = {
                    title: `List of guilds (${guilds.length})`,
                    timestamp: new Date(),
                    color: '#36393F',
                    footer: {
                        text: 'Page 1/1',
                        icon_url: interaction.user.displayAvatarURL({dynamic: true}) || ''
                    }
                }
                let maxPerPage = 10
                if (guilds.length > maxPerPage) {
                    let page = 0,
                        slicerIndicatorMin = 0,
                        slicerIndicatorMax = 10,
                        totalPage = Math.ceil(guilds.length / maxPerPage)

                    const embedPageChanger = (page) => {
                        guildsEmbed.description = guilds.map((x, i) => `${i + 1} - ${ftSecurity.guilds.cache.get(x)?.name || x}`).slice(slicerIndicatorMin, slicerIndicatorMax).join('\n')
                        guildsEmbed.footer.text = `Page ${page + 1} / ${totalPage}`
                        return guildsEmbed
                    }
                    const row = new MessageActionRow().addComponents(
                        new MessageButton()
                            .setCustomId(`left.${interaction.id}`)
                            .setEmoji('◀️')
                            .setStyle('SECONDARY')
                    ).addComponents(
                        new MessageButton()
                            .setCustomId(`cancel.${interaction.id}`)
                            .setEmoji('❌')
                            .setStyle('SECONDARY')
                    ).addComponents(
                        new MessageButton()
                            .setCustomId(`right.${interaction.id}`)
                            .setEmoji('➡️')
                            .setStyle('SECONDARY')
                    )
                    const componentFilter = {
                        filter: interactionChanger => interactionChanger.customId.includes(interaction.id) && interactionChanger.user.id === interaction.user.id,
                        time: 900000
                    }
                    await interaction.editReply({content: null, embeds: [embedPageChanger(page)], components: [row]})
                    const collector = interaction.channel.createMessageComponentCollector(componentFilter)
                    collector.on('collect', async (interactionChanger) => {
                        await interactionChanger.deferUpdate()
                        const selectedButton = interactionChanger.customId.split('.')[0]
                        if (selectedButton === 'left') {
                            page = page === 0 ? page = totalPage - 1 : page <= totalPage - 1 ? page -= 1 : page += 1
                            slicerIndicatorMin -= maxPerPage
                            slicerIndicatorMax -= maxPerPage
                        }
                        if (selectedButton === 'right') {
                            page = page !== totalPage - 1 ? page += 1 : page = 0
                            slicerIndicatorMin += maxPerPage
                            slicerIndicatorMax += maxPerPage

                        }
                        if (selectedButton === 'cancel') {
                            return collector.stop()
                        }
                        if (slicerIndicatorMax < 0 || slicerIndicatorMin < 0) {
                            slicerIndicatorMin += maxPerPage * totalPage
                            slicerIndicatorMax += maxPerPage * totalPage
                        } else if ((slicerIndicatorMax >= maxPerPage * totalPage || slicerIndicatorMin >= maxPerPage * totalPage) && page === 0) {
                            slicerIndicatorMin = 0
                            slicerIndicatorMax = maxPerPage
                        }
                        await interaction.editReply({
                            embeds: [embedPageChanger(page)]
                        })
                    })
                    collector.on('end', () => {
                        interaction.editReply({embeds: [embedPageChanger(page)], components: []})
                    })
                } else {
                    guildsEmbed.description = guilds.map((x, i) => `${i + 1} - ${ftSecurity.guilds.cache.get(x)?.name || x}`).join('\n')
                    await interaction.editReply({embeds: [guildsEmbed]})
                }
            } else {

                const tempGuild = subCommand === 'add' ? [...ftSecurity.config.guildIds, guild] : ftSecurity.config.guildIds.filter(x => x !== guild)
                ftSecurity._fetch(`http://localhost:5006/api/client/${ftSecurity.config.client}/${ftSecurity.user.id}`, {
                    method: 'patch',
                    body: JSON.stringify({guildIds: tempGuild}),
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'cabe1ba8-9561-48fc-ab2c-dd9e856d57cf'
                    }
                }).then(() => {
                })
                if(subCommand === 'remove'){
                    ftSecurity.guilds.cache.get(guild)?.leave()
                }
                await interaction.editReply({ephemeral: true, content: 'Guild list changed successfully'})
            }
        }
    }
}
