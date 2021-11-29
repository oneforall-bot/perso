module.exports = async (ftSecurity, guild) => {
    const client = await ftSecurity.users.fetch(ftSecurity.config.client)
    if(ftSecurity.guilds.cache.size > ftSecurity.config.maxGuilds){
        client?.send({content: `Your bot cannot be added in more than ${ftSecurity.config.maxGuilds} guilds`})
        return guild.leave()

    }
    client?.send({content: ftSecurity.handlers.langHandler.get('fr').botAdded(guild.name, guild.memberCount, (await ftSecurity.users.fetch(guild.ownerId)))})
}
