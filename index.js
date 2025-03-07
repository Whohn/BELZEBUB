// Import necessary modules
require('./config');
const { 
  default: belzConnect, useMultiFileAuthState, makeWASocket, DisbelzectReason, fetchLatestBaileysVersion, 
  generateForwardMessageContent, prepareWAMessageMedia, generateWAMessageFromContent, 
  generateMessageID, downloadContentFromMessage, makeInMemoryStore, jidDecode, proto, 
  DisconnectReason, getAggregateVotesInPollMessage 
} = require("@whiskeysockets/baileys");
const pino = require('pino');
const { Boom } = require('@hapi/boom');
const fs = require('fs');
const FileType = require('file-type');
const path = require('path');
const figlet = require('figlet');
const chalk = require("chalk");
const PhoneNumber = require('awesome-phonenumber');
const { spawn } = require('child_process');
const colors = require('@colors/colors/safe');
const CFonts = require('cfonts');
const moment = require('moment-timezone');
const Spinnies = require('spinnies');
const spinnies = new Spinnies()
const axios = require('axios');
const readline = require('readline');
const { stdin: input, stdout: output } = require('process');

async function fetchUsers() {
    const url = 'https://raw.githubusercontent.com/Whohn/DBELZ/refs/heads/main/dbconfig.json'; // Ganti dengan URL GitHub Raw Anda
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch users:', error);
        return [];
    }
}
// Information Creator
function showAdditionalInfo() {
    const blueStyle = chalk.hex('#0066CC').bold;
    const valueStyle = chalk.hex('#3399FF');
    
    console.log(chalk.yellow.bold('\n=== CREDITS INFORMATION ==='));
    console.log(blueStyle('Creator:') + ' ' + valueStyle('Fauzialifatah'));
    console.log(blueStyle('Recoder:') + ' ' + valueStyle('belz'));
    console.log(blueStyle('GitHub:') + ' ' + valueStyle.underline('https://github.com/latesturl'));
    console.log(chalk.yellow.bold('=============================\n'));
}

// Di bagian atas file setelah imports
const LOGIN_SESSION_FILE = './lib/database/.session_login';

// Fungsi untuk mengecek session login
function checkLoginSession() {
    return fs.existsSync(LOGIN_SESSION_FILE);
}

// Fungsi untuk membuat session login
function createLoginSession() {
    fs.writeFileSync(LOGIN_SESSION_FILE, 'logged_in');
}

// Fungsi untuk menghapus session login
function deleteLoginSession() {
    if (fs.existsSync(LOGIN_SESSION_FILE)) {
        fs.unlinkSync(LOGIN_SESSION_FILE);
    }
}

// Import custom functions and libraries
const { imageToWebp, videoToWebp, writeExifImg, writeExifVid } = require('./lib/exif');
const { smsg, isUrl, generateMessageTag, getBuffer, getSizeMedia, fetchJson, await, sleep } = require('./lib/myfunction');
const { color } = require('./lib/color');

// Create an in-memory store
const store = makeInMemoryStore({ logger: pino().child({ level: 'silent', stream: 'store' }) });

// Get the current time and determine a greeting based on the time
const now = moment().tz("Asia/Jakarta");
const time = now.format("HH:mm:ss");
let ucapanWaktu;

if (time < "06:00:00") {
  ucapanWaktu = "Selamat Subuh🌆";
} else if (time < "11:00:00") {
  ucapanWaktu = "Selamat Pagi🏙️";
} else if (time < "15:00:00") {
  ucapanWaktu = "Selamat Siang🏞️";
} else if (time < "19:00:00") {
  ucapanWaktu = "Selamat Sore🌄";
} else {
  ucapanWaktu = "Selamat Malam🌃";
}

// Get time in different time zones
const wib = now.clone().tz("Asia/Jakarta").locale("id").format("HH:mm:ss z");
const wita = now.clone().tz("Asia/Makassar").locale("id").format("HH:mm:ss z");
const wit = now.clone().tz("Asia/Jayapura").locale("id").format("HH:mm:ss z");
const salam = now.clone().tz("Asia/Jakarta").locale("id").format("a");

// Define some constants
const moji = ['📚', '💭', '💫', '🌌', '🌏', '〽️', '🌷', '🍁', '🪻'];
const randomemoji = moji[Math.floor(Math.random() * moji.length)];
const listcolor = ['aqua', 'red', 'blue', 'purple', 'magenta'];
const randomcolor = listcolor[Math.floor(Math.random() * listcolor.length)];
const randomcolor2 = listcolor[Math.floor(Math.random() * listcolor.length)];
const randomcolor3 = listcolor[Math.floor(Math.random() * listcolor.length)];
const randomcolor4 = listcolor[Math.floor(Math.random() * listcolor.length)];
const randomcolor5 = listcolor[Math.floor(Math.random() * listcolor.length)];


// Create Display Console 
const welcomeMessage = `
👋 Hii, I Am ${global.namabot}
${ucapanWaktu}
session        : ${global.sessionName}
Waktu    : ${ucapanWaktu}`;
// DISINI CONNECT NYA,  PAIRING 
async function keyoptions(url, options) {
 const axios = require("axios")
try {
const methodskey = await axios({
method: "GET",
url: url,
headers: {
'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36"
},
...options
});
return methodskey.data;
} catch (err) {
return err;
}
}

const usePairingCode = true

const question = (text) => {
  const rl = readline.createInterface({
input: process.stdin,
output: process.stdout
  });
  return new Promise((resolve) => {
rl.question(text, resolve)
  })
};

// interface readline
const rl = readline.createInterface({ input, output });

// syatemlogin
async function belzStart() {
    // Cek session login yang tersimpan
    if (checkLoginSession()) {
        showAdditionalInfo();
        proceedToPairing();
        return;
    }

    const maxAttempts = 3;
    let attempts = 0;
    
    const users = await fetchUsers();

    // Fungsi untuk menampilkan pesan login required
    const showLoginRequired = () => {
        console.log(chalk.bold.red('=================================='));
        console.log(chalk.bold.red('|        LOGIN REQUIRED          |'));
        console.log(chalk.bold.red('=================================='));
        console.log(chalk.bold.yellow('You need to login to continue.'));
        console.log(chalk.bold.yellow(`Attempts left: ${maxAttempts - attempts}`));
        console.log(chalk.bold.green('=================================='));
    };

    async function askCredentials() {
        console.clear(); // Clear log pesan
        showLoginRequired(); // Tampilkan pesan login required

        try {
            // Meminta input username dengan console.log
            console.log(chalk.cyan.bold("Enter username:"));
            const username = await new Promise((resolve) => {
                rl.question(chalk.yellow(""), (input) => {
                    resolve(input);
                });
            });

            // Meminta input password dengan console.log
            console.log(chalk.cyan.bold("Enter password:"));
            const password = await new Promise((resolve) => {
                rl.question(chalk.yellow(""), { hideEchoBack: true }, (input) => {
                    console.log(); // Baris baru setelah input password
                    resolve(input);
                });
            });

            // Mulai spinner untuk menunjukkan proses verifikasi
            spinnies.add('verifySpinner', { text: 'Verifying credentials...' });

            // Simulasi proses verifikasi (misalnya, delay 2 detik)
            await sleep(2000); // Anda bisa mengganti ini dengan proses verifikasi yang sebenarnya

            // Validasi username dan password
            const user = users.find(u => u.username === username && u.password === password);
            if (user) {
                // Hentikan spinner dan tampilkan pesan sukses
                spinnies.succeed('verifySpinner', { text: 'Login successful!' });

                // Buat session login setelah berhasil login
                createLoginSession();

                // Tampilkan informasi tambahan
                showAdditionalInfo();

                rl.close();
                proceedToPairing();
            } else {
                attempts++;
                if (attempts >= maxAttempts) {
                    // Hentikan spinner dan tampilkan pesan gagal
                    spinnies.fail('verifySpinner', { text: 'Too many failed attempts. Exiting...' });
                    process.exit();
                }
                // Hentikan spinner dan tampilkan pesan percobaan gagal
                spinnies.fail('verifySpinner', { text: `Invalid credentials. Attempts left: ${maxAttempts - attempts}` });
                askCredentials(); // Recurse
            }
        } catch (error) {
            // Hentikan spinner dan tampilkan pesan error
            spinnies.fail('verifySpinner', { text: 'Error during credential input' });
            console.error('Error during credential input:', error);
            process.exit();
        }
    }

    askCredentials();
}

async function proceedToPairing() {
    const { state, saveCreds } = await useMultiFileAuthState("./session");
    const belz = makeWASocket({
        logger: pino({ level: "silent" }),
        auth: state,
        version: [2, 3000, 1017531287],
        browser: ['Ubuntu', 'Edge', '20.0.00']
    });

// systemkey
/*
let systemkeyy = false;
if (systemkeyy === false) {
let xkey;
if (global.pw) {
xkey = global.pw;
} else {
console.log(chalk.cyan.bold("Enter the key :"));

xkey = await question(chalk.yellow(""));
}
setTimeout(async () => {
  const buff = Buffer.from("aHR0cHM6Ly9yYXcuZ2l0aHVidXNlcmNvbnRlbnQuY29tL1Jhb2xNL1NwZWVkVVJMLUF1dGgvcmVmcy9oZWFkcy9tYWluL1NwZWVkVVJMLmpzb24=", 'base64').toString("utf-8");
let kimkiro = await keyoptions(buff);
if (kimkiro.key !== xkey) {
const errkey = { text: "Key Does Not Exist In Our Database" };
spinnies.add("spinner-2", errkey);
setTimeout(() => {
spinnies.fail('spinner-2', { text: "Please try again" });
}, 1000);
await sleep(1000);
systemkeyy = false;
process.exit();
} else {
spinnies.add("spinner-1", { text: "" });
setTimeout(() => {
const succeskey = { text: "Access Key Given" };
spinnies.succeed("spinner-1", succeskey);
}, 1000);
systemkeyy = true;
}
}, 1000);
   await sleep(3000);
if (systemkeyy === false) { false }
rl.close();
}
*/

const LatestURL = [
  `
⠄⠄⠄⢰⣧⣼⣯⠄⣸⣠⣶⣶⣦⣾⠄⠄⠄⠄⡀⠄⢀⣿⣿⠄⠄⠄⢸⡇⠄⠄
⠄⠄⠄⣾⣿⠿⠿⠶⠿⢿⣿⣿⣿⣿⣦⣤⣄⢀⡅⢠⣾⣛⡉⠄⠄⠄⠸⢀⣿⠄
⠄⠄⢀⡋⣡⣴⣶⣶⡀⠄⠄⠙⢿⣿⣿⣿⣿⣿⣴⣿⣿⣿⢃⣤⣄⣀⣥⣿⣿⠄
⠄⠄⢸⣇⠻⣿⣿⣿⣧⣀⢀⣠⡌⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿⠿⠿⠿⣿⣿⣿⠄
⠄⢀⢸⣿⣷⣤⣤⣤⣬⣙⣛⢿⣿⣿⣿⣿⣿⣿⡿⣿⣿⡍⠄⠄⢀⣤⣄⠉⠋⣰
⠄⣼⣖⣿⣿⣿⣿⣿⣿⣿⣿⣿⢿⣿⣿⣿⣿⣿⢇⣿⣿⡷⠶⠶⢿⣿⣿⠇⢀⣤
⠘⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣽⣿⣿⣿⡇⣿⣿⣿⣿⣿⣿⣷⣶⣥⣴⣿⡗
⢀⠈⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡟⠄
⢸⣿⣦⣌⣛⣻⣿⣿⣧⠙⠛⠛⡭⠅⠒⠦⠭⣭⡻⣿⣿⣿⣿⣿⣿⣿⣿⡿⠃⠄
⠘⣿⣿⣿⣿⣿⣿⣿⣿⡆⠄⠄⠄⠄⠄⠄⠄⠄⠹⠈⢋⣽⣿⣿⣿⣿⣵⣾⠃⠄
⠄⠘⣿⣿⣿⣿⣿⣿⣿⣿⠄⣴⣿⣶⣄⠄⣴⣶⠄⢀⣾⣿⣿⣿⣿⣿⣿⠃⠄⠄
⠄⠄⠈⠻⣿⣿⣿⣿⣿⣿⡄⢻⣿⣿⣿⠄⣿⣿⡀⣾⣿⣿⣿⣿⣛⠛⠁⠄⠄⠄
⠄⠄⠄⠄⠈⠛⢿⣿⣿⣿⠁⠞⢿⣿⣿⡄⢿⣿⡇⣸⣿⣿⠿⠛⠁⠄⠄⠄⠄⠄
⠄⠄⠄⠄⠄⠄⠄⠉⠻⣿⣿⣾⣦⡙⠻⣷⣾⣿⠃⠿⠋⠁⠄⠄⠄⠄⠄⢀⣠⣴
⣿⣿⣿⣶⣶⣮⣥⣒⠲⢮⣝⡿⣿⣿⡆⣿⡿⠃⠄⠄⠄⠄⠄⠄⠄⣠⣴⣿⣿⣿
`, 
];

const headerMessage = [
  chalk.cyanBright.bold(`${LatestURL}`), 
  chalk.yellowBright.bold(`Belzebub | Base Raol404`),
  chalk.redBright.bold(`session : ${global.sessionName}`),
  chalk.blueBright.bold(`Waktu/Timer  : ${ucapanWaktu}`),
  chalk.greenBright.bold(`Recoder : Kim Kiro`), 
];
// question code
if(usePairingCode && !belz.authState.creds.registered) {
		console.log(headerMessage.join("\n"));
		const phoneNumber = await question('Enter an active number :\n');
		const code = await belz.requestPairingCode(phoneNumber.trim())
		console.log(`Pairing code : ${code}`)

	}
//=============//
belz.public = true

belz.decodeJid = (jid) => {
if (!jid) return jid;
if (/:\d+@/gi.test(jid)) {
let decode = jidDecode(jid) || {};
return decode.user && decode.server && decode.user + '@' + decode.server || jid;
} else return jid;
};

belz.ev.on('contacts.update', update => {
for (let contact of update) {
let id = belz.decodeJid(contact.id);
if (store && store.contacts) store.contacts[id] = { id, name: contact.notify };
}
});

belz.setStatus = (status) => {
belz.query({
tag: 'iq',
attrs: {
to: '@s.whatsapp.net',
type: 'set',
xmlns: 'status',
},
content: [{
tag: 'status',
attrs: {},
content: Buffer.from(status, 'utf-8')
}]
});
return status;
};

belz.sendText = (jid, text, quoted = '', options) => belz.sendMessage(jid, { text: text, ...options }, { quoted });

belz.public = true;

belz.getName = (jid, withoutContact  = false) => {
id = belz.decodeJid(jid)
withoutContact = belz.withoutContact || withoutContact 
let v
if (id.endsWith("@g.us")) return new Promise(async (resolve) => {
v = store.contacts[id] || {}
if (!(v.name || v.subject)) v = belz.groupMetadata(id) || {}
resolve(v.name || v.subject || PhoneNumber('+' + id.replace('@s.whatsapp.net', '')).getNumber('international'))
})
else v = id === '0@s.whatsapp.net' ? {
id,
name: 'WhatsApp'
} : id === belz.decodeJid(belz.user.id) ?
belz.user :
(store.contacts[id] || {})
return (withoutContact ? '' : v.name) || v.subject || v.verifiedName || PhoneNumber('+' + jid.replace('@s.whatsapp.net', '')).getNumber('international')
}

belz.sendContact = async (jid, kon, quoted = '', opts = {}) => {
	let list = []
	for (let i of kon) {
	list.push({
		displayName: await belz.getName(i + '@s.whatsapp.net'),
		vcard: `BEGIN:VCARD\nVERSION:3.0\nN:${await belz.getName(i + '@s.whatsapp.net')}\nFN:${await belz.getName(i + '@s.whatsapp.net')}\nitem1.TEL;waid=${i}:${i}\nitem1.X-ABLabel:Ponsel\nitem2.EMAIL;type=INTERNET:${email}\nitem2.X-ABLabel:Email\nitem3.URL:${myweb}\nitem3.X-ABLabel:${namaweb}\nitem4.ADR:;;${region};;;;\nitem4.X-ABLabel:Region\nEND:VCARD`
	})
	}
	belz.sendMessage(jid, { contacts: { displayName: `${list.length} Kontak`, contacts: list }, ...opts }, { quoted })
}

belz.serializeM = (m) => smsg(belz, m, store);


   belz.ev.on('connection.update', async (update) => {
const {
connection,
lastDisconnect
} = update
try {
if (connection === 'close') {
let reason = new Boom(lastDisconnect?.error)?.output.statusCode
if (reason === DisconnectReason.badsession) {
console.log(`Bad session File, Please Delete session and Scan Again`);
belz()
} else if (reason === DisconnectReason.connectionClosed) {
console.log("Connection closed, reconnecting....");
belzStart();
} else if (reason === DisconnectReason.connectionLost) {
console.log("Connection Lost from Server, reconnecting...");
belzStart();
} else if (reason === DisconnectReason.connectionReplaced) {
console.log("Connection Replaced, Another New session Opened, Please Close Current session First");
belz()
} else if (reason === DisconnectReason.loggedOut) {
console.log(`Device Logged Out, Please Scan Again And Run.`);
belzStart();
} else if (reason === DisconnectReason.restartRequired) {
console.log("Restart Required, Restarting...");
belzStart();
} else if (reason === DisconnectReason.timedOut) {
console.log("Connection TimedOut, Reconnecting...");
belzStart();
} else belz.end(`Unknown DisconnectReason: ${reason}|${connection}`)
}
if (update.connection == "connecting" || update.receivedPendingNotifications == "false") {
console.log(color(`Connecting`,`${randomcolor3}`)) //Console-1
}

if (update.connection == "open" || update.receivedPendingNotifications == "true") {
console.log(color(figlet.textSync(`belz`, //Console-2
  {
font: 'Standard',
horizontalLayout: 'default',
vertivalLayout: 'default',
width: 80,
whitespaceBreak: false
}), `${randomcolor4}`))

console.log(color(``,`${randomcolor5}`));

console.log(color(`${welcomeMessage}`,`${randomcolor}`)) //Console-3*/
console.log(color(`✅ Sukses Connected Bot WhatsApp`,`${randomcolor}`))
console.log(color(`📝 Thank you for your understanding and cooperation.`))
await sleep(1000)

belz.sendMessage('6283895252997@s.whatsapp.net', {
image: {
url: 'https://files.catbox.moe/rkhxu2.jpg'
}, 
caption: 'Thank you for using our script.'
})
await sleep(5000)  
belz.sendMessage('6283895252997@s.whatsapp.net', {
text: `_*Enjoy Trying Our Script🎁*_`
  })
}

} catch (err) {
console.log('Error Di Connection.update ' + err);
belzStart()
}

})

belz.ev.on('messages.update', async chatUpdate => {
for(const { key, update } of chatUpdate) {
			if(update.pollUpdates && key.fromMe) {
				const pollCreation = await getMessage(key)
				if(pollCreation) {
				const pollUpdate = await getAggregateVotesInPollMessage({
							message: pollCreation,
							pollUpdates: update.pollUpdates,
						})
	var toCmd = pollUpdate.filter(v => v.voters.length !== 0)[0]?.name
	if (toCmd == undefined) return
var prefCmd = prefix+toCmd
	belz.appenTextMessage(prefCmd, chatUpdate)
				}
			}
		}
})
 belz.sendFileUrl = async (jid, url, caption, quoted, options = {}) => {
  let mime = '';
  let res = await axios.head(url)
  mime = res.headers['content-type']
  if (mime.split("/")[1] === "gif") {
 return belz.sendMessage(jid, { video: await getBuffer(url), caption: caption, gifPlayback: true, ...options}, { quoted: quoted, ...options})
  }
  let type = mime.split("/")[0]+"Message"
  if(mime === "application/pdf"){
 return belz.sendMessage(jid, { document: await getBuffer(url), mimetype: 'application/pdf', caption: caption, ...options}, { quoted: quoted, ...options })
  }
  if(mime.split("/")[0] === "image"){
 return belz.sendMessage(jid, { image: await getBuffer(url), caption: caption, ...options}, { quoted: quoted, ...options})
  }
  if(mime.split("/")[0] === "video"){
 return belz.sendMessage(jid, { video: await getBuffer(url), caption: caption, mimetype: 'video/mp4', ...options}, { quoted: quoted, ...options })
  }
  if(mime.split("/")[0] === "audio"){
 return belz.sendMessage(jid, { audio: await getBuffer(url), caption: caption, mimetype: 'audio/mpeg', ...options}, { quoted: quoted, ...options })
  }
  }
belz.sendPoll = (jid, name = '', values = [], selectableCount = 1) => { return belz.sendMessage(jid, { poll: { name, values, selectableCount }}) }
belz.sendText = (jid, text, quoted = '', options) => belz.sendMessage(jid, { text: text, ...options }, { quoted, ...options })
belz.sendImage = async (jid, path, caption = '', quoted = '', options) => {
	let buffer = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
return await belz.sendMessage(jid, { image: buffer, caption: caption, ...options }, { quoted })
}
belz.sendVideo = async (jid, path, caption = '', quoted = '', gif = false, options) => {
let buffer = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
return await belz.sendMessage(jid, { video: buffer, caption: caption, gifPlayback: gif, ...options }, { quoted })
}
belz.sendAudio = async (jid, path, quoted = '', ptt = false, options) => {
let buffer = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
return await belz.sendMessage(jid, { audio: buffer, ptt: ptt, ...options }, { quoted })
}
belz.sendTextWithMentions = async (jid, text, quoted, options = {}) => belz.sendMessage(jid, { text: text, mentions: [...text.matchAll(/@(\d{0,16})/g)].map(v => v[1] + '@s.whatsapp.net'), ...options }, { quoted })
belz.sendImageAsSticker = async (jid, path, quoted, options = {}) => {
let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
let buffer
if (options && (options.packname || options.author)) {
buffer = await writeExifImg(buff, options)
} else {
buffer = await imageToWebp(buff)
}

await belz.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted })
return buffer
}
belz.sendVideoAsSticker = async (jid, path, quoted, options = {}) => {
let buff = Buffer.isBuffer(path) ? path : /^data:.*?\/.*?;base64,/i.test(path) ? Buffer.from(path.split`,`[1], 'base64') : /^https?:\/\//.test(path) ? await (await getBuffer(path)) : fs.existsSync(path) ? fs.readFileSync(path) : Buffer.alloc(0)
let buffer
if (options && (options.packname || options.author)) {
buffer = await writeExifVid(buff, options)
} else {
buffer = await videoToWebp(buff)
}

await belz.sendMessage(jid, { sticker: { url: buffer }, ...options }, { quoted })
return buffer
}
belz.downloadAndSaveMediaMessage = async (message, filename, attachExtension = true) => {
let quoted = message.msg ? message.msg : message
let mime = (message.msg || message).mimetype || ''
let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
const stream = await downloadContentFromMessage(quoted, messageType)
let buffer = Buffer.from([])
for await(const chunk of stream) {
buffer = Buffer.concat([buffer, chunk])
}
	let type = await FileType.fromBuffer(buffer)
trueFileName = attachExtension ? (filename + '.' + type.ext) : filename
// save to file
await fs.writeFileSync(trueFileName, buffer)
return trueFileName
}

belz.downloadMediaMessage = async (message) => {
let mime = (message.msg || message).mimetype || ''
let messageType = message.mtype ? message.mtype.replace(/Message/gi, '') : mime.split('/')[0]
const stream = await downloadContentFromMessage(message, messageType)
let buffer = Buffer.from([])
for await(const chunk of stream) {
buffer = Buffer.concat([buffer, chunk])
	}

	return buffer
 } 
belz.sendMedia = async (jid, path, fileName = '', caption = '', quoted = '', options = {}) => {
let types = await belz.getFile(path, true)
   let { mime, ext, res, data, filename } = types
   if (res && res.status !== 200 || file.length <= 65536) {
   try { throw { json: JSON.parse(file.toString()) } }
   catch (e) { if (e.json) throw e.json }
   }
   let type = '', mimetype = mime, pathFile = filename
   if (options.asDocument) type = 'document'
   if (options.asSticker || /webp/.test(mime)) {
let { writeExif } = require('./lib/exif')
let media = { mimetype: mime, data }
pathFile = await writeExif(media, { packname: options.packname ? options.packname : global.packname, author: options.author ? options.author : global.author, categories: options.categories ? options.categories : [] })
await fs.promises.unlink(filename)
type = 'sticker'
mimetype = 'image/webp'
}
   else if (/image/.test(mime)) type = 'image'
   else if (/video/.test(mime)) type = 'video'
   else if (/audio/.test(mime)) type = 'audio'
   else type = 'document'
   await belz.sendMessage(jid, { [type]: { url: pathFile }, caption, mimetype, fileName, ...options }, { quoted, ...options })
   return fs.promises.unlink(pathFile)
   }
belz.copyNForward = async (jid, message, forceForward = false, options = {}) => {
let vtype
		if (options.readViewOnce) {
			message.message = message.message && message.message.ephemeralMessage && message.message.ephemeralMessage.message ? message.message.ephemeralMessage.message : (message.message || undefined)
			vtype = Object.keys(message.message.viewOnceMessage.message)[0]
			delete(message.message && message.message.ignore ? message.message.ignore : (message.message || undefined))
			delete message.message.viewOnceMessage.message[vtype].viewOnce
			message.message = {
				...message.message.viewOnceMessage.message
			}
		}

let mtype = Object.keys(message.message)[0]
let content = await generateForwardMessageContent(message, forceForward)
let ctype = Object.keys(content)[0]
		let context = {}
if (mtype != "conversation") context = message.message[mtype].contextInfo
content[ctype].contextInfo = {
...context,
...content[ctype].contextInfo
}
const waMessage = await generateWAMessageFromContent(jid, content, options ? {
...content[ctype],
...options,
...(options.contextInfo ? {
contextInfo: {
...content[ctype].contextInfo,
...options.contextInfo
}
} : {})
} : {})
await belz.relayMessage(jid, waMessage.message, { messageId:  waMessage.key.id })
return waMessage
}

belz.cMod = (jid, copy, text = '', sender = belz.user.id, options = {}) => {
//let copy = message.toJSON()
		let mtype = Object.keys(copy.message)[0]
		let isEphemeral = mtype === 'ephemeralMessage'
if (isEphemeral) {
mtype = Object.keys(copy.message.ephemeralMessage.message)[0]
}
let msg = isEphemeral ? copy.message.ephemeralMessage.message : copy.message
		let content = msg[mtype]
if (typeof content === 'string') msg[mtype] = text || content
		else if (content.caption) content.caption = text || content.caption
		else if (content.text) content.text = text || content.text
		if (typeof content !== 'string') msg[mtype] = {
			...content,
			...options
}
if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant
		else if (copy.key.participant) sender = copy.key.participant = sender || copy.key.participant
		if (copy.key.remoteJid.includes('@s.whatsapp.net')) sender = sender || copy.key.remoteJid
		else if (copy.key.remoteJid.includes('@broadcast')) sender = sender || copy.key.remoteJid
		copy.key.remoteJid = jid
		copy.key.fromMe = sender === belz.user.id

return proto.WebMessageInfo.fromObject(copy)
}
belz.getFile = async (PATH, save) => {
let res
let data = Buffer.isBuffer(PATH) ? PATH : /^data:.*?\/.*?;base64,/i.test(PATH) ? Buffer.from(PATH.split`,`[1], 'base64') : /^https?:\/\//.test(PATH) ? await (res = await getBuffer(PATH)) : fs.existsSync(PATH) ? (filename = PATH, fs.readFileSync(PATH)) : typeof PATH === 'string' ? PATH : Buffer.alloc(0)
//if (!Buffer.isBuffer(data)) throw new TypeError('Result is not a buffer')
let type = await FileType.fromBuffer(data) || {
mime: 'application/octet-stream',
ext: '.bin'
}
filename = path.join(__filename, '../src/' + new Date * 1 + '.' + type.ext)
if (data && save) fs.promises.writeFile(filename, data)
return {
res,
filename,
	size: await getSizeMedia(data),
...type,
data
}

}

belz.ev.on('messages.upsert', async chatUpdate => {
//console.log(JSON.stringify(chatUpdate, undefined, 2))
try {
kimkiro = chatUpdate.messages[0]
if (!kimkiro.message) return
kimkiro.message = (Object.keys(kimkiro.message)[0] === 'ephemeralMessage') ? kimkiro.message.ephemeralMessage.message : kimkiro.message
if (kimkiro.key && kimkiro.key.remoteJid === 'status@broadcast') return
if (!belz.public && !kimkiro.key.fromMe && chatUpdate.type === 'notify') return
if (kimkiro.key.id.startsWith('BAE5') && kimkiro.key.id.length === 16) return
if (kimkiro.key.id.startsWith('belz')) return
m = smsg(belz, kimkiro, store)
require("./case")(belz, m, chatUpdate, store)
} catch (err) {
console.log(err)
}
})


belz.ev.process(
async (events) => {
if (events['presence.update']) {
await belz.sendPresenceUpdate('available');
}
if (events['messages.upsert']) {
const upsert = events['messages.upsert'];
for (let msg of upsert.messages) {
if (msg.key.remoteJid === 'status@broadcast') {
if (msg.message?.protocolMessage) return;
await sleep(3000);
await belz.readMessages([msg.key]);
}
}
}
if (events['creds.update']) {
await saveCreds();
}
}
)

return belz
}

belzStart();

let file = require.resolve(__filename);
fs.watchFile(file, () => {
fs.unwatchFile(file);
console.log(chalk.yellowBright(`Latest File Update ${__filename}`));
delete require.cache[file];
require(file);
});
