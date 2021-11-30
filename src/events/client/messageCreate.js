
module.exports = async (oneforall, message) => {
    if (!message.guild || !oneforall.config.guildIds.includes(message.guild.id)) return;
    const guildData = await oneforall.managers.guildsManager.getAndCreateIfNotExists(message.guild.id, {
        guildId: message.guild.id
    });
    if(message.mentions.has(oneforall.user.id) && !message.content.includes('@here') && !message.content.includes('@everyone')){
        message.reply({content: oneforall.handlers.langHandler.get(guildData.lang).pingOneforall})
    }

}
