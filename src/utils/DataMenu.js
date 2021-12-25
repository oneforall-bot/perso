const {MessageActionRow, MessageButton, CommandInteraction} = require("discord.js");

class DataMenu {
    /**
     *
     * @param data
     * @param {Function} embedPageChanger
     * @param {CommandInteraction} interaction
     * @param oneforall
     */
    constructor(data, embedPageChanger, interaction, oneforall) {
        this.data = data;
        this.interaction = interaction;
        this.oneforall = oneforall;
        this.dataType = this.getType()
        this.page = 0
        this.maxPerPage = 10
        this.slicerIndicatorMin = 0
        this.slicerIndicatorMax = 10
        this.totalPage = Math.ceil(this.getLength / this.maxPerPage)
        this.embed = () => embedPageChanger(this.page, this.slicerIndicatorMin, this.slicerIndicatorMax, this.totalPage)

    }

    getType() {
        return this.data instanceof  Map ? 'map' : 'array'
    }

    get getLength() {
        return this.dataType === 'map' ? this.data.size : this.data.length
    }

    async sendEmbed(){
        if(this.getLength > this.maxPerPage){
             this.row = new MessageActionRow().addComponents(
                new MessageButton()
                    .setCustomId(`left.${this.interaction.id}`)
                    .setEmoji('◀️')
                    .setStyle('SECONDARY')
            ).addComponents(
                new MessageButton()
                    .setCustomId(`right.${this.interaction.id}`)
                    .setEmoji('➡️')
                    .setStyle('SECONDARY')
            )
            const componentFilter = {
                filter: interactionChanger => interactionChanger.customId.includes(this.interaction.id) && interactionChanger.user.id === (this.interaction instanceof CommandInteraction ? this.interaction.user.id : this.interaction.author.id),
                time: 900000
            }
            this.collector = this.interaction.channel.createMessageComponentCollector(componentFilter)
            this.collector.on('collect', async (interactionChanger) => {
                const selectedButton = interactionChanger.customId.split('.')[0]
                if (selectedButton === 'left') {
                    this.page = this.page === 0 ? this.page = this.totalPage - 1 : this.page <= this.totalPage - 1 ? this.page -= 1 : this.page += 1
                    this.slicerIndicatorMin -= this.maxPerPage
                    this.slicerIndicatorMax -= this.maxPerPage
                }
                if (selectedButton === 'right') {
                    this.page = this.page !== this.totalPage - 1 ? this.page += 1 : this.page = 0
                    this.slicerIndicatorMin += this.maxPerPage
                    this.slicerIndicatorMax += this.maxPerPage

                }
                if (selectedButton === 'cancel') {
                    return this.collector.stop()
                }
                if (this.slicerIndicatorMax < 0 || this.slicerIndicatorMin < 0) {
                    this.slicerIndicatorMin += this.maxPerPage * this.totalPage
                    this.slicerIndicatorMax += this.maxPerPage * this.totalPage
                } else if ((this.slicerIndicatorMax >= this.maxPerPage * this.totalPage || this.slicerIndicatorMin >= this.maxPerPage * this.totalPage) && this.page === 0) {
                    this.slicerIndicatorMin = 0
                    this.slicerIndicatorMax = this.maxPerPage
                }
                await interactionChanger.message.edit({
                    embeds: [this.embed()]
                })
            })

        }

        this.interaction instanceof CommandInteraction  ? await this.interaction.editReply({embeds: [this.embed()], components: [...this.getLength > 10 ? [this.row] : [] ]}) : await this.interaction.channel.send({embeds: [this.embed()], components: [...this.getLength > 10 ? [this.row] : [] ]})
    }

}

module.exports = DataMenu
