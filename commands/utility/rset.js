import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { reminderList } from '../../utils/common.js';
import cron from 'node-cron';

export const data = new SlashCommandBuilder()
    .setName('rset')
    .setDescription('set a reminder')
    .addStringOption(option =>
        option
            .setName('event')
            .setDescription('what to remind you about')
            .setRequired(true)
    )
    .addIntegerOption(option =>
        option
            .setName('seconds')
            .setDescription('how long before reminding you')
            .setRequired(true)
    )
export async function execute(interaction) {
    const event = interaction.options.getString('event');
    const seconds = interaction.options.getInteger('seconds');
    const messageAuthor = interaction.user;
    const startTime = new Date(Date.now() + seconds * 1000);
    const cronExpression = `${startTime.getSeconds()} ${startTime.getMinutes()} ${startTime.getHours()} ${startTime.getDate()} ${startTime.getMonth() + 1} *`;
    const replyString = `I'll remind you about \`${event}\` in ${seconds} seconds (at <t:${Math.floor(startTime.getTime() / 1000)}:F>).`;
    const task = cron.schedule(cronExpression, async () => {
        await messageAuthor.send({
            content: `⏰ **Reminder:** ${event}`
        });
        const reminderIndex = reminderList.findIndex(reminder => 
            reminder.user.id === messageAuthor.id && 
            reminder.event === event && 
            reminder.fire.getTime() === startTime.getTime()
        );
        if (reminderIndex !== -1) {
            reminderList.splice(reminderIndex, 1);
        };
        task.destroy();
    });
    reminderList.push({user: messageAuthor, event: event, fire: startTime, task: task});
    await interaction.reply({ content: replyString, flags: MessageFlags.Ephemeral });
}


