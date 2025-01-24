const { Client:DiscordClient, IntentsBitField, ModalAssertions, Partials  } = require('discord.js');
const { Client:WhatsAppClient, LocalAuth, NoAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const axios = require('axios');
const https = require('https');
const async = require('async');
const schedule = require('node-schedule');
const { exec } = require('child_process');
const fs = require('fs');

// a random Fortune Cookies generator
const lucky = require('./src/luck');
const luckyStoneKeys = Object.keys(lucky.luckyStone);

// bot instruction
const instruction = require('./src/instruction');

// use tenhou to calculate nanikiri
const tenhou=require('./src/tenhou');

// use to generate tiles image
const makeImg=require('./src/makeImg');

// event handler
const discordEventHandler = require('./event_handler_discord.js');
const whatsappEventHandler = require('./event_handler_whatsapp.js');

// emoji map
const functions = require('./functions.js');

// messageType
const { messageType, privateMessageType, adminMessageType, notTransferMessageType } = functions;

const config = require('./config.js');


// ------------------ Clinet ------------------
const discordClient = new DiscordClient({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.GuildMessageReactions,
        IntentsBitField.Flags.MessageContent,
    ],
    partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});
discordClient.on('ready', (c) => {
    console.log(`✅ ${c.user.tag} is online.`);
});
discordClient.login(config.discordSecret);

// ----------- discord↑ whatsapp↓ ---------------

// const whatsappClient = new WhatsAppClient({
//     authStrategy: new LocalAuth({ clientId: "ultrabot" }),
//     // authStrategy: new NoAuth(),
// });
// const whatsappClient = new Client({
//     webVersionCache: 
//     {
//       remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2402.5.html',
//       type: 'remote' 
//     } 
//   })



const whatsappClient = new WhatsAppClient({
    authStrategy: new LocalAuth({
        dataPath: "sessions",
    }),
    webVersionCache: {
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2413.51-beta.html',
    }
});

// const whatsappClient = new WhatsAppClient();

// const whatsappClient = new WhatsAppClient({
//     authStrategy: new LocalAuth(),
//     puppeteer: {
//         headless: true,
//         args: [ '--no-sandbox', '--disable-gpu', ],
//     },
//     webVersionCache: { type: 'remote', remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html', }
// });


whatsappClient.once('ready', () => {
    console.log(`✅ Whatsapp-Bot is online.`);
});
whatsappClient.on('qr', qr => {
    qrcode.generate(qr, {small: true});
});
whatsappClient.initialize();
// ----------------- Clinet END ------------------

// ----------------- Help Function ------------------
var printTimer; 
var printTimerSa; 
var printTimerClubT;

functions.readUserNameMap();

const emojiMap = {
    '0': '0️⃣',
    '1': '1️⃣',
    '2': '2️⃣',
    '3': '3️⃣',
    '4': '4️⃣',
    '5': '5️⃣',
    '6': '6️⃣',
    '7': '7️⃣',
    '8': '8️⃣',
    '9': '9️⃣',
};

async function testSyncMsg(msg) {
    let discordmsg = '';
    let whatsappmsg = '';
    try {
        await whatsappClient.sendMessage(whatsappTestGroupId, msg)
        .then((message) => { 
            whatsappmsg = message.id._serialized; 
            // console.log('whatsappmsg:', whatsappmsg);
        })
        .catch(console.error);
        await discordClient.channels.cache.get(discordTestChannelId).send(msg)
        .then((message) => { 
            discordmsg = message.id; 
            // open a thread for this message
            message.startThread({
                // name New Vote + Date Time
                name: 'New Vote ' + new Date().toLocaleString(),
                reason: 'a new vote was created by a club member. thread automatically created by the bot. time is utc, and I do not want to convert it to local time.😂',
            })
            .then(thread => {
                //send initial message
                thread.send('<@everyone> Please vote for the options below by clicking the corresponding emoji.');
            })
            // console.log('discordmsg:', discordmsg);
        })
        .catch(console.error);
    } catch (error) {
        console.log(error);
    }
    return { discordmsg, whatsappmsg };
}

async function sendSyncMsg(msg) {
    let discordmsg = '';
    let whatsappmsg = '';
    try {
        await whatsappClient.sendMessage(whatsappGroupId, msg)
        .then((message) => { 
            whatsappmsg = message.id._serialized; 
            // console.log('whatsappmsg:', whatsappmsg);
        })
        .catch(console.error);
        await discordClient.channels.cache.get(discordPrivateChannelId).send(msg)
        .then((message) => { 
            discordmsg = message.id; 
            // console.log('discordmsg:', discordmsg);
        })
        .catch(console.error);
    } catch (error) {
        console.log(error);
    }
    return { discordmsg, whatsappmsg };
}

async function sendRegListMsg(msg) {
    let discordmsg = '';
    try {
        await discordClient.channels.cache.get(discordRegListChannelId).send(msg)
        .then((message) => {
            discordmsg = message.id;
        })
        .catch(console.error);
    } catch (error) {
        console.log(error);
    }
    return { discordmsg };
}

function deleteCachedImage() {
    console.log('🗑 delete Cached Image');
    // read all files in the directory
    fs.readdir('./', (err, files) => {
        if (err) {
            console.log(err);
            return;
        } else {
            files.forEach(file => {
                if (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.gif')){
                    fs.unlink(file, (err) => {
                        if (err) {
                            console.log(err);
                            return;
                        }
                    });
                }
            });
        }
    });
    console.log('🗑 delete Cached Image done');
}

function readUpdateFile() {
    if (!fs.existsSync('./update.md')) {
        return;
    }
    fs.readFile('./update.md', 'utf8', (err, data) => {
        if (err) {
            console.log(err);
            return;
        } else {
            // if data is empty or only blanks, return
            if (data === '' || data.trim() === '') {
                return;
            }
            try {
                sendSyncMsg(data);
            } catch (error) {
                console.log(error);
            }
        }
    });
    // delete the file
    fs.unlink('./update.md', (err) => {
        if (err) {
            console.log(err);
            return;
        }
    });
}



const agent = new https.Agent({
    rejectUnauthorized: false
});
// ------------------ Help Function END ------------------

// ------------------ Command ------------------
function lastCallThursday() {
    showAllReg(messageType.THURSDAY_SHOW_ALL_REGISTRATION, null);
}

function lastCallSaturday() {
    showAllReg(messageType.SATURDAY_SHOW_ALL_REGISTRATION, null);
}

function weeklyReminder() {
    let message = '🀄 Anmeldungen für /do und /sa, bitte!\n📅 Bitte beachtet den Kalender (https://berlin-mahjong.club/cal).';
    sendSyncMsg(message);
}

function showAllReg(msgType, message) {
    let thisUrl = (msgType === messageType.THURSDAY_SHOW_ALL_REGISTRATION || msgType === messageType.THURSDAY_SHOW_ALL_REGISTRATION_SELF) ? 'regThursday.php' : 'regSaturday.php';
    if (msgType === messageType.CLUB_T_SHOW_ALL_REGISTRATION || msgType === messageType.CLUB_T_SHOW_ALL_REGISTRATION_SELF) {
        thisUrl = 'regClubT.php';
    }
    axios.get(config.serverInterface + thisUrl, {
        httpsAgent: agent,
    })
        .then(response => {
            if (msgType === messageType.THURSDAY_SHOW_ALL_REGISTRATION || msgType === messageType.SATURDAY_SHOW_ALL_REGISTRATION || msgType === messageType.CLUB_T_SHOW_ALL_REGISTRATION) {
                if (msgType === messageType.THURSDAY_SHOW_ALL_REGISTRATION) {
                    if (printTimer) {
                        clearTimeout(printTimer);
                    }
                } else if (msgType === messageType.SATURDAY_SHOW_ALL_REGISTRATION) {
                    if (printTimerSa) {
                        clearTimeout(printTimerSa);
                    }
                } else if (msgType === messageType.CLUB_T_SHOW_ALL_REGISTRATION) {
                    if (printTimerClubT) {
                        clearTimeout(printTimerClubT);
                    }
                }
                if (response.data.includes('Error')) {
                    
                } else {
                    if (message === null) {
                        const lines = response.data.trim().split('\n');
                        const secondLastLine = lines[lines.length - 2];
                        const numbers = secondLastLine.match(/\d+/g); 
                        let currentRegPlayerNum = 0;
                        if (numbers && numbers.length >= 2) {
                            currentRegPlayerNum = Math.max(parseInt(numbers[0]), parseInt(numbers[1]));
                        }
                        if ( currentRegPlayerNum%4 != 0 ) {
                            sendSyncMsg("Last Call 🙋‍♀️🙋‍♂️");
                            sendSyncMsg(response.data);
                        }
                    } else {
                        sendSyncMsg(response.data);
                    }
                }
            } else {
                message.reply(response.data);
            }
        })
        .catch(error => {
            console.log(error);
        });
}

function messgaeHandle(message, msgType, source){
    // differce1: discord: message.content, whatsapp: message.body
    let messageContent = "";
    let messageContentOrignal = "";
    switch (source) {
        case "discord":
            messageContent = message.content.toLowerCase();
            messageContentOrignal = message.content;
            break;
        case "whatsapp":
            messageContent = message.body.toLowerCase();
            messageContentOrignal = message.body;
            break;
    }

    // --- 1 test connection
    if(msgType === messageType.TEST_CONNECTION) {
		message.reply('🀄 Anmeldungen für /do und /sa, bitte!\n📅 Bitte beachtet den Kalender (https://berlin-mahjong.club/cal).');
	} 
    
    // --- 2 today's result
    else if(msgType === messageType.TODAY_RESULT || msgType === messageType.TODAY_RESULT_SELF) {
        axios.get(config.serverInterface+'getResult.php', {
            httpsAgent: agent,
        })
        .then(response => {
            if (msgType === messageType.TODAY_RESULT) {
                sendSyncMsg(response.data);
            } else {
                message.reply(response.data);
            }
        })
        .catch(error => {
            message.reply('Es gibt noch keine Ergebnisse heute.');
            console.log(error);
        });
    } 
    
    // --- 3 one day's result
    else if(msgType === messageType.ONE_DAY_RESULT || msgType === messageType.ONE_DAY_RESULT_SELF) {
        let request_date = messageContent.split(' ')[1];
        axios.get(config.serverInterface+'getResult.php', {
            httpsAgent: agent,
            params: {
                request_date: request_date
            }
        })
        .then(response => {
            message.reply(response.data);
        })
        .catch(error => {
            message.reply('Es gibt keine Ergebnisse für dieses Datum:'.request_date);
            console.log(error);
        });
    } 

    // --- 4 personal stat
    else if(msgType === messageType.PERSONAL_STAT) {
        let names = messageContent.split(' ');
        axios.get(config.serverInterface+'getPersonalStat.php', {
            httpsAgent: agent,
            params: {
                search: names[1]
            }
        })
        .then(response => {
            if (source === "discord") {
                message.reply(response.data);
            } else if (source === "whatsapp") {
                //if author is undefined send reply
                if (message.author === undefined) {
                    message.reply(response.data);
                } else { // else send private message
                    message.react('📨');
                    whatsappClient.sendMessage(message.author, response.data);
                } 
            }
        })
        .catch(error => {
            console.log(error);
        });

    } 
    
    // --- 5 deregistration
    else if(msgType === messageType.THURSDAY_DEREGISTRATION || msgType === messageType.SATURDAY_DEREGISTRATION || msgType === messageType.CLUB_T_DEREGISTRATION) {
        let names = messageContent.split(' ');
        names.shift();
        let thisUrl = (msgType === messageType.THURSDAY_DEREGISTRATION) ? 'regThursday.php' : 'regSaturday.php';
        if (msgType === messageType.CLUB_T_DEREGISTRATION) {
            thisUrl = 'regClubT.php';
        }
        axios.get(config.serverInterface + thisUrl, {
            httpsAgent: agent,
            params: {
                delete: names
            }
        })
        .then(response => {
            // message.reply(response.data);
            message.react('✅');
            if (msgType === messageType.THURSDAY_DEREGISTRATION) {
                if (printTimer) {
                    clearTimeout(printTimer);
                }
            } else if (msgType === messageType.SATURDAY_DEREGISTRATION) {
                if (printTimerSa) {
                    clearTimeout(printTimerSa);
                }
            } else if (msgType === messageType.CLUB_T_DEREGISTRATION) {
                if (printTimerClubT) {
                    clearTimeout(printTimerClubT);
                }
            }
            sendSyncMsg(response.data);
            sendRegListMsg(response.data);
        })
        .catch(error => {
            console.log(error);
        });
    } 
    
    // --- 6 registration
    else if(msgType === messageType.THURSDAY_REGISTRATION || msgType === messageType.SATURDAY_REGISTRATION || msgType === messageType.BOTH_REGISTRATION || msgType === messageType.CLUB_T_REGISTRATION) {
        let names = messageContent.split(' ');
        let round = [0, 0, 0];
        if (names[0].includes('1') || names[0].includes('2') || names[0].includes('3')) {
            if (names[0].includes('1')) {
                round[0] = 1;
            } 
            if (names[0].includes('2')) {
                round[1] = 1;
            } 
            if (names[0].includes('3')) {
                round[2] = 1;
            }
        }
        else {
            round = [1,1,1];
        }
        names.shift();

        for ( let thisUrl of ['regThursday.php', 'regSaturday.php', 'regClubT.php']) {
            if (msgType === messageType.THURSDAY_REGISTRATION && thisUrl != 'regThursday.php') {
                continue;
            } else if (msgType === messageType.SATURDAY_REGISTRATION && thisUrl != 'regSaturday.php') {
                continue;
            } else if (msgType === messageType.CLUB_T_REGISTRATION && thisUrl != 'regClubT.php') {
                continue;
            } else if (msgType === messageType.BOTH_REGISTRATION && thisUrl === 'regClubT.php') {
                continue;
            }
            axios.get(config.serverInterface + thisUrl, {
                httpsAgent: agent,
                params: {
                    names: names,
                    round1: round[0],
                    round2: round[1],
                    round3: round[2]
                }
            })
            .then(response => {
                if (response.data.includes('Error')) {
                    message.react('❌');
                    message.reply('Fällt aus. Anmeldung nicht möglich.');
                } else {
                    message.react('🀄');
                    const lines = response.data.trim().split('\n');
                    const secondLastLine = lines[lines.length - 2];
                    const numbers = secondLastLine.match(/\d+/g); 
                    let currentRegPlayerNum = 0;
                    if (numbers && numbers.length >= 1) {
                        currentRegPlayerNum = Math.max(parseInt(numbers[0]), parseInt(numbers[1]));
                    }

                    if ( currentRegPlayerNum%4 === 0 ) {
                        if (thisUrl === 'regThursday.php') {
                            if (printTimer) {
                                clearTimeout(printTimer);
                            }
                        } else  if (thisUrl === 'regSaturday.php') {
                            if (printTimerSa) {
                                clearTimeout(printTimerSa);
                            }
                        } else if (thisUrl === 'regClubT.php') {
                            if (printTimerClubT) {
                                clearTimeout(printTimerClubT);
                            }
                        }
                        sendSyncMsg(response.data);
                        sendRegListMsg(response.data);
                    } else {
                        if (thisUrl === 'regThursday.php') {
                            if (printTimer) {
                                clearTimeout(printTimer);
                            }
                            printTimer = setTimeout(() => {
                                sendSyncMsg(response.data);
                                sendRegListMsg(response.data);
                            }, 30 * 60 * 1000); // 30 分钟的毫秒数
                        } else if (thisUrl === 'regSaturday.php') {
                            if (printTimerSa) {
                                clearTimeout(printTimerSa);
                            }
                            printTimerSa = setTimeout(() => {
                                sendSyncMsg(response.data);
                                sendRegListMsg(response.data);
                            }
                            , 30 * 60 * 1000); // 30 分钟的毫秒数
                        } else if (thisUrl === 'regClubT.php') {
                            if (printTimerClubT) {
                                clearTimeout(printTimerClubT);
                            }
                            printTimerClubT = setTimeout(() => {
                                sendSyncMsg(response.data);
                                sendRegListMsg(response.data);
                            }
                            , 30 * 60 * 1000); // 30 分钟的毫秒数
                        }
                    }
                }
            })
            .catch(error => {
                console.log(error);
            });
        }
    } 
        
    // --- 7 show all registration
    else if(msgType === messageType.THURSDAY_SHOW_ALL_REGISTRATION || msgType === messageType.THURSDAY_SHOW_ALL_REGISTRATION_SELF ||
            msgType === messageType.SATURDAY_SHOW_ALL_REGISTRATION || msgType === messageType.SATURDAY_SHOW_ALL_REGISTRATION_SELF || 
            msgType === messageType.CLUB_T_SHOW_ALL_REGISTRATION || msgType === messageType.CLUB_T_SHOW_ALL_REGISTRATION_SELF) {
        showAllReg(msgType, message);
    } 
    
    // --- 8 draw lots
    else if(msgType === messageType.DRAW_LOTS_SELF || msgType === messageType.DRAW_LOTS_ALL) {
        let yakus = messageContent.split('\n');
        let num = parseInt(yakus[0].split(' ')[1]);
        // if not number, return
        if (isNaN(num) || num < 1 ) { num = 3;}
        yakus.shift();
        if (yakus.length < num) {
            message.reply('Bitte mindestens '+(num+1)+' Elemente eingeben.');
        }
        // generate 3 different random number between 0 and yakus.length
        let randoms = [];
        while(randoms.length < num){
            let r = Math.floor(Math.random() * yakus.length);
            if(randoms.indexOf(r) === -1) randoms.push(r);
        }
        let str = '```';
        str += 'Die '+num+' zufällig ausgewählte Option(en):';
        for(let i = 0; i < num; i++) {
            str += '\n' + yakus[randoms[i]];
        }
        str += '```';

        if (msgType === messageType.DRAW_LOTS_ALL) {
            sendSyncMsg(str);
        } else {
            message.reply(str);
        }
    } 
    
    // --- 9 luck
    else if(msgType === messageType.LUCK) {
        // luck stone
        let randomIndex = Math.floor(Math.random() * luckyStoneKeys.length);
        let key = luckyStoneKeys[randomIndex];
        let stone = lucky.luckyStone[key];
        // luck yaku and grade
        let randomNumber = Math.floor(Math.random() * 100); // 生成 0 到 99 的随机数
        let yakunum = 0;
        let grade = 0;
        if (randomNumber < 40) { // 0-7: 40% 的概率
            yakunum =  Math.floor(Math.random() * 8); // 生成 0 到 7 的随机数
            grade = 3;
        } else if (randomNumber < 70) { // 8-14: 30% 的概率
            yakunum =   Math.floor(Math.random() * 7) + 8; // 生成 8 到 14 的随机数
            grade = 4;
        } else if (randomNumber < 90) { // 15-21: 20% 的概率
            yakunum =   Math.floor(Math.random() * 7) + 15; // 生成 15 到 21 的随机数
            grade = 5;
        } else { // 22-43: 10% 的概率
            yakunum =   Math.floor(Math.random() * 22) + 22; // 生成 22 到 43 的随机数
            grade = 6;
        }
        let yaku = lucky.luckyYaku[yakunum.toString()];
        if(yaku.length > 12) { yaku = '\n  ' + yaku; }
        // luck grade
        const coef = Math.random(); // 生成 0 到 1 之间的随机数
        if (coef < 0.05) { // -2 或 +2: 5% 的概率
            grade += Math.random() < 0.5 ? -2 : 2;
        } else if (coef < 0.25) { // -1 或 +1: 20% 的概率
            grade += Math.random() < 0.5 ? -1 : 1;
        } else { // 0: 60% 的概率
            grade += 0;
        } 
        if (grade < 0) { grade = 0; }
        if (grade > 7 || yakunum === 32 || yakunum === 37) { grade = 7; }

        let stars = ''
        for (let i = 0; i < grade; i++) {
            stars += '★';
        }
        for (let i = 0; i < 7 - grade; i++) {
            stars += '☆';
        }
        // luck kuji
        let kuji = lucky.luckyKuji[grade.toString()];
        // luck sentence
        let sentence = lucky.luckySentence[Math.floor(Math.random() * lucky.luckySentence.length)];
        // output
        let str = '🀄';
        str += kuji + '\n';
        str += stars + '\n';
        str += 'Glücksyaku: ' + yaku + '\n';
        str += 'Glücksstein: ' + stone + ' ' + key + '\n';
        str += '---------- 🥠 ----------\n';
        str += '```' + sentence + '```';
        message.reply(str);
    } 

    // --- 10 tenhou
    else if(msgType === messageType.TENHOU_NANIKIRU) {
        let question = messageContent.split(' ')[1];
        message.reply(tenhou.fa(question));

    }

    // --- 11 tenhou with image
    else if(msgType === messageType.TENHOU_WITH_IMAGE) {
        let question = messageContent.split(' ')[1];
        makeImg.makeImg(question);
        message.reply(tenhou.fa(question))
        setTimeout(() => {
            const media = MessageMedia.fromFilePath('./mergedImage.png');
            message.reply(media);
          }, 1000); 
    }

    // --- 12 nanikiri
    else if(msgType === messageType.PYSTYLE_NANIKIRU) {
        let question = "";
        let question_split = messageContent.split(' ');
        for (let i = 0; i < question_split.length; i++) {
            if (i === 0) {
                
            } else {
                question += " " + question_split[i];
            }
        }
        exec('./mahjong-cpp/efficiency'+question, (error, stdout, stderr) => {
            if (error) {
                message.reply(`command: \n\n /?x <concealed> (<melded> <turns> <wind> <wind> <dora_indi>)`);
                return;
            }
            if (stderr) {
                message.reply(`command: \n\n /?x <concealed> (<melded> <turns> <wind> <wind> <dora_indi>)`);
                return;
            }
            message.reply(`${stdout}`);
          });
    }

    // --- 13 hancalculate
    else if(msgType === messageType.PYSTYLE_HANCALCULATE) {
        let question = "";
        let question_split = messageContent.split(' ');
        for (let i = 0; i < question_split.length; i++) {
            if (i === 0) {
                
            } else {
                question += " " + question_split[i];
            }
        }
        exec('./mahjong-cpp/hancalculate '+question, (error, stdout, stderr) => {
            if (error) {
                message.reply(`command: \n\n /?c <concealed> <melded> <win_tile> (<tsumo/ron> <round_wind> <seat_wind>)`);
                return;
            }
            if (stderr) {
                message.reply(`command: \n\n /?c <concealed> <melded> <win_tile> (<tsumo/ron> <round_wind> <seat_wind>)`);
                return;
            }
            message.reply(`${stdout}`);
          });
    }

    // --- 14 help
    else if(msgType === messageType.HELP) {
        // fetch from server
        axios.get(config.serverInterface+'botHelp.php', {
            httpsAgent: agent,
        })
        .then(response => {
            message.reply(response.data);
        })
    } 

    // --- 15 logs
    else if(msgType === messageType.LOGS) {
        let param1 = messageContent.split(' ')[1];
        let param2 = messageContent.split(' ')[2];
        let params = {};
        if (param1 === 'w') {
            params = {
                typ: "logs",
                choose: 1,
                name: param2,
            };
        } else if (param1 === '#') {
            params = {
                typ: "logs",
                query: 1,
                name: param2,
            };
        }
        else {
            params = {
                typ: "logs",
                name: param1,
                log_url: param2,
            };
            message.react('📑');
        }
        axios.get(config.serverInterface+'botFunctions.php', {
                httpsAgent: agent,
                params: params,
            })
            .then(response => {
                if (response.data != '') {
                    message.reply(response.data);
                }
                if (param1 === '#') {
                    if (response.data > 9) {
                        message.react('🔟');
                    } else {
                        message.react(emojiMap[response.data]);
                    }
                }
            })
            .catch(error => {
                console.log(error);
            });
    }
    // --- 16 Yakitori
    else if(msgType === messageType.YAKI) {
        // /yk
        // /yk -p
        // /yk s <name>
        // /yk p pwd <id1> <id2> <id3> <id4> ...
        // /yk c <id>

        // let parts = messageContent.split(" ");

        // // 获取第二个字符串
        // let secondString = parts[1];
        // let params = {};

        // // 区分四种指令
        // if (parts[0] === "/yk") {
        //     if (secondString === "-p") {
        //         params = {
        //             operator: "pay",
        //         };
        //     } else if (secondString === "s") {
        //         let name = parts[2];
        //         params = {
        //             operator: "search",
        //             name: name,
        //         };
        //     } else if (secondString === "p") {
        //         let pwd = parts[2];
        //         let ids = parts.slice(3);
        //         params = {
        //             operator: "pay",
        //             password: pwd,
        //             name: ids,
        //         };
        //     } else if (secondString === "c") {
        //         let id = parts[2];
        //         params = {
        //             operator: "cancel",
        //             name: id,
        //         };
        //     } else {
        //         params = {
        //             operator: "search",
        //         };
        //     }
        //     axios.get(config.serverInterface+'updateYakitori.php', {
        //         httpsAgent: agent,
        //         params: params,
        //     })
        //     .then(response => {
        //         message.reply(response.data);
        //     })
        // } else {
        //     message.reply('unknown command');
        // }
    }
    // --- 17 vote
    else if(msgType === messageType.VOTE) {
        // axios.get(config.serverInterface+'botFunctions.php', {
        //     httpsAgent: agent,
        //     params: {
        //         typ: "vote",
        //         msg: "init",
        //         txt: messageContentOrignal,
        //     },
        // })
        // .then(response => {
        //     sendSyncMsg(response.data.message)
        //     .then(MsgIds => {
        //         axios.get(config.serverInterface+'botFunctions.php', {
        //             httpsAgent: agent,
        //             params: {
        //                 typ: "vote",
        //                 msg: "update_id",
        //                 id: response.data.insert_id,
        //                 discord: MsgIds['discordmsg'],
        //                 whatsapp: MsgIds['whatsappmsg'],
        //             },
        //          }).then(response => {
        //             // console.log(response.data);
        //         });
        //         // delete message
        //         message.delete(true);
        //     })
        // })
    }
    // --- 18 vote result
    else if(msgType === messageType.VOTERESULT || msgType === messageType.VOTERESULT_SELF) {
        // id = messageContent.split(' ')[1];
        // axios.get(config.serverInterface+'botFunctions.php', {
        //     httpsAgent: agent,
        //     params: {
        //         typ: "vote",
        //         msg: "result",
        //         id: id,
        //     },
        // })
        // .then(response => {
        //     if (msgType === messageType.VOTERESULT) {
        //         sendSyncMsg(response.data);
        //     }
        //     else {
        //         message.reply(response.data);
        //     }
        // })
    }
    else if (msgType === messageType.UPDATEALLELO) {
        axios.post(config.serverInterface+'updateELO.php', {
            httpsAgent: agent,
        })
        .then(response => {
            message.reply(response.data);
        }).catch(error => {
            console.log(error);
        });
    }
    else if (msgType === messageType.THURSDAY_SEATING){
        axios.post(config.serverInterface+'R1Seating.php', {
            httpsAgent: agent,
        })
        .then(response => {
            message.reply(response.data);
        }).catch(error => {
            console.log(error);
        });
    }
}


// ------------------ Event ------------------
discordEventHandler(discordClient, whatsappClient,messgaeHandle);
whatsappEventHandler(discordClient, whatsappClient, messgaeHandle);


// 重置 聊天emoji 标记
const scheduleRule = new schedule.RecurrenceRule();
scheduleRule.dayOfWeek = 5; // 1表示周一
scheduleRule.hour = 0;
scheduleRule.minute = 30;
scheduleRule.second = 30;
const job = schedule.scheduleJob(scheduleRule, functions.updateUserEmojiIndex);

// 每天的0:30
const scheduleRule1 = new schedule.RecurrenceRule();
scheduleRule1.hour = 0;
scheduleRule1.minute = 30;
scheduleRule1.second = 0;
const job1 = schedule.scheduleJob(scheduleRule1, deleteCachedImage);

// 每周五的10am
const scheduleRule4 = new schedule.RecurrenceRule();
scheduleRule4.dayOfWeek = 5; // 5表示周五
scheduleRule4.hour = 9;
scheduleRule4.minute = 0;
scheduleRule4.second = 0;
// const job4 = schedule.scheduleJob(scheduleRule4, readUpdateFile);

// 每周一的10am weeklyReminder
const scheduleRule5 = new schedule.RecurrenceRule();
scheduleRule5.dayOfWeek = 1; // 1表示周一
scheduleRule5.hour = 8;
scheduleRule5.minute = 0;
scheduleRule5.second = 0;
const job5 = schedule.scheduleJob(scheduleRule5, weeklyReminder);

// 每周四的4pm
const scheduleRule2 = new schedule.RecurrenceRule();
scheduleRule2.dayOfWeek = 4; // 4表示周四
scheduleRule2.hour = 15; // 16表示下午4点
scheduleRule2.minute = 0;
scheduleRule2.second = 0;
const job2 = schedule.scheduleJob(scheduleRule2, lastCallThursday);

// 每周六的11am
const scheduleRule3 = new schedule.RecurrenceRule();
scheduleRule3.dayOfWeek = 6; // 6表示周六
scheduleRule3.hour = 10;
scheduleRule3.minute = 0;
scheduleRule3.second = 0;
const job3 = schedule.scheduleJob(scheduleRule3, lastCallSaturday); 