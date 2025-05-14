# Alz-Bot
Alz-Bot is a discord bot developed to provide functions such as music bot, warframe world state fetching.

The bot can be run by users locally by entering the application token, cliend ID (optionally guild ID for testing) in a .env file. (TODO: guide)

---
## Current Commands
/bplay \<link> - play track from the linked video, videos can be queued.

/bskip - skip current track and play next in the queue.

/bstop - destroy current queue and disconnect the bot.

/bqueue - check current queue of tracks.

<br>

/walerts - show current alerts in warframe

/winvasions - show current invasions in warframe

/wvoidtrader - show current void trader status in warframe

---

## Todos

- more warframe commands (world cycles, sorties, etc.)
- optimizations for music bot (config to choose downloading vs streaming for response time improvements)
- writing a guide for bot setup
