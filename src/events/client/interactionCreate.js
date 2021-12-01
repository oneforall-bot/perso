module.exports = async (ftSecurity, interaction) => {
    const handlers = ftSecurity.handlers;
    const slash = (interaction.isCommand() ? handlers.slashCommandHandler.slashCommandList : (interaction.isContextMenu() ? handlers.contextMenuHandler.contextMenuList : null))?.get(interaction.commandName.toLowerCase());

    if (slash && interaction.inGuild()) {
        const guildData = ftSecurity.managers.guildsManager.getAndCreateIfNotExists(`${interaction.member.guild.id}`, {
            guildId: interaction.member.guild.id
        });

        if (!guildData) return;

        const memberData = ftSecurity.managers.membersManager.getAndCreateIfNotExists(`${interaction.member.guild.id}-${interaction.member.id}`, {
            guildId: interaction.member.guild.id,
            memberId: interaction.member.id
        });


        if (!memberData) return;
        guildData.langManager = ftSecurity.handlers.langHandler.get(guildData.lang);
        memberData.permissionManager = new ftSecurity.Permission(ftSecurity, interaction.member.guild.id, interaction.member.id, memberData, guildData);

        const target = interaction.isContextMenu() ? (interaction.targetType === "USER" ? interaction.targetId : (interaction.targetType === "MESSAGE" ? (await interaction.channel.messages.fetch(interaction.targetId) || null) : null)) : null;
        if (slash.ownersOnly && !ftSecurity.config.owners.includes(interaction.user.id))
            return interaction.reply({content: ftSecurity.langManager().get(guildData.lang).notOwner("/", slash.data)});
        slash.run(ftSecurity, interaction, memberData, guildData, target);
        console.log(`Slash command: ${slash.data.name} has been executed by ${interaction.user.username}#${interaction.user.discriminator} in ${interaction.guild.name}`);
    }
}
