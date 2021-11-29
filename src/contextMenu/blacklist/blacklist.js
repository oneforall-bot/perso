module.exports = {
    data: {
        name: `Blacklist this user`,
        type: "USER"
    },
    run: async (ftSecurity, interaction, memberData, guildData, target) => {
        const hasPermission = memberData.permissionManager.has("BLACKLIST_CMD");
        await interaction.deferReply({ephemeral: (!!!hasPermission || target === ftSecurity.user.id)});
        if (!target) return;

        if (!hasPermission || target === ftSecurity.user.id)
            return interaction.editReply({
                content: `${!hasPermission ? "You do not have permission." : `This user is me !`}`
            });

        const alreadyBlacklisted = ftSecurity.managers.blacklistManager.find(v => v.guildId === interaction.guildId && target === v.userId);

        if (alreadyBlacklisted)
            return interaction.editReply({
                embeds: [
                    {
                        description: `<@${target}> already blacklisted by <@${alreadyBlacklisted.authorId}> \n\n Reason: \`${alreadyBlacklisted.reason}\``
                    }
                ],
                ephemeral: true
            });

        ftSecurity.managers.blacklistManager.getAndCreateIfNotExists(`${interaction.guildId}-${target}`, {
            guildId: interaction.guildId,
            userId: target,
            authorId: interaction.user.id
        }).save();

        interaction.editReply({
            embeds: [
                {
                    description: `<@${target}> successfully blacklisted by <@${interaction.user.id}>`
                }
            ]
        }).catch(() => {})
    }
}
