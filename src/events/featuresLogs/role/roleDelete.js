module.exports = async (oneforall, role) => {
    const guildData = oneforall.managers.guildsManager.getAndCreateIfNotExists(role.guild.id, {
        guildId: role.guild.id
    })
    const roleLogs = guildData.logs.moderation
    if(!role.guild.me.permissions.has("VIEW_AUDIT_LOG")) return
    const action = await role.guild.fetchAuditLogs({type: "ROLE_DELETE"}).then(async (audit) => audit.entries.first());
    if(!action) return
  if(!action || action.executor.id === oneforall.user.id) return
    const channel = role.guild.channels.cache.get(roleLogs);
    const {logs} = oneforall.handlers.langHandler.get(guildData.lang);
    const {template} = logs
    if(!channel) return
    channel.send({embeds : [template.role.delete(action.executor, role)]})
}
