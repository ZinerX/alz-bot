import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { reminderList } from '../../utils/common.js';

export const data = new SlashCommandBuilder()
    .setName('rdel')
    .setDescription('delete a specific reminder')
    .addIntegerOption(option =>
        option
            .setName('index')
            .setDescription('specify which reminder are you removing')
            .setRequired(true)
    );
export async function execute(interaction) {
    const index = interaction.options.getInteger('index') - 1;
    const messageAuthor = interaction.user;
    const userReminderList = reminderList.filter(value => {
        return value.user = messageAuthor;
    });
    let replyString;
    if (userReminderList.length === 0) {
        replyString = "You currently do not have any reminders!";
    } else {
        if (userReminderList[index] === undefined) {
            replyString = "Reminder not found, please make sure that you are looking at the correct reminder index. Check with /rlist.";
        } else {
            userReminderList[index].task.destroy();
            const reminderIndex = reminderList.findIndex(reminder =>
                reminder.user.id === userReminderList[index].user.id &&
                reminder.event === userReminderList[index].event &&
                reminder.fire.getTime() === userReminderList[index].fire.getTime()
            );
            if (reminderIndex !== -1) {
                reminderList.splice(reminderIndex, 1);
            };
            replyString = `Successfully deleted reminder: \`${userReminderList[index].event}\`!`;
        };
    }

    await interaction.reply({ content: replyString, flags: MessageFlags.Ephemeral });
}


