const prettyMilliseconds = require("pretty-ms");
const moment = require("moment");
module.exports = {
    data: {
        name: 'mybot',
        description: 'Show your subscription',
        options: [
            {
                type: 'USER',
                required: false,
                name: 'user',
                description: 'The user to show the subscription'
            }
        ]
    },
    run: async (ftSecurity, interaction) => {
        const user = interaction.options?.getUser('user') || interaction.user
        const data = await (await ftSecurity._fetch(`http://localhost:5006/api/client/${user.id}`, {headers: {'authorization': "cabe1ba8-9561-48fc-ab2c-dd9e856d57cf"}})).json()
        const bots = async (token) => await (await ftSecurity._fetch(`https://discord.com/api/v9/users/@me`, {
            headers: {
                'Authorization': 'Bot ' + token
            }
        })).json()
        let description = await Promise.all(data.map(async (clientBot, index) => {
            const botData = await bots(clientBot.token)
            return `[${botData.username}](https://discord.com/oauth2/authorize?client_id=${clientBot.botId}&scope=bot%20applications.commands&permissions=8) | ${prettyMilliseconds(new Date(clientBot.expiredAt).getTime() - new Date().getTime())} left`
        }))
        const embed = {
            author: {
                name: user.username,
                icon_url: user.displayAvatarURL({dynamic: true})
            },
            timestamp: new Date(),
            description: !data.message ? description.join('\n') : 'No subscription'
        }
        interaction.reply({embeds: [embed], ephemeral: true})
    }
}
