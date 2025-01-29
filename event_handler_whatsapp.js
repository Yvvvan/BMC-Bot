const channelId = require('./config.js');
const axios = require('axios');
const fs = require('fs');
const functions = require('./functions.js');

const { messageTypeSwitcher, getUserEmoji } = functions;
var {userNameMap} = functions;
const { messageType, privateMessageType, adminMessageType, notTransferMessageType } = functions;

const useDACH = false;

const mimeToExt = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    // 添加其他 MIME 类型和对应的后缀名
};

module.exports = (discordClient, whatsappClient, messgaeHandle) => {
    // message event
    whatsappClient.on('message_create', async (message) => {
        //if from me, return
        if (message.fromMe) return;
        
        // debug: show whatsapp group id
        if (message.from !== channelId.whatsappGroupId) {console.log("From: " + message.from);}
    
        let thisMessageType = messageTypeSwitcher(message, 'whatsapp');
        
        // get whatapp user name 
        let userName = '';
        try {
            const messageObject = JSON.parse(message);
            userName = messageObject.notifyName;
        } catch (error) {
            userName=JSON.stringify(message) 
            userName=userName.split('"notifyName":"')[1] 
            userName = userName.split('",')[0]
        }
    
        userNameMap[message.author] = userName;
        // console.log(userNameMap);
        fs.writeFileSync('./userNameMap.json', JSON.stringify(userNameMap, null, 4), 'utf8');
    
        // if yaki message, only allow in admin group
        if (adminMessageType.includes(thisMessageType) && 
            message.from !== channelId.whatsappAdminGroupId && 
            message.from !== channelId.whatsappTestGroupId) {
            whatsappClient.sendMessage(message.from, 'Befehl enthält Mitgliederprivatsphäre und kann nicht in öffentlichen Kanälen verwendet werden');
            return;
        }
    
        // if message from main group or notice group, message body not empty and contain '/bot', send it to public discord
        if (!useDACH) {
            
        } else {
            if ((message.from == channelId.whatsappGroupId || 
                message.from == channelId.whatsappNoticeGroupId ) 
                && message.body != '' && message.body.toLowerCase().startsWith("/bot ")) {
                try{
                    discordClient.channels.cache.get(channelId.discordPublicChannelIdDACH).send('[Whatsapp] ' + userName + ': \n' + message.body + '\n---');
                } catch (error) {
                    console.log(error);
                }
            } 
        }
    
        // other messages will be sent to the corresponding private channel
        if (message.body != '' || message.hasMedia) {
            let discordChannelId = '';
            switch (message.from) {
                case channelId.whatsappGroupId:
                    discordChannelId = channelId.discordPrivateChannelId;
                    break;
                case channelId.whatsappNoticeGroupId:
                    discordChannelId = channelId.discordNoticeGroupId;
                    break;
                case channelId.whatsappSeminarGroupId:
                    discordChannelId = channelId.discordSeminarChannelId;
                    break;
                case channelId.whatsappTournamentGroupId:
                    discordChannelId = channelId.discordTournamentChannelId;
                    break;
                case channelId.hatsappNanikiriGroupId:
                    discordChannelId = channelId.discordNanikiriChannelId;
                    break;
                case channelId.whatsappTestGroupId:
                    discordChannelId = channelId.discordTestChannelId;
                    break;
                case channelId.whatsappTeamLigaGroupId:
                    discordChannelId = channelId.discordTeamLigaChannelId;
                    break;
            }
            if (discordChannelId != '') {
                // send attachments to discord
                try{
                    if (message.hasMedia) {
                        const media = await message.downloadMedia();
                        const dataBuffer = Buffer.from(media.data, 'base64');
                        
                        // timestamp as file name
                        let timestamp = new Date().getTime().toString();
                        console.log('mime: ' + media.mimetype);
                        let filename = "";
                        // if media.mimetype in mimeToExt, use it, else use split
                        if (mimeToExt[media.mimetype] === undefined) {
                            filename = timestamp + '.' + media.mimetype.split('/')[1];
                        }
                        else { 
                            filename = timestamp + mimeToExt[media.mimetype];
                        }
                        // check the size of dataBuffer, max = 25MB
                        if (dataBuffer.length > 25 * 1024 * 1024) {
                            discordClient.channels.cache.get(discordChannelId).send('---\n' + getUserEmoji(userName)  + ' ' + userName + ' möchte eine Datei senden, aber die Datei ist zu groß, es kann nicht hier gesendet werden. Bitte senden Sie eine Datei kleiner als 25MB, oder nutzen Sie einen anderen Weg (z.B. shared Google Drive link), um die Datei zu teilen');
                            message.reply('Die Datei ist zu groß, bitte senden Sie eine Datei kleiner als 25MB, bitte nutzen Sie einen anderen Weg (z.B. shared Google Drive link), um die Datei zu teilen');
                            return;
                        }
                        fs.writeFile('./' + filename, dataBuffer, (err) => {
                            if (err) throw err;
                            else {
                       
                                discordClient.channels.cache.get(discordChannelId).send({
                                    files: [{
                                        attachment: './' + filename,
                                        name: filename
                                    }]
                                });
                            }
                        });
                        // discordClient.channels.cache.get(discordChannelId).send('');
                    }
                } catch (error) {
                    console.log(error);
                }
                // send message to discord
                try{
                    discordClient.channels.cache.get(discordChannelId).send('---\n' + getUserEmoji(userName) + ' ' + userName + ': \n' + message.body );
                    
                } catch (error) {
                    console.log(error);
                }
            }
        } 
            
        // handle message
        messgaeHandle(message, thisMessageType, "whatsapp");
    });

    // reaction event
    whatsappClient.on('message_reaction', async (message) => {
        // console.log(message);
    
        // if from me, return
        if (message.id.fromMe) return;
        
        let discordChannelId = '';
        switch (message.id.remote) {
            case channelId.whatsappGroupId:
                discordChannelId = channelId.discordPrivateChannelId;
                break;
            case channelId.whatsappNoticeGroupId:
                discordChannelId = channelId.discordPrivateChannelId;
                break;
            case channelId.whatsappSeminarGroupId:
                discordChannelId = channelId.discordSeminarChannelId;
                break;
            case channelId.whatsappTournamentGroupId:
                discordChannelId = channelId.discordTournamentChannelId;
                break;
            case channelId.hatsappNanikiriGroupId:
                discordChannelId = channelId.discordNanikiriChannelId;
                break;
            case channelId.whatsappTestGroupId:
                discordChannelId = channelId.discordTestChannelId;
                break;
            case channelId.whatsappTeamLigaGroupId:
                discordChannelId = channelId.discordTeamLigaChannelId;
                break
        }
    
        if (discordChannelId == '') {
            return;
        }
    
        
        let messageId = message.msgId;
    
        let originalMessage = "";
        try{ 
            originalMessage = await whatsappClient.getMessageById(messageId._serialized);
        } catch (error) {
            try {
                originalMessage = await whatsappClient.getMessageById(messageId._serialized);
            } catch (error) {
                console.log(error);
                whatsappClient.sendMessage(channelId.whatsappTestGroupId, 'Error: ' + error);
                whatsappClient.sendMessage(channelId.whatsappTestGroupId, 'vote: ' + message.senderId + ' ' + message.reaction);
            }
        }
    
        let reaction = message.reaction;
        if (reaction === '') {
            return;
        }
    
        // // if the reaction is made on a message containing "/vote" or "/abstimmen"
        // if (originalMessage.body.toLowerCase().includes("/vote") || originalMessage.body.toLowerCase().includes("/abstimmen")) {
        //     let userName = '';
        //     if (userNameMap[message.senderId]) {
        //         userName = userNameMap[message.senderId];
        //     } else {
        //         userName = message.senderId;
        //     }
    
        //     console.log('vote from whatsapp');
        //     console.log('%s %s %s', userName, reaction, messageId._serialized);
    
        //     axios.get('https://berlin-mahjong.club/interface/botFunctions.php', {
        //         httpsAgent: agent,
        //         params: {
        //             typ: "vote",
        //             msg: "vote",
        //             user: userName,
        //             vote: reaction,
        //             id: messageId._serialized,
        //         },
        //     })
        //     .then(response => {
        //         console.log(response.data);
        //     })
        //     .catch(error => {
        //         console.error(error);
        //     });
    
        // }
        // else {
    
            let userName = '';
            if (userNameMap[message.senderId]) {
                userName = userNameMap[message.senderId];
            } else {
                userName = 'Ein Mitglied';
            }
    
            let info = '> '+originalMessage.body.split('\n')[0];
            if (originalMessage.body.split('\n')[1]) {
                info = info + '\n'+ '> '+ originalMessage.body.split('\n')[1];
            }
            if (info === '> ') {
                // if has attachments
                if (originalMessage.hasMedia) {
                    info = '> einer Mediendatei';
                }
            }
    
            let text = getUserEmoji(userName) + ' ' +userName + ' hat ' + reaction + ' auf\n' + info;
    
            try {
                discordClient.channels.cache.get(discordChannelId).send('---\n' + text )
                // .then(msg => console.log(`Sent message: ${JSON.stringify(msg)}`))
                .catch(console.error);
                console.log();
            } catch (error) {
                console.log(error);
            }
        // }
    
    });
}