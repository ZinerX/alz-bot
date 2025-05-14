import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { fetchWorldState } from '../../utils/common.js';
import Items from '@wfcd/items';
import worldStateData from 'warframe-worldstate-data';
const nodes = worldStateData.solNodes;
const missionTypes = worldStateData.missionTypes;
const factionsData = worldStateData.factions;
const items = new Items({category: ['All']});
export const data = new SlashCommandBuilder()
    .setName('walerts')
    .setDescription('fetch current warframe alerts');
export async function execute(interaction) {
    const ws = await fetchWorldState();
    let replyString = `# Current Alerts\n\n`; // Added an extra newline for spacing
    
    if (!ws.Alerts || ws.Alerts.length === 0) {
        replyString += "No active alerts at the moment.";
        await interaction.reply({content: replyString, flags: MessageFlags.Ephemeral});
        return;
    }

    for (const alert of ws.Alerts) {
        let alertString = '';
        let date = alert.Expiry.$date.$numberLong;
        date = date.slice(0, date.length - 3);
        const expiryDate = `<t:${date}:F>`; // Changed to relative time
        const location = nodes[alert.MissionInfo.location]?.value || alert.MissionInfo.location;
        const missionType = missionTypes[alert.MissionInfo.missionType]?.value;
        const faction = factionsData[alert.MissionInfo.faction]?.value;
        const rewards = [];
        if (alert.MissionInfo.missionReward.credits) {
            rewards.push(`💰 ${alert.MissionInfo.missionReward.credits} credits`);
        }
        if (alert.MissionInfo.missionReward.items) {
            for (const item of alert.MissionInfo.missionReward.items) {
                const matchedDef = items.find(i => i.uniqueName === item);
                if (matchedDef) {
                    rewards.push(`🎁 \`${matchedDef.name}\``); // Added an icon and backticks for item names
                } else {
                    rewards.push(`❓ \`${item}\``); // Show unknown items with a question mark
                }
            }
        }
        alertString += `## ${location} (${missionType} vs ${faction})\n`;
        alertString += `**Expires:** ${expiryDate}\n`;
        alertString += `**Rewards:** ${rewards.join(', ')}\n\n`;
        replyString += alertString;
    }
    await interaction.reply({content: replyString, flags: MessageFlags.Ephemeral});
}