import { SlashCommandBuilder, MessageFlags } from 'discord.js';
import { fetchWorldStateWFCD } from '../../utils/common.js';

export const data = new SlashCommandBuilder()
    .setName('winvasions')
    .setDescription('fetch current warframe invasions');
export async function execute(interaction) {
    const ws = await fetchWorldStateWFCD();
    let replyString = `# Current Invasions\n\n`; // Added an extra newline for spacing

    if (!ws.invasions || ws.invasions.length === 0) {
        replyString += "No active invasions at the moment.";
        await interaction.reply({content: replyString, flags: MessageFlags.Ephemeral});
        return;
    }
    for (const invasion of ws.invasions) {
        let invasionString = '';
        if (invasion.completed) {
            continue;
        }
        const faction = invasion.attacker.faction;
        const defenderFaction = invasion.defender.faction;
        const node = invasion.node;
        const progress = faction === "Infested" ? (100-invasion.completion).toFixed(2).toString() : invasion.completion.toFixed(2).toString();
        invasionString += `## ${node}: ${progress}%\n`;
        invasionString += `## ${faction} vs ${defenderFaction}\n`;
        const defenderRewardsArr = invasion.defender.reward.countedItems;
        let defenderRewards = '';
        defenderRewardsArr.forEach((value, index) => {
            defenderRewards += value.type;
            defenderRewards += ` x${value.count}`;
            if (index != defenderRewardsArr.length - 1) {
                defenderRewards += `, `;
            }
        })
        if (faction != "Infested") {
            const attackerRewardsArr = invasion.attacker.reward.countedItems;
            let attackerRewards = '';
            attackerRewardsArr.forEach((value, index) => {
                attackerRewards += value.type;
                attackerRewards += ` x${value.count}`;
                if (index != attackerRewardsArr.length - 1) {
                    attackerRewards += `, `;
                }
            })
            invasionString += `${faction} Rewards: ${attackerRewards}\n`;
        }
        invasionString += `${defenderFaction} Rewards: ${defenderRewards}\n`;
        invasionString += "-----------------------------------\n";
        replyString += invasionString;
    }
    await interaction.reply({content: replyString, flags: MessageFlags.Ephemeral});
}


