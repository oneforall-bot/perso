module.exports = async (ftSecurity, guild) => {
    const client = await ftSecurity.users.fetch(ftSecurity.config.client)
    ftSecurity.slashReloaded.delete(guild.id)
    client?.send({content: ftSecurity.handlers.langHandler.get('fr').botRemoved(guild.name, guild.memberCount, (await ftSecurity.users.fetch(guild.ownerId)))})
    ftSecurity.managers.rolesManager.filter(g => g.guildId === guild.id).forEach(g_ => g_.delete())
    ftSecurity.managers.membersManager.filter(g => g.guildId === guild.id).forEach(g => g.delete())
    ftSecurity.managers.groupsManager.filter(g => g.guildId === guild.id).forEach(g => g.delete())
    ftSecurity.managers.groupsManager.filter(g => g.guildId === guild.id).forEach(g => g.delete())
}
