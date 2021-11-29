module.exports = async (ftSecurity, member) => {
    const isMuted = ftSecurity.managers.mutesManager.has(`${member.guild.id}-${member.id}`)
    const guildData = ftSecurity.managers.guildsManager.getAndCreateIfNotExists(member.guild.id, {
        guildId: member.guild.id,
    })
    if(isMuted){
        member.roles.add(guildData.mute, `Leave muted`).catch(() => {})
    }
}
