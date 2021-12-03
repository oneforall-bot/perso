module.exports = async (oneforall, invite) => {
    const {guild} = invite;
    if(guild.me.permissions?.has('MANAGE_GUILD')){
        const guildInv = await guild.invites.fetch()
       oneforall.cachedInv.set(guild.id, guildInv)
        if (guild.vanityURLCode) oneforall.cachedInv.set(guild.vanityURLCode, await guild.fetchVanityData());
    }
}
