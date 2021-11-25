const {
  MessageEmbed
} = require(`discord.js`);
const config = require(`../../botconfig/config.json`);
const ee = require(`../../botconfig/embed.json`);
const emoji = require(`../../botconfig/emojis.json`);
module.exports = {
  name: `unshuffle`,
  category: `🎶 Music`,
  aliases: [`unmix`, `oldshuffle`, `undoshuffle`, `oldqueue`, `us`],
  description: `Unshuffles the Queue - Restores the old Queue`,
  usage: `unshuffle`,
  parameters: {"type":"music", "activeplayer": true, "previoussong": false},
  run: async (client, message, args, cmduser, text, prefix, player) => {
    try{
      //if no shuffle happened, return error
      if (!player.get(`beforeshuffle`))
        return message.channel.send(new MessageEmbed()
          .setFooter(client.user.username + " | by: milrato.eu", client.user.displayAvatarURL())
          .setColor("RED")
          .setTitle(`${emoji.msg.ERROR} Error | You haven't shuffled this Queue yet!`)
          .setDescription(`To shuffle it type: \`${prefix}shuffle\``)
        );
      //clear teh Queue
      player.queue.clear();
      //now add every old song again
      for (const track of player.get(`beforeshuffle`))
        player.queue.add(track);
      //return success message
      return message.channel.send(new MessageEmbed()
        .setTitle(`${emoji.msg.SUCCESS} Success | ${emoji.msg.shuffle} **Re**shuffled the Queue`)
        .setColor("BLUE")
        .setFooter(client.user.username + " | by: milrato.eu", client.user.displayAvatarURL())
      );
    } catch (e) {
      console.log(String(e.stack).bgRed)
      return message.channel.send(new MessageEmbed()
        .setColor("RED")
        .setFooter(client.user.username + " | by: milrato.eu", client.user.displayAvatarURL())
        .setTitle(`${emoji.msg.ERROR} ERROR | An error occurred`)
        .setDescription(`\`\`\`${e.message}\`\`\``)
      );
    }
  }
};
/**
 * @INFO
 * Bot Coded by Tomato#6966 | https://github.com/Tomato6966/discord-js-lavalink-Music-Bot-erela-js
 * @INFO
 * Work for Milrato Development | https://milrato.eu
 * @INFO
 * Please mention Him / Milrato Development, when using this Code!
 * @INFO
 */
