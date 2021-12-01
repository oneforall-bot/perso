const {MessageSelectMenu, MessageActionRow} = require("discord.js");
module.exports = {
    data: {
        name: 'group',
        description: 'Manage the groups system',
        options: [
            {
                type: 'SUB_COMMAND',
                name: 'create',
                description: 'Create or edit a new group'
            },
            {
                type: 'SUB_COMMAND',
                name: 'list',
                description: 'List all the groups'
            },
            {
                type: 'SUB_COMMAND',
                name: 'delete',
                description: 'Delete a group',
                options: [
                    {
                        type: 'STRING',
                        name: 'name',
                        description: 'The name of the group to delete',
                        required: true
                    }
                ]
            }
        ]
    },
    ownersOnly: true,
    run: async (oneforall, interaction, memberData, guildData) => {
        const subCommand = interaction.options.getSubcommand()
        if(subCommand === 'list'){
            interaction.reply({
                embeds: [
                    {
                        title: `Liste des groupes`,
                        description: [...oneforall.managers.groupsManager.keys()].filter(g => g.startsWith(interaction.guild.id)).map(g => `\`${g.split("-")[1]}\``).join("\n\n")
                    }
                ]
            })
        }
        if(subCommand === 'create'){
            interaction.reply({
                embeds: [
                    {
                        title: `Liste des groupes`,
                        description: [...oneforall.managers.groupsManager.keys()].filter(g => g.startsWith(interaction.guild.id)).map(g => `\`${g.split("-")[1]}\``).join("\n\n")
                    }
                ]
            })
            await createOrEditGroup(oneforall, interaction, guildData, memberData);
            function changePermissions(message, defaultMessage, memberData, roleData) {
                return new Promise((resolve) => {
                    const enumPermissions = memberData.permissionManager.enumPermissions;
                    const allowPermissions = Object.keys(enumPermissions.permissions).filter(k => roleData.permissions.includes(k));
                    const denyPermissions = Object.keys(enumPermissions.permissions).filter(k => !roleData.permissions.includes(k));

                    const components = [];

                    const defaultDenyOptions = denyPermissions.map(v => {
                        const p = enumPermissions.permissions[v];
                        return {
                            emoji: p.emoji,
                            label: p.label,
                            description: p.description,
                            value: v
                        }
                    })

                    const defaultAllowOptions = allowPermissions.map(v => {
                        const p = enumPermissions.permissions[v];
                        return {
                            emoji: p.emoji,
                            label: p.label,
                            description: p.description,
                            value: v
                        }
                    })
                    if (denyPermissions.length > 0)
                        components.push(new MessageSelectMenu({
                            customId: `group.edit.add.${message.id}`,
                            placeholder: `Ajouté des permissions.`,
                            maxValues: denyPermissions.length <= 25 ?  denyPermissions.length : 25,
                            options: defaultDenyOptions
                        }))
                    if (allowPermissions.length > 0)
                        components.push(new MessageSelectMenu({
                            customId: `group.edit.remove.${message.id}`,
                            placeholder: `Retiré des permissions.`,
                            maxValues: allowPermissions.length <= 25 ?  allowPermissions.length : 25,
                            options: defaultAllowOptions
                        }))

                    let pageDeny = 0;
                    let pageAllow = 0;
                    const maxValues = 24;
                    let totalPageDeny = Math.ceil(denyPermissions.length / maxValues)
                    let slicerIndicatorMinDeny = 0
                    let slicerIndicatorMaxDeny = 24
                    let totalPageAllow = Math.ceil(allowPermissions.length / maxValues)
                    let slicerIndicatorMinAllow = 0
                    let slicerIndicatorMaxAllow = 24
                    if (denyPermissions.length > 25) {
                        components[0].spliceOptions(0, denyPermissions.length, [...defaultDenyOptions.slice(0, 24), {
                            value: 'next',
                            description: 'See more permissions',
                            label: 'Next',
                            emoji: '➡️'
                        }])
                    }
                    if (allowPermissions.length > 25) {
                        components[1].spliceOptions(0, allowPermissions.length, [...defaultAllowOptions.slice(0, 24), {
                            value: 'next',
                            description: 'See more permissions',
                            label: 'Next',
                            emoji: '➡️'
                        }])
                    }
                    function updateOptions(interaction, componentIndex) {
                        components[componentIndex].spliceOptions(0, components[componentIndex].options.length, componentIndex === 0 ? [...defaultDenyOptions.slice(slicerIndicatorMinDeny, slicerIndicatorMaxDeny), {
                            value: pageDeny < 1 ? 'next' : "prev",
                            description: 'See more permissions',
                            label: pageDeny < 1 ? 'next' : "prev",
                            emoji: pageDeny < 1 ? '➡️' : '◀️'
                        }] : [...defaultAllowOptions.slice(slicerIndicatorMinAllow,  slicerIndicatorMaxAllow), {
                            value: pageAllow < 1 ? 'next' : "prev",
                            description: 'See more permissions',
                            label: pageAllow < 1 ? 'next' : "prev",
                            emoji: pageAllow < 1 ? '➡️' : '◀️'
                        }])
                        components[componentIndex].setMaxValues(components[componentIndex].options.length)
                        return interaction.update({components: components.map(c => new MessageActionRow({components: [c]}))})
                    }

                    defaultMessage.edit({
                        embeds: [
                            {
                                description: `D'accord, voici le groupe que vous modifié: \`${roleData.groupName}\` \n\n Maintenant, je vous demande de choisir les permissions du groupe. \n\n Permissions actuellement acordé: \n\n ${allowPermissions.length > 0 ? allowPermissions.map(v => `\`${v}\` (*${enumPermissions.permissions[v].description}*)`).join('\n') : `\`Aucune permissions\``}`,
                            }
                        ],
                        components: components.map(c => new MessageActionRow({components: [c]}))
                    });
                    const collector = message.channel.createMessageComponentCollector({
                        filter: interaction => [`group.edit.add.${message.id}`, `group.edit.remove.${message.id}`].includes(interaction.customId) && interaction.user.id === message.user.id,
                        time: 60 * 1000
                    })
                    collector.on('collect', async interaction => {
                        if (interaction.values[0] === 'next') {
                            interaction.customId === `group.edit.remove.${message.id}` ? pageAllow = pageAllow !== totalPageAllow - 1 ? pageAllow + 1 : pageAllow = 0 : pageDeny = pageDeny !== totalPageDeny - 1 ? pageDeny + 1 : pageDeny = 0
                            interaction.customId === `group.edit.remove.${message.id}` ?  slicerIndicatorMinAllow += maxValues : slicerIndicatorMinDeny += maxValues
                            interaction.customId === `group.edit.remove.${message.id}` ?  slicerIndicatorMaxAllow += maxValues : slicerIndicatorMaxDeny += maxValues

                            return updateOptions(interaction, interaction.customId === `group.edit.remove.${message.id}` ? 1 : 0)
                        }
                        if (interaction.values[0] === 'prev') {
                            interaction.customId === `group.edit.remove.${message.id}` ? pageAllow = pageAllow === 0 ? pageAllow = totalPageAllow - 1 : pageAllow <= totalPageAllow - 1 ? pageDeny -= 1 : pageDeny += 1 :pageDeny = pageDeny === 0 ? pageDeny = totalPageDeny - 1 : pageDeny <= totalPageDeny - 1 ? pageDeny -= 1 : pageDeny += 1
                            interaction.customId === `group.edit.remove.${message.id}` ?  slicerIndicatorMinAllow -= maxValues : slicerIndicatorMinDeny -= maxValues
                            interaction.customId === `group.edit.remove.${message.id}` ?  slicerIndicatorMaxAllow -= maxValues : slicerIndicatorMaxDeny -= maxValues
                            return updateOptions(interaction, interaction.customId === `group.edit.remove.${message.id}` ? 1 : 0)

                        }
                        switch (interaction.customId) {
                            case `group.edit.remove.${message.id}`:
                                roleData.permissions = roleData.permissions.filter(p => !interaction.values.includes(p));
                                break;
                            default:
                                roleData.permissions.push(...interaction.values);
                        }
                        await interaction.deferUpdate()
                        collector.stop()
                        changePermissions(message, defaultMessage, memberData, roleData).then(resolve).catch(() => {
                        });
                    })

                    defaultMessage.awaitReactions({
                        filter: (reaction, user) => reaction.emoji.name === "✅" && user.id === message.user.id,
                        time: 60 * 1000,
                        max: 1
                    })
                        .then(() => {
                            resolve();
                        })
                })
            }


            async function createOrEditGroup(oneforall, message, guildData, memberData) {
                const defaultMessage = await message.channel.send({
                    embeds: [
                        {
                            description: "Pouvez vous écrire le nom du groupe ?"
                        }
                    ]
                });

                message.channel.awaitMessages({
                    filter: m => m.author.id === message.user.id,
                    max: 1,
                    time: 30000,
                    errors: ['time']
                }).then(collected => {
                    const messageGroupId = collected.first();
                    const groupName = messageGroupId.content;

                    const roleData = oneforall.managers.groupsManager.getAndCreateIfNotExists(`${message.guild.id}-${groupName}`, {
                        guildId: message.guild.id,
                        groupName,
                        permissions: []
                    });


                    messageGroupId.delete();
                    defaultMessage.react("✅");


                    changePermissions(message, defaultMessage, memberData, roleData).then(() => {
                        roleData.permissions = roleData.permissions.filter(p => Object.keys(memberData.permissionManager.enumPermissions.permissions).includes(p));
                        defaultMessage.reactions.removeAll();
                        defaultMessage.edit({
                            embeds: [
                                {
                                    description: `Le groupe \`${groupName}\` viens d'etre modifié avec succès. \n\n Voici les permissions du groupe: \n\n ${roleData.permissions.length > 0 ? roleData.permissions.map(k => `\`${k}\` (*${memberData.permissionManager.enumPermissions.permissions[k].description}*)`).join("\n") : `\`Aucune permissions\``}`
                                }
                            ],
                            components: []
                        }).catch(e => console.log(e))
                        roleData.save();
                    }).catch(() => {
                    })
                }).catch(() => {
                });
            }
        }
        if(subCommand === 'delete'){
            const groupName = interaction.options.getString('name')
            const group = oneforall.managers.groupsManager.getIfExist(`${interaction.guildId}-${groupName}`)
            if(!group) return interaction.reply({content: 'Le groupe existe pas !', ephemeral: true})
            group.delete()
            interaction.reply({content: 'Le groupe est supprimé'})
        }


    }
}

