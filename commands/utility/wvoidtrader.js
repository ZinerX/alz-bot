import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { fetchWorldStateWFCD } from '../../utils/common.js';

export const data = new SlashCommandBuilder()
    .setName('wvoidtrader')
    .setDescription('fetch warframe void trader status');
export async function execute(interaction) {
    const ws = await fetchWorldStateWFCD();
    const traderActive = ws.voidTrader.active;
    const traderActivation = Math.floor(new Date(ws.voidTrader.activation).getTime() / 1000);
    const traderExpiry = Math.floor(new Date(ws.voidTrader.expiry).getTime() / 1000);
    let replyString;
    if (traderActive) {
        replyString = `The void trader is currently chilling at \`${ws.voidTrader.location}\`, he will leave on <t:${traderExpiry}:F>`;
    } else {
        replyString = `The void trader is will arrive \`${ws.voidTrader.location}\` on <t:${traderActivation}:F>`;
    }
    
    await interaction.reply({content: replyString, flags: MessageFlags.Ephemeral});
}


