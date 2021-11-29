const backup = require('../../utils/Backup/lib')
module.exports = {
    data: {
        name: 'backup',
        description: 'Manage backups',
        options: [
            {
                type: 'SUB_COMMAND',
                name: 'create',
                description: 'Create a backup',
                options: [
                    {
                        type: 'BOOLEAN',
                        name: 'roles',
                        description: 'Do you want to backup roles ?',
                        required: true
                    },
                    {
                        type: 'BOOLEAN',
                        name: 'channels',
                        description: 'Do you want to backup channels ?',
                        required: true
                    },
                    {
                        type: 'BOOLEAN',
                        name: 'emojis',
                        description: 'Do you want to backup emojis ?',
                        required: true
                    },
                    {
                        type: 'BOOLEAN',
                        name: 'bans',
                        description: 'Do you want to backup bans ?',
                        required: true
                    },
                ]
            },

            {
                name: 'delete',
                type: 'SUB_COMMAND',
                description: 'Delete a backup',
                options: [
                    {
                        type: 'STRING',
                        name: 'backup',
                        description: 'The id of the backup to delete',
                        required: true
                    }
                ]
            },
            {
                type: 'SUB_COMMAND',

                name: 'list',
                description: 'List all your backups'
            },
            {
                type: 'SUB_COMMAND',
                name: 'load',
                description: 'Load a backup on the server',
                options: [
                    {
                        type: 'STRING',
                        required: true,
                        name: 'backup',
                        description: 'The id of the backup to load'
                    }
                ]
            },
            {
                type: 'SUB_COMMAND',
                name: 'info',
                description: 'Info about a backup',
                options: [
                    {
                        type: 'STRING',
                        required: true,
                        name: 'backup',
                        description: 'The id of the backup to load'
                    }
                ]
            }
        ]
    },
    run: async (oneforall, interaction, memberData, guildData) => {
        const subCommand = interaction.options.getSubcommand()
        const {options} = interaction
        const lang = guildData.langManager
        const hasPermission = memberData.permissionManager.has("BACKUP_CMD");
        await interaction.deferReply({ephemeral: (!!!hasPermission)});
        if (!hasPermission)
            return interaction.editReply({
                content: lang.notEnoughPermissions('backup')
            });
        const userBackups = oneforall.managers.backupsManager.getAndCreateIfNotExists(interaction.user.id, {
            userId: interaction.user.id
        })
        if(subCommand === 'create') {
            const backupRoles = options.getBoolean('roles')
            const backupEmojis = options.getBoolean('emojis')
            const backupChannels = options.getBoolean('channels')
            const backupBans = options.getBoolean('bans')
            const doNotBackup = [!backupRoles ? "roles" : null, !backupEmojis ? "emojis" : null, !backupChannels ? "channels" : null, !backupBans ? "bans": null]
            backup.create(interaction.guild, {
                maxMessagesPerChannel: 0,
                jsonSave: false,
                jsonBeautify: true,
                doNotBackup
            }).then(backupData => {
                userBackups.backups.push(backupData)
                userBackups.save().then(() => {
                    interaction.editReply({content: lang.backup.create.success(backupData.id)})
                })
            })
        }
        if(subCommand === 'load'){
            const backupId = options.getString("backup")
            const backupData = userBackups.backups.find(backup => backup.id === backupId)
            if(!backupData) return interaction.editReply({content: lang.backup.backupNotFound})
            await backup.load(backupData, interaction.guild, {
                clearGuildBeforeRestore: true
            }).catch(() => {}).then(() => interaction.editReply({content: 'Backup loaded'}))
        }
        if(subCommand === 'delete'){
            const backupId = options.getString("backup")
            const backupData = userBackups.backups.find(backup => backup.id === backupId)
            if(!backupData) return interaction.editReply({content: lang.backup.backupNotFound})
            userBackups.backups = userBackups.backups.filter(backup => backup.id !== backupData.id)
            userBackups.save().then(() => {
                interaction.editReply({content: lang.backup.delete.success(backupId)})
            })
        }
        if(subCommand === 'list'){
            if(!userBackups.backups.length) return interaction.editReply({content: 'No backups'})
            const backupsName = [];
            const backupsId = [];
            for (const backup of userBackups.backups) {
                backupsName.push(backup.name + '  **:**');
                backupsId.push(backup.id);
            }
            const embed = {
                title: `List des backups des __${interaction.user.username}__`,
                fields: [
                    {
                        name: 'Server Name',
                        value: backupsName.join('\n'),
                        inline: true
                    },
                    {
                        name: '🏷 Backup Id',
                        value: backupsId.join('\n'),
                        inline: true
                    }
                ],
                timestamp: new Date(),
                color: "#36393E",
                footer: {
                    text: oneforall.user.username
                }
            }
            await interaction.editReply({embeds: [embed]})
        }
        if(subCommand === 'info'){
            const backupId = options.getString("backup")
            const backupData = userBackups.backups.find(backup => backup.id === backupId)
            if(!backupData) return interaction.editReply({content: lang.backup.backupNotFound})
            const channels = backupData.channels.categories.map(category => category.children)
            const embed = {
                ...oneforall.embed,
                title: `Information de la backup ${backupId}`,
                description: `Server Name - **${backupData.name}**\nNombres de roles - **${backupData.roles.length}**\nNombre d'emojis - **${backupData.emojis.length}**\nNombre de catégories - ** ${backupData.channels.categories.length}**\n Nombre de channels - **${channels.length}**\n Nombre de bannis - **${backupData.bans.length}**\n Backup créé le <t:${oneforall.functions.dateToEpoch(new Date(backupData.createdTimestamp))}:R>`,
                footer: {
                    text: oneforall.user.username
                }
            }
            await interaction.editReply({embeds: [embed]})
        }
    }
}
