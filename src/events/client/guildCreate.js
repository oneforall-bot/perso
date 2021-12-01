let antiraidCmdLoaded = false
module.exports = async (ftSecurity, guild) => {
    if (!ftSecurity.application?.owner) await ftSecurity.application?.fetch();
    const guildData = await ftSecurity.managers.guildsManager.getAndCreateIfNotExists(guild.id, {
        guildId: guild.id
    });
   await ftSecurity.setCommands(guild.id, guildData)
    const client = await ftSecurity.users.fetch(ftSecurity.config.client)
    if(ftSecurity.guilds.cache.size > ftSecurity.config.maxGuilds){
        client?.send({content: `Your bot cannot be added in more than ${ftSecurity.config.maxGuilds} guilds`})
        return guild.leave()

    }
    client?.send({content: ftSecurity.handlers.langHandler.get('fr').botAdded(guild.name, guild.memberCount, (await ftSecurity.users.fetch(guild.ownerId)))})
}
