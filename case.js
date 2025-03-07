require('./config')
const {
smsg, getGroupAdmins, formatp, tanggal, formatDate, getTime, isUrl, await, sleep, clockString, msToDate, sort, toNumber, enumGetKey, runtime, fetchJson, getBuffer, jsonformat, delay, format, logic, generateProfilePicture, parseMention, getRandom, pickRandom, reSize
} = require('./lib/myfunction')
const { makeWASocket, downloadContentFromMessage, emitGroupParticipantsUpdate, emitGroupUpdate, generateWAMessageContent, generateWAMessage, makeInMemoryStore, prepareWAMessageMedia, generateWAMessageFromContent, MediaType, areJidsSameUser, WAMessageStatus, downloadAndSaveMediaMessage, AuthenticationState, GroupMetadata, initInMemoryKeyStore, getContentType, MiscMessageGenerationOptions, useSingleFileAuthState, BufferJSON, WAMessageProto, MessageOptions, WAFlag, WANode, WAMetric, ChatModification, MessageTypeProto, WALocationMessage, RebelzectMode, WAContextInfo, proto, WAGroupMetadata, ProxyAgent, waChatKey, MimetypeMap, MediaPathMap, WAContactMessage, WAContactsArrayMessage, WAGroupInviteMessage, WATextMessage, WAMessageContent, WAMessage, BaileysError, WA_MESSAGE_STATUS_TYPE, MediaConnInfo, URL_REGEX, WAUrlInfo, WA_DEFAULT_EPHEMERAL, WAMediaUpload, mentionedJid, processTime, Browser, MessageType, Presence, WA_MESSAGE_STUB_TYPES, Mimetype, relayWAMessage, Browsers, GroupSettingChange, DisbelzectReason, WASocket, getStream, WAProto, isBaileys, AnyMessageContent, fetchLatestBaileysVersion, useMultiFileAuthState, templateMessage } = require('@whiskeysockets/baileys')
const axios = require('axios')
const os = require('os')
const fs = require('fs')
const util = require('util')
const fetch = require('node-fetch')
const speed = require('performance-now')
const moment = require('moment-timezone')
const { spawn: spawn, exec } = require('child_process')
const { Primbon } = require('scrape-primbon')
const primbon = new Primbon()
const { performance } = require('perf_hooks')
const path = require('path')
const ytdl = require("ytdl-core")
const colors = require('@colors/colors/safe')
const chalk = require('chalk')
const { toPTT, toAudio } = require("./lib/converter")
const from = m.key.remoteJid;
const isGroup = from.endsWith("@g.us");
const upchUsage = require('./lib/database/upchUsage.json') || {}


const _cmd = JSON.parse(fs.readFileSync('./lib/database/command.json'));
const _cmdUser = JSON.parse(fs.readFileSync('./lib/database/commandUser.json'));
const { addCountCmd, getPosiCmdUser, addCountCmdUser } = require('./temporary/helpers/command')

const downloadFile = async (url, path) => {
  const response = await axios.get(url, { responseType: 'stream' });
  const writer = fs.createWriteStream(path);
  response.data.pipe(writer);
  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
};

const getFileTimestamp = async (filePath) => {
  try {
    const stats = await fs.promises.stat(filePath);
    return stats.mtimeMs;
  } catch (error) {
    return null;
  }
};

const isValidUrl = (url) => {
  try {
    new URL(url);
    return url.endsWith('.js');
  } catch (error) {
    return false;
  }
};


//========= PENGINGAT SHOLAT =========//
async function getPrayerTimes(city, country) {
    try {
        const response = await axios.get(`http://api.aladhan.com/v1/timingsByCity`, {
            params: {
                city: city,
                country: country,
                method: 2, // Metode ISNA
                timezonestring: 'Asia/Jakarta' // Sesuaikan dengan zona waktu
            }
        });
        return response.data.data.timings;
    } catch (error) {
        console.error('Gagal mengambil jadwal sholat:', error);
        return null;
    }
}

async function sendPrayerReminder(belz, city, country) {
    const prayerTimes = await getPrayerTimes(city, country);
    if (!prayerTimes) return;

    const now = moment().tz('Asia/Jakarta');
    const prayerNames = {
        Fajr: 'Subuh',
        Dhuhr: 'Dzuhur',
        Asr: 'Ashar',
        Maghrib: 'Maghrib',
        Isha: 'Isha'
    };

    // Dapatkan daftar semua grup yang ada
    const groupList = await belz.groupFetchAllParticipating();
    const groupIds = Object.keys(groupList);

    for (const groupId of groupIds) {
        for (const [prayerName, prayerTime] of Object.entries(prayerTimes)) {
            if (prayerNames[prayerName]) {
                const prayerMoment = moment.tz(`${now.format('YYYY-MM-DD')} ${prayerTime}`, 'YYYY-MM-DD HH:mm', 'Asia/Jakarta');
                const diffInMinutes = prayerMoment.diff(now, 'minutes');

                // Banner untuk pengingat sholat
                const bannerInfo = {
                    title: `🕌 Waktu Sholat ${prayerNames[prayerName]}`, // Judul banner
                    body: `⏰ ${prayerTime} | ${city}, ${country}`, // Deskripsi banner
                    thumbnailUrl: 'https://github.com/latesturl/dbRaolProjects/raw/refs/heads/main/media/menu.jpg', // URL gambar banner
                    sourceUrl: 'https://whatsapp.com/channel/0029VazeUE92Jl8KuVcHIC46', // Link yang akan dibuka saat banner diklik
                    mediaType: 1 // Tipe media (1 untuk gambar)
                };

                // Kirim pengingat 5 menit sebelum sholat
                if (diffInMinutes === 5) {
                    await belz.sendMessage(groupId, {
                        text: `⏰ Waktu *${prayerNames[prayerName]}* tinggal 5 menit lagi!\n⏳ Jam: ${prayerTime}`,
                        contextInfo: {
                            externalAdReply: bannerInfo
                        }
                    });
                }

                // Kirim adzan saat waktu sholat tiba
                if (diffInMinutes <= 0 && diffInMinutes >= -2) { // Toleransi 2 menit
                    const adzanAudio = 'https://files.catbox.moe/0nj6pp.mp3';
                    await belz.sendMessage(groupId, {
                        text: `🕌 *Waktu ${prayerNames[prayerName]} Telah Tiba!*\n🕒 Jam: ${prayerTime}`,
                        audio: { url: adzanAudio },
                        mimetype: 'audio/mp4',
                        ptt: true,
                        contextInfo: {
                            externalAdReply: bannerInfo
                        }
                    });
                }
            }
        }
    }
}

function startPrayerReminder(belz, city, country) {
    setInterval(() => {
        sendPrayerReminder(belz, city, country);
    }, 60000); // Cek setiap 1 menit
}

//=========================//

//Base
module.exports = belz = async (belz, m, chatUpdate, store) => {
try {
var body = (m.mtype === 'conversation') ? m.message.conversation : (m.mtype == 'imageMessage') ? m.message.imageMessage.caption : (m.mtype == 'videoMessage') ? m.message.videoMessage.caption : (m.mtype == 'extendedTextMessage') ? m.message.extendedTextMessage.text : (m.mtype == 'buttonsResponseMessage') ? m.message.buttonsResponseMessage.selectedButtonId : (m.mtype == 'listResponseMessage') ? m.message.listResponseMessage.singleSelectReply.selectedRowId : (m.mtype == 'templateButtonReplyMessage') ? m.message.templateButtonReplyMessage.selectedId : (m.mtype === 'messageContextInfo') ? (m.message.buttonsResponseMessage?.selectedButtonId || m.message.listResponseMessage?.singleSelectReply.selectedRowId || m.text) : ''
var budy = (typeof m.text == 'string' ? m.text : '')
var prefix = prefa ? /^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#$%^&.©^]/gi.test(body) ? body.match(/^[°•π÷×¶∆£¢€¥®™+✓_=|~!?@#$%^&.©^]/gi)[0] : "" : prefa ?? global.prefix
const isCmd = body.startsWith(prefix)
const command = body.replace(prefix, '').trim().split(/ +/).shift().toLowerCase()
const args = body.trim().split(/ +/).slice(1)
const pushname = m.pushName || "No Name"
const text = q = args.join(" ")
const fatkuns = (m.quoted || m)
const quoted = (fatkuns.mtype == 'buttonsMessage') ? fatkuns[Object.keys(fatkuns)[1]] : (fatkuns.mtype == 'templateMessage') ? fatkuns.hydratedTemplate[Object.keys(fatkuns.hydratedTemplate)[1]] : (fatkuns.mtype == 'product') ? fatkuns[Object.keys(fatkuns)[0]] : m.quoted ? m.quoted : m
const mime = (quoted.msg || quoted).mimetype || ''
const qmsg = (quoted.msg || quoted)
const isMedia = /image|video|sticker|audio/.test(mime)
//User
var isAuthor = global.ownNumb.replace(/[^0-9]/g, '').includes(m.sender.split("@")[0])
const botNumber = await belz.decodeJid(belz.user.id)
const globalelit = `${global.ownNumb}@s.whatsapp.net`
const isOwner = globalelit.includes(m.sender)
const itsMe = m.sender == botNumber ? true : false
const isCreator = [botNumber, ...global.ownNumb].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender)
//Group
let groupMetadata = null;
let groupName = '';

if (m.isGroup) {
    try {
        groupMetadata = await belz.groupMetadata(m.chat);
        groupName = groupMetadata?.subject || 'Unknown Group';
    } catch (error) {
        console.error('Failed to fetch group metadata:', error);
        groupName = 'Unknown Group';
    }
}
const participants = m.isGroup ? (groupMetadata?.participants || []) : [];
const groupAdmins = m.isGroup ? await getGroupAdmins(participants) : [];
const isBotAdmins = m.isGroup ? groupAdmins.includes(botNumber) : false
const isAdmins = m.isGroup ? groupAdmins.includes(m.sender) : false
const groupOwner = m.isGroup && groupMetadata ? groupMetadata.owner : '';
const isGroupOwner = m.isGroup ? (groupOwner ? groupOwner : groupAdmins).includes(m.sender) : false;
//Akses

//React
const moji = ['📚', '💭', '💫', '🌌', '🌏', '〽️', '🌷', '🍁', '🪻',]
const randomemoji = moji[Math.floor(Math.random() * moji.length)]

//Waktu
const moment = require('moment-timezone')
const time2 = moment().tz("Asia/Jakarta").format("HH:mm:ss")
if(time2 < "19:00:00"){
var ucapanWaktu = "Selamat Malam🌃"
}
if(time2 < "15:00:00"){
var ucapanWaktu = "Selamat Sore🌄"
 }
if(time2 < "11:00:00"){
var ucapanWaktu = "Selamat Siang🏞️"
}
if(time2 < "06:00:00"){
var ucapanWaktu = "Selamat Pagi🏙️ "
 }
if(time2 < "23:59:00"){
var ucapanWaktu = "Selamat Subuh🌆"
}
const wib = moment(Date.now()).tz("Asia/Jakarta").locale("id").format("HH:mm:ss z")
const wita = moment(Date.now()).tz("Asia/Makassar").locale("id").format("HH:mm:ss z")
const wit = moment(Date.now()).tz("Asia/Jayapura").locale("id").format("HH:mm:ss z")
const salam2 = moment(Date.now()).tz("Asia/Jakarta").locale("id").format("a")

//Status
if (!belz.public) {
if (!m.key.fromMe) return
}

try {
ppuser = await belz.profilePictureUrl(m.sender, 'image')
} catch (err) {
ppuser = 'https://files.catbox.moe/j9k007.jpg'
}
ppnyauser = await getBuffer(ppuser)

const reSize = async(buffer, ukur1, ukur2) => {
 return new Promise(async(resolve, reject) => {
let jimp = require('jimp')
var baper = await jimp.read(buffer);
var ab = await baper.resize(ukur1, ukur2).getBufferAsync(jimp.MIME_JPEG)
resolve(ab)
 })
}
const fkethmb = await reSize(ppuser, 300, 300)
let jimp = require("jimp")
const resize = async (image, width, height) => {
const read = await jimp.read(image);
const data = await read.resize(width, height).getBufferAsync(jimp.MIME_JPEG);
return data;
};


const ftroli = { key: { remoteJid: '6285736178354-1625305606@g.us', participant: '6283822021601@s.whatsapp.net' }, message: { orderMessage: { itemCount: 2025, status: 1, thumbnail: fkethmb, surface: 1, message: "LatestURL | RaolProjects", orderTitle: "belz", sellerJid: '0@s.whatsapp.net' } } }

//Pengubah Text
const Raol = (text, style = 1) => {
  var abc = 'abcdefghijklmnopqrstuvwxyz1234567890'.split('');
  var raol = {
    1: 'ᴀʙᴄᴅᴇꜰɢʜɪᴊᴋʟᴍɴᴏᴘqʀꜱᴛᴜᴠᴡxʏᴢ1234567890'
  };
  var replacer = [];
  abc.map((v, i) =>
    replacer.push({
      original: v,
      convert: raol[style].split('')[i]
    })
  );
  var str = text.toLowerCase().split('');
  var output = [];
  str.map((v) => {
    const find = replacer.find((x) => x.original == v);
    find ? output.push(find.convert) : output.push(v);
  });
  return output.join('');
};
//Reply
const reply = async (teks) => {
const Thezy = {
contextInfo: {
forwardingScore: 20,
isForwarded: true,
forwardedNewsletterMessageInfo: {
newsletterName: `LatestURL | RaolProjects`,
newsletterJid: `120363378800202820@newsletter`,
},
externalAdReply: {
showAdAttribution: true,
title: `LatestURL | RaolProjects`, 
body: `${ucapanWaktu}`, 
thumbnailUrl: `https://files.catbox.moe/rrv9rt.jpg`, 
thumbnail: '',
sourceUrl: 'https://whatsapp.com/channel/0029VazeUE92Jl8KuVcHIC46', 
},
},
text: teks, 
};
return belz.sendMessage(m.chat, Thezy, {
quoted: ftroli, ephemeralExpiration: 1,
});
};

const pluginsLoader = async (directory) => {
     let plugins = [];
     const folders = fs.readdirSync(directory);
     folders.forEach(file => {
       const filePath = path.join(directory, file);
       if (filePath.endsWith(".js")) {
         try {
           const resolvedPath = require.resolve(filePath);
           if (require.cache[resolvedPath]) {
             delete require.cache[resolvedPath];
           }
           const plugin = require(filePath);
           plugins.push(plugin);
         } catch (error) {
           console.log(`${filePath}:`, error);
         }
       }
     });
     return plugins;
   };

const pluginsDisable = true;
const plugins = await pluginsLoader(path.resolve(__dirname, "./plugins"));
const plug = { 
belz,
isOwner,
command,
isCmd,
reply,
addCountCmd, 
getPosiCmdUser, 
randomemoji, 
text,
args,
botNumber,
pushname,
isGroup: m.isGroup,
isPrivate: !m.isGroup
};

for (let plugin of plugins) {
     if (plugin.command.find(e => e == command.toLowerCase())) {
       if (plugin.owner && !isOwner) {
         return reply(mess.owner);
       }
       if (plugin.premium && !isPremium) {
         return reply(mess.premium);
       }
       if (plugin.group && !plug.isGroup) {
         return reply(mess.ingroup);
       }
       if (plugin.private && !plug.isPrivate) {
         return reply(mess.private);
       }
       if (typeof plugin !== "function") return;
       await plugin(m, plug);
     }
   }

if (!pluginsDisable) return;

if (m.message) {
if (isCmd && !m.isGroup) {
console.log(chalk.black(chalk.bgHex('#ff5e78').bold(`\n🌟 ${ucapanWaktu} 🌟`)));
console.log(chalk.white(chalk.bgHex('#4a69bd').bold(`🚀 There is a new message ! 🚀`)));
console.log(chalk.black(chalk.bgHex('#fdcb6e')(`📅 DATE: ${new Date().toLocaleString()}
💬 MESSAGE: ${m.body || m.mtype}
🗣️ SENDERNAME: ${pushname}
👤 JIDS: ${m.sender}`)));
} else if (m.isGroup) {
console.log(chalk.black(chalk.bgHex('#ff5e78').bold(`\n🌟 ${ucapanWaktu} 🌟`)));
console.log(chalk.white(chalk.bgHex('#4a69bd').bold(`🚀 There is a new message! 🚀`)));
console.log(chalk.black(chalk.bgHex('#fdcb6e')(`📅 DATE: ${new Date().toLocaleString()}
💬 MESSAGE: ${m.body || m.mtype}
🗣️ SENDERNAME: ${pushname}
👤 JIDS: ${m.sender}
🔍 MESS LOCATION: ${groupName}`)));
}
}


switch (command) {
case "menu": case "help": {
    belz.sendMessage(m.chat, { react: { text: `${randomemoji}`, key: m.key }});
    addCountCmd('#menu', m.sender, _cmd);

    const owned = global.ownNumb + "@s.whatsapp.net";

    // Informasi Bot
    const botInfo = {
        status: belz.public ? "Public Mode" : "Self Mode",
        version: "3.0.5",
        uptime: runtime(process.uptime())
    };

    // Informasi Newsletter
    const newsletterInfo = {
        newsletterName: "LatestURL | RaolProjects", // Nama saluran newsletter
        newsletterJid: "120363378800202820@newsletter", // JID newsletter
        thumbnailUrl: 'https://github.com/latesturl/dbRaolProjects/raw/refs/heads/main/media/menu.jpg', // Thumbnail saluran
        sourceUrl: 'https://whatsapp.com/channel/0029VazeUE92Jl8KuVcHIC46' // Link saluran
    };

    // Kirim video sebagai GIF playback dengan newsletter info
    await belz.sendMessage(m.chat, {
        video: { url: 'https://github.com/latesturl/dbRaolProjects/raw/refs/heads/main/media/menuv2.mp4' },
        gifPlayback: true,
        caption: `Halo kak *${pushname}*, ini adalah menu bot!\n\n` +
                 `─ Waktu: *${ucapanWaktu}*\n` +
                 `─ Runtime: *${botInfo.uptime}*\n` +
                 `─ Status: *${botInfo.status}*\n` +
                 `─ Versi Bot: *${botInfo.version}*\n\n` +
                 `To see the full features, type:\n` +
                 `- *.allmenu*\n`,
        footer: `Powered by belz`,
        contextInfo: {
            mentionedJid: [m.sender, owned],
            forwardingScore: 0, // Skor forwarding tinggi untuk efek newsletter
            isForwarded: true,
            forwardedNewsletterMessageInfo: {
                newsletterName: newsletterInfo.newsletterName,
                newsletterJid: newsletterInfo.newsletterJid,
            },
            externalAdReply: {
                showAdAttribution: true,
                title: "Your Bot Name",
                body: "Your Bot Description",
                thumbnailUrl: newsletterInfo.thumbnailUrl,
                sourceUrl: newsletterInfo.sourceUrl,
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    }, { quoted: ftroli });

    // Kirim audio
    await belz.sendMessage(m.chat, {
        audio: fs.readFileSync("./temporary/media/audio.mp3"),
        mimetype: 'audio/mp4',
        ptt: true
    }, { quoted: ftroli });
}
break;
case 'allmenu': {
    belz.sendMessage(m.chat, { react: { text: `${randomemoji}`, key: m.key }})
    addCountCmd('#allmenu', m.sender, _cmd)

    const botInfo = {
        status: belz.public ? "Public Mode" : "Self Mode",
        version: "3.0.5",
        uptime: runtime(process.uptime())
    };

    // Daftar Menu (Urutan: Download > Search > Tools > Fun > Owner > Utility)
    const funMenu = `
┏━━°⌜ *DOWNLOAD MENU* ⌟°━━┓
┃  ⭒ (Coming Soon)
┗━━━━━━━━━━━━━━━━━━

┏━━°⌜ *SEARCH MENU* ⌟°━━┓
┃  ⭒ (Coming Soon)
┗━━━━━━━━━━━━━━━━━━

┏━━°⌜ *TOOLS MENU* ⌟°━━┓
┃  ⭒ (Coming Soon)
┗━━━━━━━━━━━━━━━━━━

┏━━°⌜ *FUN MENU* ⌟°━━┓
┃  ⭒ ${prefix}brat
┃  ⭒ ${prefix}bratvid
┗━━━━━━━━━━━━━━━━━━

┏━━°⌜ *OWNER MENU* ⌟°━━┓
┃  ⭒ ${prefix}addgroup
┃  ⭒ ${prefix}removegroup
┃  ⭒ ${prefix}public
┃  ⭒ ${prefix}self
┃  ⭒ ${prefix}restart
┃  ⭒ ${prefix}update
┃  ⭒ ${prefix}addfile
┃  ⭒ ${prefix}trash
┃  ⭒ ${prefix}addcase
┃  ⭒ ${prefix}addconst
┃  ⭒ ${prefix}get
┃  ⭒ ${prefix}getfunc
┃  ⭒ ${prefix}upchv1
┃  ⭒ ${prefix}upchv2
┃  ⭒ ${prefix}swgc
┗━━━━━━━━━━━━━━━━━━

┏━━°⌜ *UTILITY MENU* ⌟°━┓
┃  ⭒ ${prefix}command1
┃  ⭒ ${prefix}command2
┗━━━━━━━━━━━━━━━━━━`.trim()

    try {
        // Kirim gambar menu
        await belz.sendMessage(m.chat, {
            image: { url: 'https://github.com/latesturl/dbRaolProjects/raw/refs/heads/main/media/menu.jpg' },
            caption: `
Halo *${pushname}*, berikut daftar lengkap fitur bot!

▢ *Runtime* : ${botInfo.uptime}
▢ *Mode* : ${botInfo.status}
▢ *Version* : ${botInfo.version}

${funMenu}

📌 *Note*: 
- Cooldown berlaku untuk beberapa fitur`.trim(),
            footer: `LatestURL | RaolProjects`
        }, { quoted: m })

        // Kirim audio tambahan (opsional)
        await belz.sendMessage(m.chat, {
            audio: fs.readFileSync("./temporary/media/audio.mp3"),
            mimetype: 'audio/mp4',
            ptt: true
        }, { quoted: ftroli })

    } catch (error) {
        console.error('Allmenu Error:', error)
        belz.sendMessage(m.chat, { 
            text: `❌ Gagal menampilkan menu. Error: ${error.message}`
        })
    }
    break
}
case 'addgroup': {
    // Hanya owner yang bisa menambahkan grup
    if (!isOwner) return reply(mess.owner)

    // Ambil ID grup
    const targetGroup = m.quoted ? m.quoted.chat : m.chat
    if (!targetGroup.endsWith('@g.us')) return reply('❌ Bukan ID grup yang valid!')

    // Baca database grup yang diizinkan
    let allowedGroups = []
    try {
        allowedGroups = JSON.parse(fs.readFileSync('./lib/database/allowedGroups.json'))
    } catch {
        allowedGroups = []
    }

    // Tambahkan grup ke whitelist jika belum ada
    if (!allowedGroups.includes(targetGroup)) {
        allowedGroups.push(targetGroup)
        fs.writeFileSync('./lib/database/allowedGroups.json', JSON.stringify(allowedGroups, null, 2))
        reply(`✅ Berhasil menambahkan grup ke whitelist!\nID: ${targetGroup}`)
    } else {
        reply('⚠️ Grup ini sudah terdaftar di whitelist!')
    }
    break
}

case 'removegroup': {
    // Hanya owner yang bisa menghapus grup
    if (!isOwner) return reply(mess.owner)

    // Ambil ID grup
    const targetGroup = m.quoted ? m.quoted.chat : m.chat
    if (!targetGroup.endsWith('@g.us')) return reply('❌ Bukan ID grup yang valid!')

    // Baca database grup yang diizinkan
    let allowedGroups = JSON.parse(fs.readFileSync('./lib/database/allowedGroups.json'))
    allowedGroups = allowedGroups.filter(g => g !== targetGroup)

    // Update database
    fs.writeFileSync('./lib/database/allowedGroups.json', JSON.stringify(allowedGroups, null, 2))
    reply(`✅ Berhasil menghapus grup dari whitelist!\nID: ${targetGroup}`)
    break
}
case 'ping': {
	const used = process.memoryUsage()
                const cpus = os.cpus().map(cpu => {
                    cpu.total = Object.keys(cpu.times).reduce((last, type) => last + cpu.times[type], 0)
			        return cpu
                })
                const cpu = cpus.reduce((last, cpu, _, { length }) => {
                    last.total += cpu.total
                    last.speed += cpu.speed / length
                    last.times.user += cpu.times.user
                    last.times.nice += cpu.times.nice
                    last.times.sys += cpu.times.sys
                    last.times.idle += cpu.times.idle
                    last.times.irq += cpu.times.irq
                    return last
                }, {
                    speed: 0,
                    total: 0,
                    times: {
			            user: 0,
			            nice: 0,
			            sys: 0,
			            idle: 0,
			            irq: 0
                }
                })
                let timestamp = speed()
                let latensi = speed() - timestamp
              let  neww = performance.now()
              let  oldd = performance.now()
               let respon = Raol(`
Response Speed ${latensi.toFixed(4)} _Second_ \n ${oldd - neww} _miliseconds_\n\nRuntime : ${runtime(process.uptime())}

💻 Info Server
RAM: ${formatp(os.totalmem() - os.freemem())} / ${formatp(os.totalmem())}

_NodeJS Memory Usaage_
${Object.keys(used).map((key, _, arr) => `${key.padEnd(Math.max(...arr.map(v=>v.length)),' ')}: ${formatp(used[key])}`).join('\n')}

${cpus[0] ? `_Total CPU Usage_
${cpus[0].model.trim()} (${cpu.speed} MHZ)\n${Object.keys(cpu.times).map(type => `- *${(type + '*').padEnd(6)}: ${(100 * cpu.times[type] / cpu.total).toFixed(2)}%`).join('\n')}
_CPU Core(s) Usage (${cpus.length} Core CPU)_
${cpus.map((cpu, i) => `${i + 1}. ${cpu.model.trim()} (${cpu.speed} MHZ)\n${Object.keys(cpu.times).map(type => `- *${(type + '*').padEnd(6)}: ${(100 * cpu.times[type] / cpu.total).toFixed(2)}%`).join('\n')}`).join('\n\n')}` : ''}
                `.trim())
	belz.relayMessage(m.chat,  {
        requestPaymentMessage: {
          currencyCodeIso4217: 'IDR',
          amount1000: 1000,
          requestFrom: m.sender,
          noteMessage: {
          extendedTextMessage: {
          text: respon,
          contextInfo: {
          externalAdReply: {
          showAdAttribution: true
          }}}}}}, {})
    }
	
	break
case 'addfile': {
if (!text.includes("./")) return m.reply(`Example: ${prefix+command} ./path/to/file.txt`); 
let filePath = path.resolve(text);
let dir = path.dirname(filePath);
let fileName = path.basename(filePath);
if (!fs.existsSync(dir)) {
return m.reply('Directory not found!');
}
let media = await downloadContentFromMessage(m.quoted, "document");
let buffer = Buffer.from([]);
for await (const chunk of media) {
buffer = Buffer.concat([buffer, chunk]);
}
if (fs.existsSync(filePath)) {
fs.appendFileSync(filePath, buffer);
m.reply(`Successfully added content to ${fileName}`);
} else {
fs.writeFileSync(filePath, buffer);
m.reply(`Successfully created file ${fileName} and add content.`);
}}
break
case 'trash': {
let directoryPath = './'
fs.readdir(directoryPath, async (err, files) => {
if (err) {
console.error('Unable to scan directory: ', err);
return reply(`Failed to scan directory: ${err.message}`);
}
const filteredArray = files.filter(item => 
item.startsWith('pre-key') || 
item.startsWith('sender-key') || 
item.startsWith('session-') || 
item.startsWith('app-state')
);
let teks = `Detected ${filteredArray.length} trash file! \n\n`;
if (filteredArray.length === 0) {
return reply(teks);
}
filteredArray.forEach((file, i) => {
teks += `${i + 1}. ${file}\n`;
});
reply(teks);
await sleep(2000);
const tuts = await reply('_Remove trash..._');
for (const file of filteredArray) {
try {
fs.unlinkSync(`${directoryPath}/${file}`);
} catch (e) {
console.error(`Failed to delete file: ${file}`, e);
}}
});
}
break
case 'addcase': {
if (!text) return reply(`Example: ${prefix+command} the case`);
const namaFile = path.join(__dirname, 'case.js');
const caseBaru = `${text}\n\n`;
const tambahCase = (data, caseBaru) => {
const posisiDefault = data.lastIndexOf("default:");
if (posisiDefault !== -1) {
const kodeBaruLengkap = data.slice(0, posisiDefault) + caseBaru + data.slice(posisiDefault);
return { success: true, kodeBaruLengkap };
} else {
return { success: false, message: "Cannot find default case in file!" };
}};
fs.readFile(namaFile, 'utf8', (err, data) => {
if (err) {
console.error('An error occurred while reading the file:', err);
return reply(`An error occurred while reading the file: ${err.message}`);
}
const result = tambahCase(data, caseBaru);
if (result.success) {
fs.writeFile(namaFile, result.kodeBaruLengkap, 'utf8', (err) => {
if (err) {
console.error('An error occurred while writing the file:', err);
return reply(`An error occurred while writing the file: ${err.message}`);
} else {
console.log('Successfully added new case:');
console.log(caseBaru);
return reply('Successfully added case!');
}});
} else {
console.error(result.message);
return reply(result.message);
}});
}
break
case 'addconst': {
addCountCmd('#addconst', m.sender, _cmd)
if (!text) return reply(`Example: ${prefix+command} const new`);
const namaFile = path.join(__dirname, 'case.js');
const constBaru = `${text}\n\n`;
const tambahConst = (data, constBaru) => {
const posisiIsAntiLink = data.indexOf("const isAntiLink");
if (posisiIsAntiLink !== -1) {
const kodeBaruLengkap = data.slice(0, posisiIsAntiLink) + constBaru + data.slice(posisiIsAntiLink);
return { success: true, kodeBaruLengkap };
} else {
return { success: false, message: "Cannot find const isAntiLink in file!" };
}};
fs.readFile(namaFile, 'utf8', (err, data) => {
if (err) {
console.error('An error occurred while reading the file:', err);
return reply(`An error occurred while reading the file: ${err.message}`);
}
const result = tambahConst(data, constBaru);
if (result.success) {
fs.writeFile(namaFile, result.kodeBaruLengkap, 'utf8', (err) => {
if (err) {
console.error('An error occurred while writing the file:', err);
return reply(`An error occurred while writing the file: ${err.message}`);
} else {
console.log('Success adding new const:');
console.log(constBaru);
return reply('Success adding const!');
}});
} else {
console.error(result.message);
return reply(result.message);
}});
}
break;
case 'public': {
if (!isCreator) return reply('*owner only*') 
belz.sendMessage(m.chat, { react: { text: `${randomemoji}`, key: m.key }})
belz.public = true
reply('succes')
}
break
case 'getfunc':
case 'cekfunc':
case 'cekfunction': {
if (!isOwner) return onlyOwn();
if (!text) return reply(`Example: ${prefix+command} functionName`);
const functionName = text.trim();
if (!functionName) return reply(`Enter the name of the function you want to check. Example: ${prefix+command} functionName`);
const cekFunction = async (functionName) => {
try {
const fileContent = await fs.promises.readFile("./eliffa.js", "utf-8");
const functionRegex = new RegExp(`function ${functionName}\\s*\\([\\s\\S]*?\\)\\s*\\{[\\s\\S]*?\\}`, 'g');
const match = fileContent.match(functionRegex);
if (!match) {
return { found: false };
}
const lines = fileContent.split('\n');
const functionLines = match[0].split('\n');
const startLine = lines.indexOf(functionLines[0]) + 1;
const endLine = startLine + functionLines.length - 1;
return {
found: true,
startLine,
endLine,
content: match[0]
};
} catch (error) {
return { error: `An error occurred while reading the file: ${error.message}` };
}};
const result = await cekFunction(functionName);
if (result.error) {
reply(result.error);
} else if (result.found) {
const message = `
*FUNCTION FOUND!*
• Function name: ${functionName}
• First line: ${result.startLine}
• Final line: ${result.endLine}

Want to take it all at once?`;
let kun = `{\"display_text\":\"YA\",\"id\":\"${prefix}getfunc ${text}\"}`
quickreply1(m.chat, message, kun, m)
usersessions[m.sender] = { functionToRetrieve: result, functionName };
} else {
reply(`Function '${functionName}' not found.`);
}
}
break
case 'self': {
if (!isCreator) return reply('*owner only*') 
belz.sendMessage(m.chat, { react: { text: `${randomemoji}`, key: m.key }})
belz.public = false
reply('succes')
}
break
case 'idch': {
  if (!text) return reply("Where is the channel link?");
  if (!text.includes("https://whatsapp.com/channel/")) return reply("Invalid link");
  
  let result = text.split('https://whatsapp.com/channel/')[1];
  let res = await belz.newsletterMetadata("invite", result);
  
  let teks = `*ID : ${res.id}*\n*Name :* ${res.name}\n*Total Followers :* ${res.subscribers}\n*Status :* ${res.state}\n*Verified :* ${res.verification == "VERIFIED" ? "Yes" : "No"}`;

  let msg = generateWAMessageFromContent(m.chat, {
    viewOnceMessage: {
      message: {
        "messageContextInfo": {
          "deviceListMetadata": {},
          "deviceListMetadataVersion": 2
        },
        extendedTextMessage: {
          text: teks,
          contextInfo: {
            mentionedJid: [],
            forwardingScore: 0,
            isForwarded: true
          }
        }
      }
    }
  }, { quoted: ftroli });

  await belz.relayMessage(msg.key.remoteJid, msg.message, { messageId: msg.key.id });
}
break;
case 'upchv1': {
if (!isCreator) return reply(mess.owner)
        		try {
					ppuser = await belz.profilePictureUrl(m.sender, 'image');
				} catch (err) {
					ppuser = 'https://files.catbox.moe/j9k007.jpg'
				}	
				let fotoProfil = await getBuffer(ppuser);
				let pelers = `Message from ${m.pushName}`
				try {
					if (!mime && !text) {
						return reply(`Uh-oh, sis! You haven't sent any media or text yet. Please try again! 🤭`)
					}
					media = mime ? await quoted.download() : null
					let defaultCaption = "✨ This media is sent via an automated system✨"
					if (/image/.test(mime)) {
						belz.sendMessage(channel, {
					contextInfo: {	
		        externalAdReply: {
						showAdAttribution: true,
						title: pelers,
						mediaType: 1,
						previewType: 1,
						body: 'Massage to channel',
						thumbnail: fotoProfil,
					    renderLargerThumbnail: false,
						mediaUrl: '',
					    sourceUrl: ''
			        }
			        },
							image: media,
							caption: text ? text : defaultCaption
						})
						reply(`📸 Image successfully uploaded to channel with caption: "${text ? text : defaultCaption}"`)
					} else if (/video/.test(mime)) {
						belz.sendMessage(channel, {
					contextInfo: {
						
		        externalAdReply: {
						showAdAttribution: true,
						title: pelers,
						mediaType: 1,
						previewType: 1,
						body: 'Massage to channel',
						thumbnail: fotoProfil,
					    renderLargerThumbnail: false,
						mediaUrl: '',
					    sourceUrl: ''
			        }
			        },
							video: media,
							caption: text ? text : defaultCaption
						})
						reply(`🎥 Video successfully uploaded to channel with caption: "${text ? text : defaultCaption}"`)
					} else if (/audio/.test(mime)) {
						belz.sendMessage(channel, {
					contextInfo: {
						
		        externalAdReply: {
						showAdAttribution: true,
						title: pelers,
						mediaType: 1,
						previewType: 1,
						body: 'Massage to channel',
						thumbnail: fotoProfil,
					    renderLargerThumbnail: false,
						mediaUrl: '',
					    sourceUrl: ''
			        }
			        },
							audio: media,
							mimetype: mime,
							ptt: true
						})
						reply(`🎵 Audio successfully uploaded to the channel, sis!`)
					} else if (/text/.test(mime) || text) {
						belz.sendMessage(channel, {
					contextInfo: {
						
		        externalAdReply: {
						showAdAttribution: true,
						title: pelers,
						mediaType: 1,
						previewType: 1,
						body: 'Massage to channel',
						thumbnail: fotoProfil,
					    renderLargerThumbnail: false,
						mediaUrl: '',
					    sourceUrl: ''
			        }
			        },
							text: text ? text : defaultCaption
						})
						reply(`💬 Text message successfully sent to channel: "${text ? text : defaultCaption}"`)
					} else {
						conn(`Hmm... I don't know what kind of media this is. Please check again, sis! 🧐`)
					}
				} catch (error) {
					console.error(error)
					reply(`Oh, sis! 😣 There was a problem uploading to the channel. Try again later, OK!`)
				}
			}
			break
case 'upchv2': {
    // [0] Cek apakah pesan berasal dari grup
    if (!m.chat.endsWith('@g.us')) return reply('❌ Fitur ini hanya bisa digunakan di dalam grup!')

    // [1] Baca database grup yang diizinkan
    let allowedGroups = []
    try {
        allowedGroups = JSON.parse(fs.readFileSync('./lib/database/allowedGroups.json'))
    } catch {
        fs.writeFileSync('./lib/database/allowedGroups.json', '[]') // Buat file jika belum ada
    }

    // [2] Verifikasi ID grup
    const groupId = m.chat
    if (!allowedGroups.includes(groupId)) {
        return reply(`🚫 Akses ditolak!\nGrup ini tidak terdaftar dalam whitelist sistem!`)
    }

    // [3] Cek apakah pengguna adalah admin grup
    if (!groupAdmins) return reply(mess.owner)

    try {
        // [4] Baca database penggunaan
        let upchUsage = {}
        try {
            upchUsage = JSON.parse(fs.readFileSync('./lib/database/upchUsage.json'))
        } catch {
            fs.writeFileSync('./lib/database/upchUsage.json', '{}')
        }

        // [5] Cooldown System
        const lastUsed = upchUsage[m.sender] || 0
        const cooldown = 4 * 60 * 60 * 1000 // 24 jam
        const remainingTime = cooldown - (Date.now() - lastUsed)

        if (remainingTime > 0) {
            const hours = Math.floor(remainingTime / (1000 * 60 * 60))
            const minutes = Math.floor((remainingTime % (1000 * 60 * 60)) / (1000 * 60))
            return reply(`⏳ *Cooldown Active!*\nKamu bisa menggunakan fitur ini lagi dalam *${hours} jam ${minutes} menit*`)
        }

        // [6] Update waktu penggunaan terakhir
        upchUsage[m.sender] = Date.now()
        fs.writeFileSync('./lib/database/upchUsage.json', JSON.stringify(upchUsage, null, 2))

        // [7] Handle Text dan Media
        try {
            ppuser = await belz.profilePictureUrl(m.sender, 'image')
        } catch (err) {
            ppuser = 'https://files.catbox.moe/j9k007.jpg'
        }
        let fotoProfil = await getBuffer(ppuser)
        let pelers = `Message from ${m.pushName}`

        // [PERUBAHAN PENTING] Logic text diutamakan
        const media = mime ? await quoted.download() : null
        const textMessage = text ? text : "✨ Pesan dikirim via LatestURL Bot ✨"

        if (/image/.test(mime)) {
            await belz.sendMessage(channel, {
                contextInfo: {
                    externalAdReply: {
                        showAdAttribution: true,
                        title: pelers,
                        mediaType: 1,
                        previewType: 1,
                        body: 'Massage to channel',
                        thumbnail: fotoProfil,
                        renderLargerThumbnail: false,
                        mediaUrl: '',
                        sourceUrl: ''
                    }
                },
                image: media,
                caption: textMessage // Text sebagai caption
            })
            reply(`✅ Gambar + Text berhasil diupload!`)

        } else if (/video/.test(mime)) {
            await belz.sendMessage(channel, {
                contextInfo: {
                    externalAdReply: {
                        showAdAttribution: true,
                        title: pelers,
                        mediaType: 1,
                        previewType: 1,
                        body: 'Massage to channel',
                        thumbnail: fotoProfil,
                        renderLargerThumbnail: false,
                        mediaUrl: '',
                        sourceUrl: ''
                    }
                },
                video: media,
                caption: textMessage // Text sebagai caption
            })
            reply(`✅ Video + Text berhasil diupload!`)

        } else if (/audio/.test(mime)) {
            await belz.sendMessage(channel, {
                contextInfo: {
                    externalAdReply: {
                        showAdAttribution: true,
                        title: pelers,
                        mediaType: 1,
                        previewType: 1,
                        body: 'Massage to channel',
                        thumbnail: fotoProfil,
                        renderLargerThumbnail: false,
                        mediaUrl: '',
                        sourceUrl: ''
                    }
                },
                audio: media,
                mimetype: mime,
                ptt: true,
                caption: textMessage // Text sebagai caption untuk audio
            })
            reply(`✅ Audio + Text berhasil dikirim!`)

        } else if (text) { // [FIX] Handle text-only
            await belz.sendMessage(channel, {
                contextInfo: {
                    externalAdReply: {
                        showAdAttribution: true,
                        title: pelers,
                        mediaType: 1,
                        previewType: 1,
                        body: 'Massage to channel',
                        thumbnail: fotoProfil,
                        renderLargerThumbnail: false,
                        mediaUrl: '',
                        sourceUrl: ''
                    }
                },
                text: textMessage // Text utama
            })
            reply(`✅ Text berhasil dikirim!\n✉️ Pesan: "${text}"`)

        } else {
            reply(`❌ Harap sertakan media ATAU text!`)
        }

    } catch (error) {
        console.error('Upch Error:', error)
        reply(`🚨 Gagal mengirim! Error: ${error.message}`)
    }
    break
}
case "swgc": {
    if (!isCreator) return reply(mess.owner);
    if (!text && !quoted) return reply("Enter text for status or reply to image/video/audio with caption.");

    let media = null;
    let options = {};
    const jids = [m.sender, m.chat];

    if (quoted) {
        const mime = quoted.mtype || quoted.mediaType;
        if (mime.includes('image')) {
            media = await m.quoted.download();
            options = {
                image: media,
                caption: text || m.quoted.text || '',
            };
        } else if (mime.includes('video')) {
            media = await m.quoted.download();
            options = {
                video: media,
                caption: text || m.quoted.text || '',
            };
        } else if (mime.includes('audio')) {
            media = await m.quoted.download();
            options = {
                audio: media,
                caption: text || m.quoted.text || '',
            };
        } else {
            options = {
                text: text || m.quoted.text || '',
            };
        }
    } else {
        options = {
            text: text,
        };
    }

    try {
        // Kirim pesan status
        await belz.sendMessage("status@broadcast", options, {
            backgroundColor: "#7ACAA7",
            textArgb: 0xffffffff,
            font: 1,
            statusJidList: await (await belz.groupMetadata(m.chat)).participants.map((a) => a.id),
            additionalNodes: [
                {
                    tag: "meta",
                    attrs: {},
                    content: [
                        {
                            tag: "mentioned_users",
                            attrs: {},
                            content: jids.map((jid) => ({
                                tag: "to",
                                attrs: { jid: m.chat },
                                content: undefined,
                            })),
                        },
                    ],
                },
            ],
        });

        // Balasan sukses
        reply("✅ Status berhasil dikirim!");
    } catch (error) {
        // Balasan gagal
        reply("❌ Gagal mengirim status. Silakan coba lagi.");
        console.error("Error sending status:", error);
    }
}
break;
case 'brat': {
    if (!text) return reply('Please provide the text as well');
    const apiUrl = `https://brat.caliphdev.com/api/brat?text=${encodeURIComponent(text)}`;
    await belz.sendImageAsSticker(
        m.chat, 
        apiUrl, 
        m, 
        { 
            packname: global.packname, 
            author: global.author 
        }
    );
    break;
}
case 'bratvid': {
    const { execSync } = require('child_process');
    const tempDir = path.join(process.cwd(), 'temporary/');
    const framePaths = [];

    if (!text) return reply(`Example: ${prefix + command} hello I am whyuxD`);
    if (text.length > 40) return reply(`Character limit exceeded, max 40 characters!`);

    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    try {
        const words = text.split(" ");
        for (let i = 0; i < words.length; i++) {
            const currentText = words.slice(0, i + 1).join(" ");
            const res = await axios.get(
                `https://brat.caliphdev.com/api/brat?text=${encodeURIComponent(currentText)}`,
                { responseType: "arraybuffer" }
            ).catch((e) => e.response);

            const framePath = path.join(tempDir, `frame${i}.mp4`);
            fs.writeFileSync(framePath, res.data);
            framePaths.push(framePath);
        }

        const fileListPath = path.join(tempDir, "filelist.txt");
        let fileListContent = framePaths.map((frame, index) => 
            `file '${frame}'\nduration 0.7\n`
        ).join("");

        fileListContent += `file '${framePaths[framePaths.length - 1]}'\nduration 2\n`;
        fs.writeFileSync(fileListPath, fileListContent);

        const outputVideoPath = path.join(tempDir, "output.mp4");
        execSync(
            `ffmpeg -y -f concat -safe 0 -i ${fileListPath} -vf "fps=30" -c:v libx264 -preset ultrafast -pix_fmt yuv420p ${outputVideoPath}`
        );

        await belz.sendImageAsSticker(m.chat, outputVideoPath, m, {
            packname: global.packname,
            author: global.author
        });

        framePaths.forEach((frame) => {
            if (fs.existsSync(frame)) fs.unlinkSync(frame);
        });
        if (fs.existsSync(fileListPath)) fs.unlinkSync(fileListPath);
        if (fs.existsSync(outputVideoPath)) fs.unlinkSync(outputVideoPath);

    } catch (error) {
        console.error('Error in bratvid case:', error);
        reply('An error occurred while processing the video.');
    }

    break;
}
case 'get': {
    if (!isOwner) return reply('*Owner only*');
    if (!text) return reply(`Please start the *URL* with http:// or https://`);
    try {
        const gt = await axios.get(text, {
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Referer": "https://www.google.com/",
                "Referrer-Policy": "strict-origin-when-cross-origin",
                "User-Agent": "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36"
            },
            responseType: 'arraybuffer'
        });
        const contentType = gt.headers['content-type'];
        console.log(`Content-Type: ${contentType}`);
        if (/json/i.test(contentType)) {
            const jsonData = JSON.parse(Buffer.from(gt.data, 'binary').toString('utf8'));
            return reply(JSON.stringify(jsonData, null, 2));
        } else if (/text/i.test(contentType)) {
            const textData = Buffer.from(gt.data, 'binary').toString('utf8');
            return reply(textData);
        } else if (text.includes('webp')) {
            return belz.sendMessage(m.chat, { sticker: { url: text }}, { quoted: m });
        } else if (/image/i.test(contentType)) {
            return belz.sendMessage(m.chat, { image: { url: text }}, { quoted: m });
        } else if (/video/i.test(contentType)) {
            return belz.sendMessage(m.chat, { video: { url: text }}, { quoted: m });
        } else if (/audio/i.test(contentType) || text.includes(".mp3")) {
            return belz.sendMessage(m.chat, { audio: { url: text }}, { quoted: m });
        } else if (/application\/zip/i.test(contentType) || /application\/x-zip-compressed/i.test(contentType)) {
            return belz.sendMessage(m.chat, { document: { url: text }}, { quoted: m });
        } else if (/application\/pdf/i.test(contentType)) {
            return belz.sendMessage(m.chat, { document: { url: text }}, { quoted: m });
        } else {
            return reply(`MIME : ${contentType}\n\n${gt.data}`);
        }
    } catch (error) {
        console.error(`Error: ${error}`);
        return reply(`An error occurred while accessing the URL: ${error.message}`);
    }
}
break;
case 'getcase': {
    if (!isCreator) return reply(mess.owner); // Pastikan hanya owner yang bisa akses
    if (!text) return reply(`Masukkan nama case!\nContoh: ${prefix}getcase menu`); // Validasi input
    
    try {
        // Baca file case.js
        const caseFileContent = fs.readFileSync('./case.js', 'utf8');
        
        // Cari case yang dimaksud
        const casePattern = new RegExp(`case\\s+'${text}':\\s*{([\\s\\S]*?)break;`, 'i');
        const caseMatch = caseFileContent.match(casePattern);
        
        if (!caseMatch) throw new Error('Case tidak ditemukan'); // Handle case tidak ada
        
        // Format dan kirim kode
        const formattedCode = `\`\`\`javascript\n${caseMatch[0].trim()}\n\`\`\``;
        await reply(formattedCode);
        
    } catch (error) {
        console.error(error);
        await reply(`Gagal mengambil case:\n${error.message}`);
    }
}
break;
case 'done': {
    // Cek apakah ada argumen yang diberikan
    if (!isCreator) return reply(mess.owner);
    if (!text) return reply(`Contoh penggunaan: ${prefix}done <nominal> <barang>`);

    // Pisahkan argumen
    const [nominal, ...barangParts] = text.split(' ');
    const barang = barangParts.join(' ');

    // Validasi nominal
    if (!nominal || isNaN(nominal)) return reply('Nominal harus berupa angka!');

    // Format nominal ke dalam mata uang Rupiah
    const formattedNominal = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(nominal);

    // Ambil waktu dan tanggal saat ini
    const moment = require('moment-timezone');
    const waktu = moment().tz("Asia/Jakarta").format("HH:mm:ss");
    const tanggal = moment().tz("Asia/Jakarta").format("DD MMMM YYYY");

    // Informasi admin (bisa disesuaikan)
    const admin = "6283822021601"; // Nomor admin

    // Format pesan transaksi berhasil
    const transaksiMessage = `
*TRANSAKSI BERHASIL* ✅
\`Detail Pesanan\`
[💸] *Nominal :* ${formattedNominal}
[🎁] *Barang :* ${barang}
[⌚] *Jam :* ${waktu} WIB
[🗓] *Tanggal :* ${tanggal}
[👤] *Admin:* ${admin}

> © belz
    `.trim();

    // Kirim pesan transaksi
    await belz.sendMessage(m.chat, { text: transaksiMessage }, { quoted: m });

    break;
}
case 'sholat': {
    const city = 'Jakarta'; // Ganti dengan kota
    const country = 'Indonesia'; // Ganti dengan negara
    startPrayerReminder(belz, city, country);
    reply(`🕋 Pengingat sholat untuk *${city}, ${country}* diaktifkan di semua grup!`);
    break;
}
//===============================================//
case 'restart':
if (!isCreator) return reply(mess.owner)
reply(`Restarting will be completed in seconds`)
await sleep(3000)
process.exit()
break
//===============================================//
case 'update': {
  if (!isCreator) return reply(mess.owner);

  const defaultIndexUrl = 'https://raw.githubusercontent.com/latesturl/RaolProjects/refs/heads/master/index.js';
  const defaultCaseUrl = 'https://raw.githubusercontent.com/latesturl/RaolProjects/refs/heads/master/case.js';

  if (!args[0]) {
    try {
      const localIndexTimestamp = await getFileTimestamp('./index.js');
      const localCaseTimestamp = await getFileTimestamp('./case.js');

      const remoteIndexResponse = await axios.head(defaultIndexUrl);
      const remoteCaseResponse = await axios.head(defaultCaseUrl);

      const remoteIndexTime = new Date(remoteIndexResponse.headers['last-modified']).getTime();
      const remoteCaseTime = new Date(remoteCaseResponse.headers['last-modified']).getTime();

      if (localIndexTimestamp >= remoteIndexTime && localCaseTimestamp >= remoteCaseTime) {
        return reply('All files are already up-to-date.');
      }

      await downloadFile(defaultIndexUrl, './index.js');
      await downloadFile(defaultCaseUrl, './case.js');
      reply('Successfully updated all files! Restarting...');
      await sleep(3000);
      process.exit(0);
    } catch (error) {
      reply('Failed to update default: ' + error.message);
    }
    break;
  }

  const inputUrl = args[0];
  
  if (!isValidUrl(inputUrl)) {
    return reply('Invalid URL format! Example: https://example.com/index.js');
  }

  const targetFile = inputUrl.includes('index.js') ? 'index.js' : 
                    inputUrl.includes('case.js') ? 'case.js' : 
                    null;

  if (!targetFile) {
    return reply('URL must point to index.js or case.js!');
  }

  try {
    const localTime = await getFileTimestamp(`./${targetFile}`);
    const remoteResponse = await axios.head(inputUrl);
    const remoteTime = new Date(remoteResponse.headers['last-modified']).getTime();

    if (localTime >= remoteTime) {
      return reply(`File ${targetFile} is already the latest version.`);
    }

    await downloadFile(inputUrl, `./${targetFile}`);
    reply(`Successfully updated ${targetFile}! Restarting...`);
    await sleep(3000);
    process.exit(0);
  } catch (error) {
    reply(`Failed to update ${targetFile}: ` + error.message);
  }
  break;
}
//===============================================//
default:

if (budy.startsWith('=>')) {
if (!isCreator) return reply(mess.owner)

function Return(sul) {
sat = JSON.stringify(sul, null, 2)
bang = util.format(sat)
if (sat == undefined) {
bang = util.format(sul)
}
return reply(bang)
}
try {
reply(util.format(eval(`(async () => { return ${budy.slice(3)} })()`)))
} catch (e) {
reply(String(e))
}
}

if (budy.startsWith('>')) {
if (!isCreator) return
try {
let evaled = await eval(budy.slice(2))
if (typeof evaled !== 'string') evaled = require('util').inspect(evaled)
await reply(evaled)
} catch (err) {
await reply(String(err))
}
}

if (budy.startsWith('$')) {
if (!isOwner) return
require("child_process").exec(budy.slice(2), (err, stdout) => {
if (err) return reply(`${err}`)
if (stdout) return reply(stdout)
})
}

}
} catch (err) {
const errId = `${global.ownNumb}@s.whatsapp.net`
belz.sendMessage(errId, {text: require('util').format(err)}, {quoted: m})
console.log('\x1b[1;31m'+err+'\x1b[0m')
}
}


// Auto Clear Session System
function autoClearSession() {
    const sessionDir = './session'; // Sesuaikan dengan path session
    const clearInterval = 2 * 60 * 60 * 1000; // 2 jam dalam milidetik
    
    setInterval(async () => {
        try {
            const files = fs.readdirSync(sessionDir);
            const filteredFiles = files.filter(file => 
                file.startsWith('pre-key') ||
                file.startsWith('sender-key') ||
                file.startsWith('session-') ||
                file.startsWith('app-state')
            );

            if (filteredFiles.length === 0) return;

            console.log(chalk.yellow(`[AUTO CLEAN] Starting auto session cleanup...`));

            filteredFiles.forEach(file => {
                fs.unlinkSync(path.join(sessionDir, file));
            });

            console.log(chalk.green(`[AUTO CLEAN] Removed ${filteredFiles.length} session files`));
        } catch (error) {
            console.error(chalk.red('[AUTO CLEAN ERROR]'), error);
        }
    }, clearInterval);
}

// Jalankan saat panel start
autoClearSession();

// JANGAN UBAH KODE DI BAWAH INI
let file = require.resolve(__filename)
require('fs').watchFile(file, () => {
    require('fs').unwatchFile(file)
    console.log('\x1b[0;32m'+__filename+' \x1b[1;32mupdated!\x1b[0m')
    delete require.cache[file]
    require(file)
})