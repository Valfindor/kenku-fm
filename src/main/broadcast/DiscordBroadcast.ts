import { ipcMain } from "electron";
import Eris from "eris";

type VoiceChannel = {
  id: string;
  name: string;
};

type Guild = {
  id: string;
  name: string;
  icon: string;
  voiceChannels: VoiceChannel[];
};

export class DiscordBroadcast {
  client?: Eris.Client;
  broadcast = new Eris.SharedStream();
  constructor() {
    ipcMain.on("DISCORD_CONNECT", this._handleConnect);
    ipcMain.on("DISCORD_DISCONNECT", this._handleDisconnect);
    ipcMain.on("DISCORD_JOIN_CHANNEL", this._handleJoinChannel);
  }

  destroy() {
    ipcMain.off("DISCORD_CONNECT", this._handleConnect);
    ipcMain.off("DISCORD_DISCONNECT", this._handleDisconnect);
    ipcMain.off("DISCORD_JOIN_CHANNEL", this._handleJoinChannel);
    this.client?.disconnect({ reconnect: false });
    this.client = undefined;
  }

  _handleConnect = async (event: Electron.IpcMainEvent, token: string) => {
    if (!token) {
      event.reply("DISCORD_DISCONNECTED");
      event.reply("ERROR", "Error connecting to bot: Invalid token");
      return;
    }
    if (this.client) {
      this.client.voiceConnections.forEach((connection) => {
        this.broadcast.remove(connection);
      });
      this.client.disconnect({ reconnect: false });
      this.client = undefined;
    }

    try {
      this.client = new Eris.Client(token, {
        intents: ["guilds", "guildVoiceStates"],
      });
      const onReady = async () => {
        event.reply("DISCORD_READY");
        event.reply("MESSAGE", "Connected");
        let guilds: Guild[] = [];
        for (let guild of Array.from(this.client.guilds.values())) {
          let voiceChannels: VoiceChannel[] = [];
          guild.channels.forEach((channel) => {
            if (channel instanceof Eris.VoiceChannel) {
              voiceChannels.push({
                id: channel.id,
                name: channel.name,
              });
            }
          });
          guilds.push({
            id: guild.id,
            name: guild.name,
            icon: guild.iconURL,
            voiceChannels,
          });
        }
        event.reply("DISCORD_GUILDS", guilds);
      };
      this.client.once("ready", onReady);
      await this.client.connect();
    } catch (err) {
      event.reply("DISCORD_DISCONNECTED");
      event.reply("ERROR", `Error connecting to bot: ${err.message}`);
    }
  };

  _handleDisconnect = async (event: Electron.IpcMainEvent) => {
    event.reply("DISCORD_DISCONNECTED");
    event.reply("DISCORD_GUILDS", []);
    event.reply("DISCORD_CHANNEL_JOINED", "local");
    this.client?.voiceConnections.forEach((connection) => {
      this.broadcast.remove(connection);
    });
    this.client?.disconnect({ reconnect: false });
    this.client = undefined;
  };

  _handleJoinChannel = async (
    event: Electron.IpcMainEvent,
    channelId: string
  ) => {
    this.client?.voiceConnections.forEach((connection) => {
      this.broadcast.remove(connection);
      this.client.leaveVoiceChannel(connection.channelID);
    });
    if (channelId !== "local" && this.client) {
      const channel = this.client.getChannel(channelId);
      if (channel instanceof Eris.VoiceChannel) {
        try {
          const connection = await channel.join();
          this.broadcast.add(connection);
          event.reply("DISCORD_CHANNEL_JOINED", channelId);
        } catch (e) {
          console.error(e);
          this.client.leaveVoiceChannel(channelId);
          event.reply("DISCORD_CHANNEL_LEFT", channelId);
        }
      }
    }
  };
}
