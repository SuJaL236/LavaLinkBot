const {
  MessageEmbed
} = require(`discord.js`);
const config = require(`../../botconfig/config.json`);
const ee = require(`../../botconfig/embed.json`);
const emoji = require(`../../botconfig/emojis.json`);
module.exports = {
  name: `removetrack`,
  category: `🎶 Music`,
  aliases: [`rt`, `remove`],
  description: `Removes a track from the Queue`,
  usage: `removetrack <Trackindex>`,
  parameters: {"type":"music", "activeplayer": true, "previoussong": false},
  run: async (client, message, args, cmduser, text, prefix, player) => {
    try{
      //if no args return error
      if (!args[0])
        return message.channel.send(new MessageEmbed()
          .setFooter(client.user.username + " | by: milrato.eu", client.user.displayAvatarURL())
          .setColor("RED")
          .setTitle(`${emoji.msg.ERROR} Error | Please add the Track you want to remove!`)
          .setDescription(`Example: \`removetrack ${player.queue.size - 2 <= 0 ? player.queue.size : player.queue.size - 2 }\``)
        );
      //if the Number is not a valid Number return error
      if (isNaN(args[0]))
        return message.channel.send(new MessageEmbed()
          .setFooter(client.user.username + " | by: milrato.eu", client.user.displayAvatarURL())
          .setColor("RED")
          .setTitle(`${emoji.msg.ERROR} Error | It has to be a valid Queue Number!`)
          .setDescription(`Example: \`removetrack ${player.queue.size - 2 <= 0 ? player.queue.size : player.queue.size - 2 }\``)
        );
      //if the Number is too big return error
      if (Number(args[0]) > player.queue.size)
        return message.channel.send(new MessageEmbed()
          .setFooter(client.user.username + " | by: milrato.eu", client.user.displayAvatarURL())
          .setColor("RED")
          .setTitle(`${emoji.msg.ERROR} Error | Your Song must be in the Queue!`)
          .setDescription(`Example: \`removetrack ${player.queue.size - 2 <= 0 ? player.queue.size : player.queue.size - 2 }\``)
        );
      //remove the Song from the QUEUE
      player.queue.remove(Number(args[0]) - 1);
      //Send Success Message
      return message.channel.send(new MessageEmbed()
        .setTitle(`${emoji.msg.SUCCESS} Success | ${emoji.msg.cleared} I removed the track at position: \`${Number(args[0])}\``)
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
