const Discord = require("discord.js")
const {
  MessageEmbed
} = require("discord.js")
const config = require("../botconfig/config.json")
const ee = require("../botconfig/embed.json")
const {
  format,
  delay,
  isrequestchannel,
  edit_request_message_queue_info,
  edit_request_message_track_info,
  arrayMove
} = require("../handlers/functions")
module.exports = async (client, message, args, type) => {
  let method = type.includes(":") ? type.split(":") : Array(type)
  if (!message.guild) return;
  //just visual for the console
  try {
    let guildstring = ` - ${message.guild ? message.guild.name : "Unknown Guild Name"} `.substr(0, 22)
    let userstring = ` - ${message.author.tag} `.substr(0, 22)

    const stringlength = 69;
    console.log("\n")
    console.log(`     ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓`.bold.brightRed)
    console.log(`     ┃ `.bold.brightRed + " ".repeat(-1 + stringlength - ` ┃ `.length) + "┃".bold.brightRed)
    console.log(`     ┃ `.bold.brightRed + `NEW SONG REQUEST: `.bold.green + " ".repeat(-1 + stringlength - ` ┃ `.length - `NEW SONG REQUEST: `.length) + "┃".bold.brightRed)
    console.log(`     ┃ `.bold.brightRed + ` - ${args.join(" ")}`.substr(0, 60).bold.cyan + " ".repeat(-1 + stringlength - ` ┃ `.length - ` - ${args.join(" ")}`.substr(0, 60).length) + "┃".bold.brightRed)
    console.log(`     ┃ `.bold.brightRed + " ".repeat(-1 + stringlength - ` ┃ `.length) + "┃".bold.brightRed)
    console.log(`     ┃ `.bold.brightRed + `REQUESTED BY: `.bold.green + " ".repeat(-1 + stringlength - ` ┃ `.length - `REQUESTED BY: `.length) + "┃".bold.brightRed)
    console.log(`     ┃ `.bold.brightRed + userstring.bold.cyan + "━".repeat(stringlength / 3 - userstring.length).bold.brightRed + "━━>".bold.brightRed + ` ${message.author.id}`.bold.cyan + " ".repeat(-1 + stringlength - ` ┃ `.length - userstring.length - "━━>".length - ` ${message.author.id}`.length - "━".repeat(stringlength / 3 - userstring.length).length) + "┃".bold.brightRed)
    console.log(`     ┃ `.bold.brightRed + " ".repeat(-1 + stringlength - ` ┃ `.length) + "┃".bold.brightRed)
    console.log(`     ┃ `.bold.brightRed + `REQUESTED IN: `.bold.green + " ".repeat(-1 + stringlength - ` ┃ `.length - `REQUESTED IN: `.length) + "┃".bold.brightRed)
    console.log(`     ┃ `.bold.brightRed + guildstring.bold.cyan + "━".repeat(stringlength / 3 - guildstring.length).bold.brightRed + "━━>".bold.brightRed + ` ${message.guild.id}`.bold.cyan + " ".repeat(-1 + stringlength - ` ┃ `.length - guildstring.length - "━━>".length - ` ${message.guild.id}`.length - "━".repeat(stringlength / 3 - guildstring.length).length) + "┃".bold.brightRed)
    console.log(`     ┃ `.bold.brightRed + " ".repeat(-1 + stringlength - ` ┃ `.length) + "┃".bold.brightRed)
    console.log(`     ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`.bold.brightRed)
    console.log("\n")
  } catch (e) {
    console.log(e) /* */
  }

  let {
    channel
  } = message.member.voice;
  const permissions = channel.permissionsFor(client.user);

  if (!permissions.has("CONNECT"))
    return message.channel.send(new MessageEmbed()
      .setColor("RED")
      .setFooter(client.user.username + " | by: milrato.eu", client.user.displayAvatarURL())
      .setTitle("❌ Error | I need permissions to join your channel")
    );
  if (!permissions.has("SPEAK"))
    return message.channel.send(new MessageEmbed()
      .setColor("RED")
      .setFooter(client.user.username + " | by: milrato.eu", client.user.displayAvatarURL())
      .setTitle("❌ Error | I need permissions to speak in your channel")
    );

  if (method[0] === "song")
    song(client, message, args, type);
  else if (method[0] === "request")
    request(client, message, args, type);
  else if (method[0] === "playlist")
    playlist(client, message, args, type);
  else if (method[0] === "similar")
    similar(client, message, args, type);
  else if (method[0] === "search")
    search(client, message, args, type);
  else if (method[0] === "skiptrack")
    skiptrack(client, message, args, type);
  else
    return message.channel.send(new MessageEmbed()
      .setColor("RED")
      .setFooter(client.user.username + " | by: milrato.eu", client.user.displayAvatarURL())
      .setTitle("❌ Error | No valid search Term? ... Please Contact: `Tomato#6966`")
    );
}

//function for playling song
async function similar(client, message, args, type) {
  try {
    //get a playlist out of it
    const mixURL = args.join(" ");
    //get the player instance
    const player = client.manager.players.get(message.guild.id);
    //search for similar tracks
    const res = await client.manager.search(mixURL, message.author);
    //if nothing is found, send error message, plus if there  is a delay for the empty QUEUE send error message TOO
    if (!res || res.loadType === 'LOAD_FAILED' || res.loadType !== 'PLAYLIST_LOADED') {
      return client.channels.cache.get(player.textChannel).send(new MessageEmbed()
        .setTitle("❌ Error | Found nothing related for the latest Song")
        .setColor("RED")
        .setFooter(client.user.username + " | by: milrato.eu", client.user.displayAvatarURL())
      );
    }
    //if its just adding do this
    if (type.split(":")[1] === "add") {
      //add the track
      player.queue.add(res.tracks[0]);
      //if its in a request channel edit it
      var irc = await isrequestchannel(client, message.channel.id, message.guild.id);
      if (irc) {edit_request_message_track_info(client, player, player.queue.current);
      edit_request_message_queue_info(client, player);}
      //send information message
      let embed2 = new Discord.MessageEmbed()
      try {
        embed2.setTitle(`Added to Queue 🩸 **\`${res.tracks[0].title}`.substr(0, 256 - 3) + "`**")
      } catch {}
      try {
        embed2.setURL(res.tracks[0].uri).setColor("BLUE").setFooter(client.user.username + " | by: milrato.eu", client.user.displayAvatarURL())
      } catch {}
      try {
        embed2.setThumbnail(`https://img.youtube.com/vi/${res.tracks[0].identifier}/mqdefault.jpg`)
      } catch {}
      try {
        embed2.addField("⌛ Duration: ", `\`${res.tracks[0].isStream ? "LIVE STREAM" : format(res.tracks[0].duration)}\``, true)
      } catch {}
      try {
        embed2.addField("💯 Song By: ", `\`${res.tracks[0].author}\``, true)
      } catch {}
      try {
        embed2.addField("🔂 Queue length: ", `\`${player.queue.length} Songs\``, true)
      } catch {}
      try {
        embed2.setFooter(`Requested by: ${res.tracks[0].requester.tag}`, res.tracks[0].requester.displayAvatarURL({
          dynamic: true
        }))
      } catch {}

      return message.channel.send(embed2).then(msg => {
        try {
          msg.delete({
            timeout: 4000
          }).catch(e => console.log("couldn't delete message this is a catch to prevent a crash".grey));
        } catch {
          /* */
        }
      });
    }
    //if its seach similar
    if (type.split(":")[1] === "search") {
      let max = 15,
        collected, filter = (m) => m.author.id === message.author.id && /^(\d+|end)$/i.test(m.content);
      if (res.tracks.length < max) max = res.tracks.length;
      track = res.tracks[0]

      const results = res.tracks
        .slice(0, max)
        .map((track, index) => `**${++index})** [\`${String(track.title).substr(0, 60).split("[").join("{").split("]").join("}")}\`](${track.uri}) - \`${format(track.duration).split(" | ")[0]}\``)
        .join('\n');
      let searchembed = new Discord.MessageEmbed()
        .setTitle(`Search result for: 🔎 **\`${player.queue.current.title}`.substr(0, 256 - 3) + "`**")
        .setColor("BLUE")
        .setFooter(client.user.username + " | by: milrato.eu", client.user.displayAvatarURL())
        .setDescription(results)
        .setFooter(`Search-Request by: ${track.requester.tag}`, track.requester.displayAvatarURL({
          dynamic: true
        }))
      message.channel.send(searchembed)
      await message.channel.send(new Discord.MessageEmbed()
        .setColor("BLUE")
        .setFooter(client.user.username + " | by: milrato.eu", client.user.displayAvatarURL())
        .setTitle("👍 Pick your Song with the `INDEX Number`")
      )
      try {
        collected = await message.channel.awaitMessages(filter, {
          max: 1,
          time: 30e3,
          errors: ['time']
        });
      } catch (e) {
        if (!player.queue.current) player.destroy();
        return message.channel.send(new MessageEmbed()
          .setTitle("❌ Error | You didn't provide a selection")
          .setColor("RED")
          .setFooter(client.user.username + " | by: milrato.eu", client.user.displayAvatarURL())
        );
      }
      const first = collected.first().content;
      if (first.toLowerCase() === 'end') {
        if (!player.queue.current) player.destroy();
        return message.channel.send(new Discord.MessageEmbed()
          .setColor("RED")
          .setFooter(client.user.username + " | by: milrato.eu", client.user.displayAvatarURL())
          .setTitle('❌ Error | Cancelled selection.')
        );
      }
      const index = Number(first) - 1;
      if (index < 0 || index > max - 1)
        return message.channel.send(new Discord.MessageEmbed()
          .setColor("RED")
          .setFooter(client.user.username + " | by: milrato.eu", client.user.displayAvatarURL())
          .setTitle(`❌ Error | The number you provided too small or too big (1-${max}).`)
        );
      track = res.tracks[index];
      if (!res.tracks[0])
        return message.channel.send(new MessageEmbed()
          .setColor("RED")
          .setFooter(client.user.username + " | by: milrato.eu", client.user.displayAvatarURL())
          .setTitle(String("❌ Error | Found nothing for: **`" + player.queue.current.title).substr(0, 256 - 3) + "`**")
          .setDescription(`Please retry!`)
        );
      if (player.state !== "CONNECTED") {
        // Connect to the voice channel and add the track to the queue

        player.connect();
        player.queue.add(track);
        player.play();

        var irc = await isrequestchannel(client, message.channel.id, message.guild.id);
        if (irc) {edit_request_message_track_info(client, player, player.queue.current);
        edit_request_message_queue_info(client, player);}
      } else {
        player.queue.add(track);
        let embed = new Discord.MessageEmbed()
        try {
          embed.setTitle(`Added to Queue 🩸 **\`${track.title}`.substr(0, 256 - 3) + "`**")
        } catch {}
        try {
          embed.setURL(track.uri).setColor("BLUE").setFooter(client.user.username + " | by: milrato.eu", client.user.displayAvatarURL())
        } catch {}
        try {
          embed.setThumbnail(track.displayThumbnail(1))
        } catch {}
        try {
          embed.addField("⌛ Duration: ", `\`${track.isStream ? "LIVE STREAM" : format(track.duration)}\``, true)
        } catch {}
        try {
          embed.addField("💯 Song By: ", `\`${track.author}\``, true)
        } catch {}
        try {
          embed.addField("🔂 Queue length: ", `\`${player.queue.length} Songs\``, true)
        } catch {}
        try {
          embed.setFooter(`Requested by: ${track.requester.tag}`, track.requester.displayAvatarURL({
            dynamic: true
          }))
        } catch {}

        var irc = await isrequestchannel(client, message.channel.id, message.guild.id);
        if (irc) {edit_request_message_track_info(client, player, player.queue.current);
        edit_request_message_queue_info(client, player);}
        return message.channel.send(embed).then(msg => {
          try {
            msg.delete({
              timeout: 4000
            }).catch(e => console.log("couldn't delete message this is a catch to prevent a crash".grey));
          } catch {
            /* */
          }
        });
      }
    }
  } catch (e) {
    console.log(String(e.stack).red)
    return message.channel.send(new Discord.MessageEmbed()
      .setColor("RED")
      .setFooter(client.user.username + " | by: milrato.eu", client.user.displayAvatarURL())
      .setTitle(String("❌ Error | Found nothing for: **`" + player.queue.current.title).substr(0, 256 - 3) + "`**")
    )
  }
}
//function for searching songs
async function search(client, message, args, type) {
  const search = args.join(" ");
  try {
    let res;
    let player;
    player = client.manager.create({
      guild: message.guild.id,
      voiceChannel: message.member.voice.channel.id,
      textChannel: message.channel.id,
      selfDeafen: config.settings.selfDeaf,
    });
    try {
      // Search for tracks using a query or url, using a query searches youtube automatically and the track requester object
      res = await client.manager.search({
        query: search,
        source: type.split(":")[1]
      }, message.author);
      // Check the load type as this command is not that advanced for basics
      if (res.loadType === "LOAD_FAILED") throw res.exception;
      else if (res.loadType === "PLAYLIST_LOADED") throw {
        message: "Playlists are not supported with this command. Use   ?playlist  "
      };
    } catch (e) {
      console.log(String(e.stack).red)
      return message.channel.send(new MessageEmbed()
        .setColor("RED")
        .setFooter(client.user.username + " | by: milrato.eu", client.user.displayAvatarURL())
        .setTitle(`❌ Error | There was an error while searching:`)
        .setDescription(`\`\`\`${e.message}\`\`\``)
      );
    }


    let max = 10,
      collected, filter = (m) => m.author.id === message.author.id && /^(\d+|end)$/i.test(m.content);
    if (res.tracks.length < max) max = res.tracks.length;
    track = res.tracks[0]

    const results = res.tracks
      .slice(0, max)
      .map((track, index) => `**${++index})** [\`${String(track.title).substr(0, 60).split("[").join("{").split("]").join("}")}\`](${track.uri}) - \`${format(track.duration).split(" | ")[0]}\``)
      .join('\n');

    message.channel.send(new Discord.MessageEmbed()
      .setTitle(`Search result for: 🔎 **\`${search}`.substr(0, 256 - 3) + "`**")
      .setColor("BLUE").setFooter(client.user.username + " | by: milrato.eu", client.user.displayAvatarURL())
      .setDescription(results)
      .setFooter(`Search-Request by: ${track.requester.tag}`, track.requester.displayAvatarURL({
        dynamic: true
      }))
    )

    await message.channel.send(new Discord.MessageEmbed()
      .setColor("BLUE")
      .setFooter(client.user.username + " | by: milrato.eu", client.user.displayAvatarURL())
      .setTitle("Pick your Song with the `INDEX Number`")
    )
    try {
      collected = await message.channel.awaitMessages(filter, {
        max: 1,
        time: 30e3,
        errors: ['time']
      });
    } catch (e) {
      if (!player.queue.current) player.destroy();
      return message.channel.send(new MessageEmbed()
        .setTitle("❌ Error | You didn't provide a selection")
        .setColor("RED")
        .setFooter(client.user.username + " | by: milrato.eu", client.user.displayAvatarURL())
      );
    }
    const first = collected.first().content;
    if (first.toLowerCase() === 'end') {
      if (!player.queue.current) player.destroy();
      return message.channel.send(new Discord.MessageEmbed()
        .setColor("RED")
        .setFooter(client.user.username + " | by: milrato.eu", client.user.displayAvatarURL())
        .setTitle('❌ Error | Cancelled selection.')
      );
    }
    const index = Number(first) - 1;
    if (index < 0 || index > max - 1)
      return message.channel.send(new Discord.MessageEmbed()
        .setColor("RED")
        .setFooter(client.user.username + " | by: milrato.eu", client.user.displayAvatarURL())
        .setTitle(`❌ Error | The number you provided too small or too big (1-${max}).`)
      );
    track = res.tracks[index];
    if (!res.tracks[0])
      return message.channel.send(new MessageEmbed()
        .setColor("RED")
        .setFooter(client.user.username + " | by: milrato.eu", client.user.displayAvatarURL())
        .setTitle(String("❌ Error | Found nothing for: **`" + search).substr(0, 256 - 3) + "`**")
        .setDescription(`Please retry!`)
      );
    if (player.state !== "CONNECTED") {
      player.connect();
      //add track
      player.queue.add(track);
      //set the variables
      player.set("message", message);
      player.set("playerauthor", message.author.id);
      //play track
      player.play();

      var irc = await isrequestchannel(client, message.channel.id, message.guild.id);
      if (irc) {edit_request_message_track_info(client, player, player.queue.current);
      edit_request_message_queue_info(client, player);}
    } else {
      player.queue.add(track);

      var irc = await isrequestchannel(client, message.channel.id, message.guild.id);
      if (irc) {edit_request_message_track_info(client, player, player.queue.current);
      edit_request_message_queue_info(client, player);}
      let embed3 = new Discord.MessageEmbed()
        .setTitle(`Added to Queue 🩸 **\`${track.title}`.substr(0, 256 - 3) + "`**")
        .setURL(track.uri).setColor("BLUE").setFooter(client.user.username + " | by: milrato.eu", client.user.displayAvatarURL())
        .setThumbnail(track.displayThumbnail(1))
        .addField("⌛ Duration: ", `\`${track.isStream ? "LIVE STREAM" : format(track.duration)}\``, true)
        .addField("💯 Song By: ", `\`${track.author}\``, true)
        .addField("🔂 Queue length: ", `\`${player.queue.length} Songs\``, true)
        .setFooter(`Requested by: ${track.requester.tag}`, track.requester.displayAvatarURL({
          dynamic: true
        }))
      return message.channel.send(embed3).then(msg => {
        try {
          msg.delete({
            timeout: 4000
          }).catch(e => console.log("couldn't delete message this is a catch to prevent a crash".grey));
        } catch {
          /* */
        }
      });
    }

  } catch (e) {
    console.log(String(e.stack).red)
    message.channel.send(new Discord.MessageEmbed()
      .setColor("RED")
      .setFooter(client.user.username + " | by: milrato.eu", client.user.displayAvatarURL())
      .setTitle(String("❌ Error | Found nothing for: **`" + search).substr(0, 256 - 3) + "`**")
    )
  }
}
//function for searching songs
async function searchplaylist(client, message, args, type) {
  const search = args.join(" ");
  try {
    let res;
    try {
      // Search for tracks using a query or url, using a query searches youtube automatically and the track requester object
      res = await client.manager.search({
        query: search,
        source: type.split(":")[1]
      }, message.author);
      // Check the load type as this command is not that advanced for basics
      if (res.loadType === "LOAD_FAILED") throw res.exception;
      else if (res.loadType === "PLAYLIST_LOADED") throw {
        message: "Playlists are not supported with this command. Use   ?playlist  "
      };
    } catch (e) {
      console.log(String(e.stack).red)
      return message.channel.send(new MessageEmbed()
        .setColor("RED")
        .setFooter(client.user.username + " | by: milrato.eu", client.user.displayAvatarURL())
        .setTitle(`❌ Error | There was an error while searching:`)
        .setDescription(`\`\`\`${e.message}\`\`\``)
      );
    }


    let max = 10,
      collected, filter = (m) => m.author.id === message.author.id && /^(\d+|end)$/i.test(m.content);
    if (res.tracks.length < max) max = res.tracks.length;
    track = res.tracks[0]

    const results = res.tracks
      .slice(0, max)
      .map((track, index) => `**${++index})** [\`${String(track.title).substr(0, 60).split("[").join("{").split("]").join("}")}\`](${track.uri}) - \`${format(track.duration).split(" | ")[0]}\``)
      .join('\n');

    message.channel.send(new Discord.MessageEmbed()
      .setTitle(`Search result for: 🔎 **\`${search}`.substr(0, 256 - 3) + "`**")
      .setColor("BLUE").setFooter(client.user.username + " | by: milrato.eu", client.user.displayAvatarURL())
      .setDescription(results)
      .setFooter(`Search-Request by: ${track.requester.tag}`, track.requester.displayAvatarURL({
        dynamic: true
      }))
    )

    await message.channel.send(new Discord.MessageEmbed()
      .setColor("BLUE")
      .setFooter(client.user.username + " | by: milrato.eu", client.user.displayAvatarURL())
      .setTitle("Pick your Song with the `INDEX Number`")
    )
    try {
      collected = await message.channel.awaitMessages(filter, {
        max: 1,
        time: 30e3,
        errors: ['time']
      });
    } catch (e) {
      if (!player.queue.current) player.destroy();
      return message.channel.send(new MessageEmbed()
        .setTitle("❌ Error | You didn't provide a selection")
        .setColor("RED")
        .setFooter(client.user.username + " | by: milrato.eu", client.user.displayAvatarURL())
      );
    }
    const first = collected.first().content;
    if (first.toLowerCase() === 'end') {
      if (!player.queue.current) player.destroy();
      return message.channel.send(new Discord.MessageEmbed()
        .setColor("RED")
        .setFooter(client.user.username + " | by: milrato.eu", client.user.displayAvatarURL())
        .setTitle('❌ Error | Cancelled selection.')
      );
    }
    const index = Number(first) - 1;
    if (index < 0 || index > max - 1)
      return message.channel.send(new Discord.MessageEmbed()
        .setColor("RED")
        .setFooter(client.user.username + " | by: milrato.eu", client.user.displayAvatarURL())
        .setTitle(`❌ Error | The number you provided too small or too big (1-${max}).`)
      );
    track = res.tracks[index];
    if (!res.tracks[0])
      return message.channel.send(new MessageEmbed()
        .setColor("RED")
        .setFooter(client.user.username + " | by: milrato.eu", client.user.displayAvatarURL())
        .setTitle(String("❌ Error | Found nothing for: **`" + search).substr(0, 256 - 3) + "`**")
        .setDescription(`Please retry!`)
      );
    // Create the player
    let player = client.manager.create({
      guild: message.guild.id,
      voiceChannel: message.member.voice.channel.id,
      textChannel: message.channel.id,
      selfDeafen: config.settings.selfDeaf,
    });
    if (player.state !== "CONNECTED") {
      // Connect to the voice channel and add the track to the queue
      player.connect();
      player.set("message", message);
      player.set("playerauthor", message.author.id);
      player.queue.add(track);
      player.play();

      var irc = await isrequestchannel(client, message.channel.id, message.guild.id);
      if (irc){ edit_request_message_track_info(client, player, player.queue.current);
      edit_request_message_queue_info(client, player);}
    } else {
      player.queue.add(track);

      var irc = await isrequestchannel(client, message.channel.id, message.guild.id);
      if (irc){ edit_request_message_track_info(client, player, player.queue.current);
      edit_request_message_queue_info(client, player);}
      let embed3 = new Discord.MessageEmbed()
      try {
        embed3.setTitle(`Added to Queue 🩸 **\`${track.title}`.substr(0, 256 - 3) + "`**")
      } catch {}
      try {
        embed3.setURL(track.uri).setColor("BLUE").setFooter(client.user.username + " | by: milrato.eu", client.user.displayAvatarURL())
      } catch {}
      try {
        embed3.setThumbnail(track.displayThumbnail(1))
      } catch {}
      try {
        embed3.addField("⌛ Duration: ", `\`${track.isStream ? "LIVE STREAM" : format(track.duration)}\``, true)
      } catch {}
      try {
        embed3.addField("💯 Song By: ", `\`${track.author}\``, true)
      } catch {}
      try {
        embed3.addField("🔂 Queue length: ", `\`${player.queue.length} Songs\``, true)
      } catch {}
      try {
        embed3.setFooter(`Requested by: ${track.requester.tag}`, track.requester.displayAvatarURL({
          dynamic: true
        }))
      } catch {}
      return message.channel.send(embed3).then(msg => {
        try {
          msg.delete({
            timeout: 4000
          }).catch(e => console.log("couldn't delete message this is a catch to prevent a crash".grey));
        } catch {
          /* */
        }
      });
    }

  } catch (e) {
    console.log(String(e.stack).red)
    message.channel.send(new Discord.MessageEmbed()
      .setColor("RED")
      .setFooter(client.user.username + " | by: milrato.eu", client.user.displayAvatarURL())
      .setTitle(String("❌ Error | Found nothing for: **`" + search).substr(0, 256 - 3) + "`**")
    )
  }
}
//function for playing playlists
async function playlist(client, message, args, type) {
  const search = args.join(" ");
  try {
    let res;
    let player;
    player = client.manager.create({
      guild: message.guild.id,
      voiceChannel: message.member.voice.channel.id,
      textChannel: message.channel.id,
      selfDeafen: config.settings.selfDeaf,
    });
    let state = player.state;
    try {
      // Search for tracks using a query or url, using a query searches youtube automatically and the track requester object
      res = await client.manager.search(search, message.author);
      // Check the load type as this command is not that advanced for basics
      if (res.loadType === "LOAD_FAILED") throw res.exception;
      else if (res.loadType === "SEARCH_RESULT") throw {
        message: "Searches are not supported with this command. Use   ?play   or   ?search  "
      };
    } catch (e) {
      console.log(String(e.stack).red)
      return message.channel.send(new MessageEmbed()
        .setColor("RED")
        .setFooter(client.user.username + " | by: milrato.eu", client.user.displayAvatarURL())
        .setTitle(`❌ Error | There was an error while searching:`)
        .setDescription(`\`\`\`${e.message}\`\`\``)
      );
    }
    if (!res.tracks[0])
      return message.channel.send(new MessageEmbed()
        .setColor("RED")
        .setFooter(client.user.username + " | by: milrato.eu", client.user.displayAvatarURL())
        .setTitle(String("❌ Error | Found nothing for: **`" + search).substr(0, 256 - 3) + "`**")
        .setDescription(`Please retry!`)
      );
    //if the player is not connected, then connect and create things
    if (player.state !== "CONNECTED") {
      player.connect();
      //add track
      player.queue.add(res.tracks);
      //set the variables
      player.set("message", message);
      player.set("playerauthor", message.author.id);
      //play track
      player.play();
      let playlistembed = new Discord.MessageEmbed()
        .setTitle(`Added Playlist 🩸 **\`${res.playlist.name}`.substr(0, 256 - 3) + "`**")
        .setURL(res.playlist.uri).setColor("BLUE").setFooter(client.user.username + " | by: milrato.eu", client.user.displayAvatarURL())
        .setThumbnail(`https://img.youtube.com/vi/${res.tracks[0].identifier}/mqdefault.jpg`)
        .addField("⌛ Duration: ", `\`${format(res.playlist.duration)}\``, true)
        .addField("🔂 Queue length: ", `\`${player.queue.length} Songs\``, true)
        .setFooter(`Requested by: ${message.author.tag}`, message.author.displayAvatarURL({
          dynamic: true
        }))
      message.channel.send(playlistembed).then(msg => {
        try {
          msg.delete({
            timeout: 4000
          }).catch(e => console.log("couldn't delete message this is a catch to prevent a crash".grey));
        } catch {
          /* */
        }
      });

      var irc = await isrequestchannel(client, message.channel.id, message.guild.id);
      if (irc){ edit_request_message_track_info(client, player, player.queue.current);
      edit_request_message_queue_info(client, player);}
    } else {
      player.queue.add(res.tracks);

      var irc = await isrequestchannel(client, message.channel.id, message.guild.id);
      if (irc) {edit_request_message_track_info(client, player, player.queue.current);
      edit_request_message_queue_info(client, player);}
      let playlistembed2 = new Discord.MessageEmbed()
        .setTitle(`Added Playlist 🩸 **\`${res.playlist.name}`.substr(0, 256 - 3) + "`**")
        .setURL(res.playlist.uri).setColor("BLUE").setFooter(client.user.username + " | by: milrato.eu", client.user.displayAvatarURL())
        .setThumbnail(`https://img.youtube.com/vi/${res.tracks[0].identifier}/mqdefault.jpg`)
        .addField("⌛ Duration: ", `\`${format(res.playlist.duration)}\``, true)
        .addField("🔂 Queue length: ", `\`${player.queue.length} Songs\``, true)
        .setFooter(`Requested by: ${message.author.tag}`, message.author.displayAvatarURL({
          dynamic: true
        }))
      return message.channel.send(playlistembed2).then(msg => {
        try {
          msg.delete({
            timeout: 4000
          }).catch(e => console.log("couldn't delete message this is a catch to prevent a crash".grey));
        } catch {
          /* */
        }
      });
    }

  } catch (e) {
    console.log(String(e.stack).red)
    message.channel.send(new Discord.MessageEmbed()
      .setColor("RED")
      .setFooter(client.user.username + " | by: milrato.eu", client.user.displayAvatarURL())
      .setTitle(String("❌ Error | Found nothing for: **`" + search).substr(0, 256 - 3) + "`**")
    )
  }
}
//function for playling song
async function song(client, message, args, type) {
  const search = args.join(" ");
  try {
    let res;
    let player;
    player = client.manager.create({
      guild: message.guild.id,
      voiceChannel: message.member.voice.channel.id,
      textChannel: message.channel.id,
      selfDeafen: config.settings.selfDeaf,
    });
    try {
      // Search for tracks using a query or url, using a query searches youtube automatically and the track requester object
      if (type.split(":")[1] === "youtube" || type.split(":")[1] === "soundcloud")
        res = await client.manager.search({
          query: search,
          source: type.split(":")[1]
        }, message.author);
      else {
        res = await client.manager.search(search, message.author);
      }
      // Check the load type as this command is not that advanced for basics
      if (res.loadType === "LOAD_FAILED") throw res.exception;
      else if (res.loadType === "PLAYLIST_LOADED") throw {
        message: "Playlists are not supported with this command. Use   ?playlist  "
      };
    } catch (e) {
      console.log(String(e.stack).red)
      return message.channel.send(new MessageEmbed()
        .setColor("RED")
        .setFooter(client.user.username + " | by: milrato.eu", client.user.displayAvatarURL())
        .setTitle(`❌ Error | There was an error while searching:`)
        .setDescription(`\`\`\`${e.message}\`\`\``)
      );
    }
    if (!res.tracks[0])
      return message.channel.send(new MessageEmbed()
        .setColor("RED")
        .setFooter(client.user.username + " | by: milrato.eu", client.user.displayAvatarURL())
        .setTitle(String("❌ Error | Found nothing for: **`" + search).substr(0, 256 - 3) + "`**")
        .setDescription(`Please retry!`)
      );
    //if the player is not connected, then connect and create things
    if (player.state !== "CONNECTED") {
      player.connect();
      //add track
      player.queue.add(res.tracks[0]);
      //set the variables
      player.set("message", message);
      player.set("playerauthor", message.author.id);
      //play track
      player.play();
      //RESUME
      player.pause(false);
      var irc = await isrequestchannel(client, message.channel.id, message.guild.id);
      if (irc) {edit_request_message_track_info(client, player, player.queue.current);
      edit_request_message_queue_info(client, player);}
    } else {
      //add the latest track
      player.queue.add(res.tracks[0]);
      //if its in a request channel edit queu info

      var irc = await isrequestchannel(client, message.channel.id, message.guild.id);
      if (irc) {edit_request_message_track_info(client, player, player.queue.current);
      edit_request_message_queue_info(client, player);}
      //send track information
      let playembed = new Discord.MessageEmbed()
      try {
        playembed.setTitle(`Added to Queue 🩸 **\`${res.tracks[0].title}`.substr(0, 256 - 3) + "`**")
      } catch {}
      try {
        playembed.setURL(res.tracks[0].uri).setColor("BLUE").setFooter(client.user.username + " | by: milrato.eu", client.user.displayAvatarURL())
      } catch {}
      try {
        playembed.setThumbnail(`https://img.youtube.com/vi/${res.tracks[0].identifier}/mqdefault.jpg`)
      } catch {}
      try {
        playembed.addField("⌛ Duration: ", `\`${res.tracks[0].isStream ? "LIVE STREAM" : format(res.tracks[0].duration)}\``, true)
      } catch {}
      try {
        playembed.addField("💯 Song By: ", `\`${res.tracks[0].author}\``, true)
      } catch {}
      try {
        playembed.addField("🔂 Queue length: ", `\`${player.queue.length} Songs\``, true)
      } catch {}
      try {
        playembed.setFooter(`Requested by: ${res.tracks[0].requester.tag}`, res.tracks[0].requester.displayAvatarURL({
          dynamic: true
        }))
      } catch {}
      return message.channel.send(playembed).then(msg => {
        try {
          msg.delete({
            timeout: 4000
          }).catch(e => console.log("couldn't delete message this is a catch to prevent a crash".grey));
        } catch {
          /* */
        }
      });
    }
  } catch (e) {
    console.log(String(e.stack).red)
    message.channel.send(new Discord.MessageEmbed()
      .setColor("RED")
      .setFooter(client.user.username + " | by: milrato.eu", client.user.displayAvatarURL())
      .setTitle(String("❌ Error | Found nothing for: **`" + search).substr(0, 256 - 3) + "`**")
    )
  }

}
//function for playling song
async function request(client, message, args, type) {
  const search = args.join(" ");
  let res;
  let player;
  player = client.manager.create({
    guild: message.guild.id,
    voiceChannel: message.member.voice.channel.id,
    textChannel: message.channel.id,
    selfDeafen: false,
  });
  res = await client.manager.search({
    query: search,
    source: type.split(":")[1]
  }, message.author);
  // Check the load type as this command is not that advanced for basics
  if (res.loadType === "LOAD_FAILED") {
    throw res.exception;
  } else if (res.loadType === "PLAYLIST_LOADED") {
    playlist_()
  } else {
    song_()
  }
  //function for calling the song
  function song_() {

    //if no tracks found return info msg
    if (!res.tracks[0]) {
      return message.channel.send(`**:x: Found nothing for: \`${search}\`**`);
    }
    //create a player if not created

    //if the player is not connected, then connect and create things
    if (player.state !== "CONNECTED") {
      player.connect();
      //add track
      player.queue.add(res.tracks[0]);
      //set the variables
      player.set("message", message);
      player.set("playerauthor", message.author.id);
      //play track
      player.play();
    } 
    //otherwise
    else {
      //add track
      player.queue.add(res.tracks[0]);
      edit_request_message_queue_info(client, player);
    }
  }
  //function for playist
  function playlist_() {
    if (!res.tracks[0]) {
      return message.channel.send(`**:x: Found nothing for: \`${search}\`**`);
    }

    let player;
    player = client.manager.create({
      guild: message.guild.id,
      voiceChannel: message.member.voice.channel.id,
      textChannel: message.channel.id,
      selfDeafen: false,
    });
    //if the player is not connected, then connect and create things
    if (player.state !== "CONNECTED") {
      player.connect();
      //add track
      player.queue.add(res.tracks);
      //play track
      player.play();
    } else {
      player.queue.add(res.tracks);
      edit_request_message_queue_info(client, player);
    }
  }
}
//function for playling song + skipping
async function skiptrack(client, message, args, type) {
  const search = args.join(" ");
  try {
    let res;
    let player;
    player = client.manager.create({
      guild: message.guild.id,
      voiceChannel: message.member.voice.channel.id,
      textChannel: message.channel.id,
      selfDeafen: config.settings.selfDeaf,
    });
    let state = player.state;
    try {
      // Search for tracks using a query or url, using a query searches youtube automatically and the track requester object
      if (type.split(":")[1] === "youtube" || type.split(":")[1] === "soundcloud")
        res = await client.manager.search({
          query: search,
          source: type.split(":")[1]
        }, message.author);
      else {
        res = await client.manager.search(search, message.author);
      }
      // Check the load type as this command is not that advanced for basics
      if (res.loadType === "LOAD_FAILED") throw res.exception;
      else if (res.loadType === "PLAYLIST_LOADED") throw {
        message: "Playlists are not supported with this command. Use   ?playlist  "
      };
    } catch (e) {
      console.log(String(e.stack).red)
      return message.channel.send(new MessageEmbed()
        .setColor("RED")
        .setFooter(client.user.username + " | by: milrato.eu", client.user.displayAvatarURL())
        .setTitle(`❌ Error | There was an error while searching:`)
        .setDescription(`\`\`\`${e.message}\`\`\``)
      );
    }
    if (!res.tracks[0])
      return message.channel.send(new MessageEmbed()
        .setColor("RED")
        .setFooter(client.user.username + " | by: milrato.eu", client.user.displayAvatarURL())
        .setTitle(String("❌ Error | Found nothing for: **`" + search).substr(0, 256 - 3) + "`**")
        .setDescription(`Please retry!`)
      );
    //if the player is not connected, then connect and create things
    if (state !== "CONNECTED") {
      player.connect();
      //add track
      player.queue.add(res.tracks[0]);
      //set the variables
      player.set("message", message);
      player.set("playerauthor", message.author.id);
      //play track
      player.play();

      var irc = await isrequestchannel(client, message.channel.id, message.guild.id);
      if (irc) {edit_request_message_track_info(client, player, player.queue.current);
      edit_request_message_queue_info(client, player);}
    } else {
      player.queue.add(res.tracks[0]);
      //get the new Song
      let song = player.queue[player.queue.length - 1];
      //move the Song to the first position using my selfmade Function and save it on an array
      let QueueArray = arrayMove(player.queue, player.queue.length - 1, 0);
      //clear teh Queue
      player.queue.clear();
      //now add every old song again
      for (const track of QueueArray)
        player.queue.add(track);
      //skip the track
      player.stop();

      var irc = await isrequestchannel(client, message.channel.id, message.guild.id);
      if (irc) {edit_request_message_track_info(client, player, player.queue.current);
      edit_request_message_queue_info(client, player);}
      return;
    }
  } catch (e) {
    console.log(String(e.stack).red)
    return message.channel.send(new Discord.MessageEmbed()
      .setColor("RED")
      .setFooter(client.user.username + " | by: milrato.eu", client.user.displayAvatarURL())
      .setTitle(String("❌ Error | Found nothing for: **`" + search).substr(0, 256 - 3) + "`**")
    )
  }
}

/**
 * @INFO
 * Bot Coded by Tomato#6966 | https://github.com/Tomato6966/discord-js-lavalink-Music-Bot-erela-js
 * @INFO
 * Work for Milrato Development | https://milrato.eu
 * @INFO
 * Please mention Him / Milrato Development, when using this Code!
 * @INFO
 */
