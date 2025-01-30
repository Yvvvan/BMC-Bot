const channelId = require('./config.js');
const axios = require('axios');
const fs = require('fs');
const functions = require('./functions.js');
const { MessageMedia } = require('whatsapp-web.js');


const { messageTypeSwitcher, getUserEmoji } = functions;
var {userNameMap} = functions;
const { messageType, privateMessageType, adminMessageType, notTransferMessageType } = functions;

const useDACH = false;

module.exports = (discordClient, whatsappClient, messgaeHandle) => {
    // message event
    discordClient.on('messageCreate', (message) => {
        // if from me, return
        if (message.author.id === discordClient.user.id) return;
    
        // if not in known channel, return
        if (!(message.channelId == channelId.discordPublicChannelIdDACH || 
                    message.channelId == channelId.discordPrivateChannelId || 
                    message.channelId == channelId.discordSeminarChannelId || 
                    message.channelId == channelId.discordNanikiriChannelId ||
                    message.channelId == channelId.discordTestChannelId ||
                    message.channelId == channelId.discordTeamLigaChannelId ||
                    message.channelId == channelId.discordTournamentChannelId ||
                    message.channelId == channelId.discordBotChannelId ))
                    return;
    
        let thisMessageType = messageTypeSwitcher(message, 'discord');
    
        // get discord user name   
        let userName = message.member.displayName || message.author.globalName;
        userNameMap[message.author.globalName] = userName;
        // save userName to userNameMap.json
        fs.writeFileSync('./userNameMap.json', JSON.stringify(userNameMap, null, 4), 'utf8');
    
        // not allowed to handel admin message in discord
        if (adminMessageType.includes(thisMessageType)) {
            message.reply('Befehl enthält Mitgliederprivatsphäre und kann nicht in öffentlichen Kanälen verwendet werden');
            return;
        }
        
        // message from DACH
        if (message.channelId === channelId.discordPublicChannelIdDACH) {
            if (!useDACH) {
                return;
            }
            else {
                // not allowed to handel private message in public channel
                if (privateMessageType.includes(thisMessageType)) {
                    message.reply('Befehl enthält Mitgliederprivatsphäre und kann nicht in öffentlichen Kanälen verwendet werden');
                    return;
                }
    
                // not empty and contain '/bot', send it to whatsapp
                if (message.content != '' && message.content.toLowerCase().startsWith("/bot ")) {
                    try {
                        whatsappClient.sendMessage(channelId.whatsappGroupId, getUserEmoji(userName) + ' ' +  userName + ': \n' + message.content);
                    } catch (error) {
                        console.log(error);
                    }
                }
            }
        }
        
        // if from private channels, not empty, send it to whatsapp
        if (message.content != '' || message.attachments.size > 0){
            let whatsappChannelId = '';
            switch (message.channelId) {
                case channelId.discordPrivateChannelId:
                    whatsappChannelId = channelId.whatsappGroupId;
                    break;
                case channelId.discordSeminarChannelId:
                    whatsappChannelId = channelId.whatsappSeminarGroupId;
                    break;
                case channelId.discordNanikiriChannelId:
                    whatsappChannelId = channelId.whatsappNanikiriGroupId;
                    break;
                case channelId.discordTestChannelId:
                    whatsappChannelId = channelId.whatsappTestGroupId;
                    break;
                case channelId.discordTeamLigaChannelId:
                    whatsappChannelId = channelId.whatsappTeamLigaGroupId;
                    break;
                case channelId.discordTournamentChannelId:
                    whatsappChannelId = channelId.whatsappTournamentGroupId;
                    break;
            }
    
            // send attachments to whatsapp
            if (whatsappChannelId != '') {
                console.log("size:" + message.attachments.size);
                message.attachments.forEach(attachment => {
                    
                    let timestamp = new Date().getTime().toString();
                    axios({
                        method: 'get', 
                        url: attachment.url, 
                        responseType: 'stream'
                    }).then(function (response) {
                        response.data.pipe(fs.createWriteStream('./' + timestamp + attachment.name));
                        // after download, send it to whatsapp
                        response.data.on('end', function () {
                            const media = MessageMedia.fromFilePath('./' + timestamp + attachment.name);
                            whatsappClient.sendMessage(whatsappChannelId, media);
                        });
                        
                    });
                });
            }
    
            // send message to whatsapp
            if (whatsappChannelId != '') {
                try {
                    whatsappClient.sendMessage(whatsappChannelId, getUserEmoji(userName) + ' ' +  userName + ': \n' + message.content);
                    
                } catch (error) {
                    console.log(error);
                }
            }
        }
        
        // if from private channel and command, handle command
        if (message.channelId === channelId.discordPrivateChannelId || 
            message.channelId === channelId.discordTestChannelId || 
            message.channelId === channelId.discordBotChannelId) {
            // handle message
            messgaeHandle(message, thisMessageType, "discord");
        }
    });

    // reaction event
    discordClient.on('messageReactionAdd', async (reaction, user) => {
        // if from me, return
        if (user.bot) return;
        
        const message = await reaction.message.fetch();
    
        // if not in known channel, return
        let whatsappChannelId = '';
        if (message.channelId === channelId.discordPrivateChannelId) {
            whatsappChannelId = channelId.whatsappGroupId;
        }
        else if (message.channelId === channelId.discordSeminarChannelId) {
            whatsappChannelId = channelId.whatsappSeminarGroupId;
        }
        else if (message.channelId === channelId.discordTestChannelId) {
            whatsappChannelId = channelId.whatsappTestGroupId;
        }
        else if (message.channelId === channelId.discordTeamLigaChannelId) {
            whatsappChannelId = channelId.whatsappTeamLigaGroupId;
        }
        else if (message.channelId === channelId.discordTournamentChannelId) {
            whatsappChannelId = channelId.whatsappTournamentGroupId;
        }
        else {
            return;
        }
        
        let userName = user.displayName;
        if (userNameMap[user.globalName]) {
            userName = userNameMap[user.globalName];
        }
    
        // // if the reaction is made on a message containing "/vote" or "/abstimmen"
        // if (message.content.toLowerCase().includes("/vote") || message.content.toLowerCase().includes("/abstimmen")) {
    
        //     console.log('vote from discord');
        //     console.log('%s %s %s', userName, reaction.emoji.name, message.id);
    
        //     axios.get('https://berlin-mahjong.club/interface/botFunctions.php', {
        //         httpsAgent: agent,
        //         params: {
        //             typ: "vote",
        //             msg: "vote",
        //             user: userName,
        //             vote: reaction.emoji.name,
        //             id: message.id,
        //         },
        //     })
        //     .then(response => {
        //         console.log(response.data);
        //         // delete the reaction
        //         // reaction.users.remove(user.id);
        //     })
        //     .catch(error => {
        //         console.error(error);
        //     });
        // } else {
            // get the original message
            var info = '> '+ message.content.split('\n')[0];
            if (message.content.split('\n')[1]) {
                if (message.content.split('\n')[0] == "---"){
                    info = '> '+ message.content.split('\n')[1];
                } else {
                    info += '\n'+ '> '+ message.content.split('\n')[1];
                }
                
                if (message.content.split('\n')[2]) {
                    info += '\n'+ '> '+ message.content.split('\n')[2].slice(0, 25) + '...';
                }
            }
            if (info === '> ' ) {
                // if has attachments
                if (message.attachments.size > 0) {
                    info = '> einer Mediendatei';
                }
            }
    
            // send to whatsapp
            try {
                whatsappClient.sendMessage(whatsappChannelId, getUserEmoji(userName)+ ' ' +userName + ' hat ' + reaction.emoji.name + ' auf\n' + info )
                // .then(msg => console.log(`Sent message: ${JSON.stringify(msg)}`))
                .catch(console.error);
            } catch (error) {
                console.log(error);
            }
        }
    // }
    );
};