module.exports = async (oneforall, ban) => {
    const guildData = oneforall.managers.guildsManager.getAndCreateIfNotExists(ban.guild.id, {
        guildId: ban.guild.id
    })
    const roleLogs = guildData.logs.moderation
    if(!ban.guild.me.permissions.has("VIEW_AUDIT_LOG")) return
    const action = await ban.guild.fetchAuditLogs({type: "MEMBER_BAN_ADD"}).then(async (audit) => audit.entries.find(action => action.target.id === ban.user.id));
  if(!action || action.executor.id === oneforall.user.id) return
    const channel = ban.guild.channels.cache.get(roleLogs);
    const {logs} = oneforall.handlers.langHandler.get(guildData.lang);
    const {template} = logs
    if(!channel) return
    channel.send({embeds : [template.guild.ban(action.executor, ban.user, !ban.reason ? 'No reason provided' : ban.reason)]})
}
