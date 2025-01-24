const fs = require('fs');
const channelId = require('./config.js');

const messageType = {
    NORMAL: 0,
    TEST_CONNECTION: 1,
    TODAY_RESULT: 2,
    TODAY_RESULT_SELF: 3,
    ONE_DAY_RESULT: 4,
    ONE_DAY_RESULT_SELF: 5,
    PERSONAL_STAT: 6,
    THURSDAY_DEREGISTRATION: 7,
    THURSDAY_REGISTRATION: 8,
    THURSDAY_SHOW_ALL_REGISTRATION: 9,
    THURSDAY_SHOW_ALL_REGISTRATION_SELF: 10,
    DRAW_LOTS_ALL: 11,
    DRAW_LOTS_SELF: 12,
    LUCK: 13,
    TENHOU_NANIKIRU: 14,
    TENHOU_WITH_IMAGE: 15,
    PYSTYLE_NANIKIRU: 16,
    PYSTYLE_HANCALCULATE: 17,
    HELP: 18,
    SATURDAY_DEREGISTRATION: 19,
    SATURDAY_REGISTRATION: 20,
    SATURDAY_SHOW_ALL_REGISTRATION: 21,
    SATURDAY_SHOW_ALL_REGISTRATION_SELF: 22,
    BOTH_REGISTRATION: 23,
    LOGS: 24,
    CLUB_T_DEREGISTRATION: 25,
    CLUB_T_REGISTRATION: 26,
    CLUB_T_SHOW_ALL_REGISTRATION: 27,
    CLUB_T_SHOW_ALL_REGISTRATION_SELF: 28,
    YAKI: 29,
    VOTE: 30,
    VOTERESULT: 31,
    VOTERESULT_SELF: 32,
    UPDATEALLELO: 33,
    THURSDAY_SEATING: 34,
}

const privateMessageType = [ 
    messageType.PERSONAL_STAT, 
    messageType.THURSDAY_DEREGISTRATION, 
    messageType.THURSDAY_REGISTRATION, 
    messageType.THURSDAY_SHOW_ALL_REGISTRATION, 
    messageType.THURSDAY_SHOW_ALL_REGISTRATION_SELF, 
    messageType.SATURDAY_DEREGISTRATION, 
    messageType.SATURDAY_REGISTRATION, 
    messageType.SATURDAY_SHOW_ALL_REGISTRATION, 
    messageType.SATURDAY_SHOW_ALL_REGISTRATION_SELF, 
    messageType.BOTH_REGISTRATION,
    messageType.CLUB_T_DEREGISTRATION,
    messageType.CLUB_T_REGISTRATION,
    messageType.CLUB_T_SHOW_ALL_REGISTRATION,
    messageType.CLUB_T_SHOW_ALL_REGISTRATION_SELF,
 ];

const adminMessageType = [
    messageType.YAKI,
    messageType.UPDATEALLELO,
];

const notTransferMessageType = adminMessageType + [
    messageType.VOTE,
];

var userEmojiMap = {};
const emojiIndices = [
    "🔴", "🔵", "🟤", "🟢", "🟠", "🟣", "🟡", "⚪", "🎱", 
    "🍘", "🌕", "💿", "📀", "⚽", "⚾", "🥎", "🏀", "🏐", "🌑",
    "🌍", "🧭", "🌓", "🕕", "🌐", "⛔", "🔘", "🌗", "⚫",
    "🟥", "🟧", "🟨", "🟩", "🟦", "🟪", "🟫", "⬜", "⬛"];
var userNameMap = {};

function messageTypeSwitcher(message, source){
    let messgaeContent = "";
    let messageFromPrivateGroup=false;
    switch (source) {
        case "discord":
            messgaeContent = message.content.toLowerCase();
            message.channelId === channelId.discordPrivateChannelId ? messageFromPrivateGroup=true : messageFromPrivateGroup=false;
            break;
        case "whatsapp":
            messgaeContent = message.body.toLowerCase();
            message.from === channelId.whatsappGroupId ? messageFromPrivateGroup=true : messageFromPrivateGroup=false;
            break;
    }
    // --- 1 test connection
    if(messgaeContent === '/tsumo') {
        return messageType.TEST_CONNECTION;
    }
    // --- 2 today's result
    else if(messgaeContent === '/result' || messgaeContent === '/r' || messgaeContent === '/result today' || messgaeContent === '/r today' || messgaeContent === '/ergebnis' || messgaeContent === '/e' || messgaeContent === '/ergebnis heute' || messgaeContent === '/e heute') {
        if (messageFromPrivateGroup)
            return messageType.TODAY_RESULT;
        else
            return messageType.TODAY_RESULT_SELF;
    } 
    // --- 3 one day's result
    else if(messgaeContent.startsWith('/result ') || messgaeContent.startsWith('/r ') || messgaeContent.startsWith('/ergebnis ') || messgaeContent.startsWith('/e ')) {
        if (messageFromPrivateGroup)
            return messageType.ONE_DAY_RESULT;
        else
            return messageType.ONE_DAY_RESULT_SELF;
    } 
    // --- 4 personal stat
    else if(messgaeContent.startsWith('/p ')) {
        return messageType.PERSONAL_STAT;
    } 
    // --- 7 thursday show all registration
    else if(messgaeContent === '/donnerstag' || messgaeContent === '/wer') {
        if (messageFromPrivateGroup)
            return messageType.THURSDAY_SHOW_ALL_REGISTRATION;
        else
            return messageType.THURSDAY_SHOW_ALL_REGISTRATION_SELF;
    } 
    // --- 5 thursday deregistration
    else if(messgaeContent.startsWith('/-do ') || messgaeContent.startsWith('/-komm ') || messgaeContent.startsWith('/!komm ') || messgaeContent.startsWith('/unkomm ')) {
        return messageType.THURSDAY_DEREGISTRATION;
    } 
    // --- 6 thursday registration
    else if(messgaeContent.startsWith('/do') || messgaeContent.startsWith('/komm ') || messgaeContent.startsWith('/komm.') || messgaeContent.startsWith('/komm1 ') || messgaeContent.startsWith('/komm2 ')) {
        return messageType.THURSDAY_REGISTRATION;
    } 
    // --- 7 saturday show all registration
    else if(messgaeContent === '/samstag') {
        if (messageFromPrivateGroup)
            return messageType.SATURDAY_SHOW_ALL_REGISTRATION;
        else
            return messageType.SATURDAY_SHOW_ALL_REGISTRATION_SELF;
    } 
    // --- 5 saturday deregistration
    else if(messgaeContent.startsWith('/-sa ') || messgaeContent.startsWith('/!sa ') || messgaeContent.startsWith('/unsa ')) {
        return messageType.SATURDAY_DEREGISTRATION;
    } 
    // --- 6 saturday registration
    else if(messgaeContent.startsWith('/sa') || messgaeContent.startsWith('/sa.')) {
        return messageType.SATURDAY_REGISTRATION;
    } 
    // --- x both registration
    else if(messgaeContent.startsWith('/both ') || messgaeContent.startsWith('/dosa ') || messgaeContent.startsWith('/beide ')) {
        return messageType.BOTH_REGISTRATION;
    }
    // --- 7x club tournament show all registration
    else if(messgaeContent === '/clubturnier') {
        if (messageFromPrivateGroup)
            return messageType.CLUB_T_SHOW_ALL_REGISTRATION;
        else
            return messageType.CLUB_T_SHOW_ALL_REGISTRATION_SELF;
    } 
    // --- 5x club tournament deregistration
    else if(messgaeContent.startsWith('/-clubturnier ') || messgaeContent.startsWith('/!clubturnier ')) {
        return messageType.CLUB_T_DEREGISTRATION;
    } 
    // --- 6x club tournament registration
    else if(messgaeContent.startsWith('/clubturnier ')) {
        return messageType.CLUB_T_REGISTRATION;
    } 
    // --- 8 draw lots
    else if(messgaeContent.startsWith('/auslosen')) {
        if (messageFromPrivateGroup)
            return messageType.DRAW_LOTS_ALL;
        else
            return messageType.DRAW_LOTS_SELF;
    } 
    // --- 9 luck
    else if(messgaeContent === '/keks') {
        return messageType.LUCK;
    } 
    // --- 10 tenhou
    else if(messgaeContent.startsWith('/? ')) {
        return messageType.TENHOU_NANIKIRU;
    }
    // --- 11 tenhou with image
    else if(messgaeContent.startsWith('/?b ')) {
        return messageType.TENHOU_WITH_IMAGE;
    }
    // --- 12 nanikiri
    else if(messgaeContent.startsWith('/?x ')) {
        return messageType.PYSTYLE_NANIKIRU;
    }
    // --- 13 hancalculate
    else if(messgaeContent.startsWith('/?c ')) {
        return messageType.PYSTYLE_HANCALCULATE;
    }
    // --- 14 help
    else if(messgaeContent === '/help' || messgaeContent === '/h' || messgaeContent === '/hilfe') {
        return messageType.HELP;
    } 
    // --- 15 logs
    else if(messgaeContent.startsWith('/log ')) {
        return messageType.LOGS;
    }
    // --- 16 Yakitori
    else if(messgaeContent.startsWith('/yk')) {
        return messageType.YAKI;
    }
    // --- 17 vote
    else if(messgaeContent.startsWith('/vote ') || messgaeContent.startsWith('/abstimmen ')) {
        return messageType.VOTE;
    }
    // --- 18 vote result
    else if(messgaeContent.startsWith('/voteresult') || messgaeContent.startsWith('/abstimmungsergebnis')) {
        if (messageFromPrivateGroup)
            return messageType.VOTERESULT;
        else
            return messageType.VOTERESULT_SELF;
    }
    else if(messgaeContent.startsWith('/updateelo')) {
        return messageType.UPDATEALLELO;
    }
    else if(messgaeContent.startsWith('/seating')){
        return messageType.THURSDAY_SEATING;
    }
    else {
        return messageType.NORMAL;
    }
}

function readUserNameMap() {
    // if file not exist, return
    if (!fs.existsSync('./userNameMap.json')) {
        return;
    }
    fs.readFile('./userNameMap.json', 'utf8', (err, data) => {
        if (err) {
            console.log(err);
            return;
        } else {
            userNameMap = JSON.parse(data);
        }
    });
}


function getUserEmoji(username) {
    if (!userEmojiMap.hasOwnProperty(username)) {
      const index = Object.keys(userEmojiMap).length % emojiIndices.length;
      userEmojiMap[username] = emojiIndices[index];
    }
    return userEmojiMap[username];
}

function updateUserEmojiIndex() {
    userEmojiMap = {};
}

module.exports = {
    messageTypeSwitcher: messageTypeSwitcher,
    getUserEmoji: getUserEmoji,
    readUserNameMap: readUserNameMap,
    updateUserEmojiIndex: updateUserEmojiIndex,
    userNameMap: userNameMap,
    userEmojiMap: userEmojiMap,
    messageType: messageType,
    privateMessageType: privateMessageType,
    adminMessageType: adminMessageType,
    notTransferMessageType: notTransferMessageType
}