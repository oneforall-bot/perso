let antiraidCmdLoaded = false
module.exports = async (ftSecurity, guild) => {
    if (!ftSecurity.application?.owner) await ftSecurity.application?.fetch();
    const guildData = await ftSecurity.managers.guildsManager.getAndCreateIfNotExists(guild.id, {
        guildId: guild.id
    });
    if (!antiraidCmdLoaded) {
        const antiraidCmd = ftSecurity.handlers.slashCommandHandler.slashCommandList.get('antiraid')
        for (const options of Object.keys(guildData.antiraid.config)) {
            antiraidCmd.data.options[0].options[0].choices.push({
                name: options,
                value: options
            })
        }
        for (const options of Object.keys(guildData.antiraid.enable)) antiraidCmd.data.options[1].options[0].choices.push({
            name: options,
            value: options
        })
        for (const options of Object.keys(guildData.antiraid.limit)) {
            antiraidCmd.data.options[2].options[0].choices.push({
                name: options,
                value: options
            })
        }
        ftSecurity.handlers.slashCommandHandler.slashCommandList.set('antiraid', antiraidCmd)
        antiraidCmdLoaded = true
    }
    await ftSecurity.application?.commands.set(ftSecurity.handlers.contextMenuHandler.contextMenuList.concat(ftSecurity.handlers.slashCommandHandler.slashCommandList).sort((a, b) => a.order - b.order).map(s => s.data), guild.id)
    const client = await ftSecurity.users.fetch(ftSecurity.config.client)
    if(ftSecurity.guilds.cache.size > ftSecurity.config.maxGuilds){
        client?.send({content: `Your bot cannot be added in more than ${ftSecurity.config.maxGuilds} guilds`})
        return guild.leave()

    }
    client?.send({content: ftSecurity.handlers.langHandler.get('fr').botAdded(guild.name, guild.memberCount, (await ftSecurity.users.fetch(guild.ownerId)))})
}
