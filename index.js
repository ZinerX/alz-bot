import fs from 'node:fs';
import path from 'node:path';
import { Client, Collection, Events, GatewayIntentBits } from 'discord.js';
import 'dotenv/config';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a new client instance
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildVoiceStates,
    ]
});

client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

async function loadCommands() {
    for (const folder of commandFolders) {
        const commandsPath = path.join(foldersPath, folder);
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
        for (const file of commandFiles) {
            const filePath = path.join(commandsPath, file);
            const fileUrl = `file://${filePath.replace(/\\/g, '/')}`;
            try {
                const command = await import(fileUrl);
                if (command.data && command.execute) {
                    client.commands.set(command.data.name, command);
                } else {
                    console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
                }
            } catch (error) {
                console.error(`[ERROR] Failed to load command at ${filePath}:`, error);
            }
        }
    }
}

const clearOrCreateMusicFolder = () => {
    const musicFolderPath = path.join(__dirname, 'music');
    if (fs.existsSync(musicFolderPath)) {
        console.log("Music folder found, ensuring it is empty...");
        fs.readdir(musicFolderPath, (err, files) => {
            if (err) throw err;
            for (const file of files) {
                fs.unlink(path.join(musicFolderPath, file), (unlinkErr) => {
                    if (unlinkErr) throw unlinkErr;
                });
            }
        });
    } else {
        console.log("Music folder not found, creating one now...");
        fs.mkdir(musicFolderPath, (err) => {
            if (err) {
                return console.error(err);
            }
            console.log('Music folder created successfully!');
        });
    }
};

client.once(Events.ClientReady, async readyClient => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
    clearOrCreateMusicFolder();
    await loadCommands();
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;
    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        await interaction.reply({ content: `No command matching ${interaction.commandName} was found.`, ephemeral: true });
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error("Error during command execution:", error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
        } else {
            await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
        }
    }
});

// Log in to Discord with your client's token
client.login(process.env.token);