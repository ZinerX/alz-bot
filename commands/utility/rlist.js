import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { reminderList } from '../../utils/common.js';

export const data = new SlashCommandBuilder()
    .setName('rlist')
    .setDescription('list all of your reminders');
export async function execute(interaction) {
    const messageAuthor = interaction.user;
    const userReminderList = reminderList.filter(value => {
        return value.user = messageAuthor;
    });
    let replyString = `## Your reminders:\n`;
    userReminderList.map((value, index) => {
        replyString += `${index + 1}. Event: ${value.event}, At: <t:${Math.floor(value.fire.getTime() / 1000)}:F>\n`;
    })
    await interaction.reply({ content: replyString, flags: MessageFlags.Ephemeral });
}


