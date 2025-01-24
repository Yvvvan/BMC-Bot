# Chat Bot API

## Run
```
pm2 start bmc_ultrabot.js
pm2 reload 0
pm2 status
```

## Whatsapp Bot
1. JS API: [whatsapp-web.js](https://wwebjs.dev/guide/#installation)

## Files
```
Project/
├── bmc_ultrabot.js             # the bot app for whatsapp and discord
├── event_handler_discord.js    # the event handler of the bot
├── event_handler_whatsapp.js   # the event handler of the bot
├── functions.js                # the helper functions and constants of the bot
├── src/                        
│   ├── luck.js                 # to generate a random fortune cookie
│   ├── makeImg.js              # make image from text like "123m456p789s"
│   ├── tenhou.js               # (Nanikiri) the Reverse Engineering file of tenhou.net
│   └── instructions.js         # the instructions of the bot  
├── config.js                   # [config] the channel ids and interface
├── .env                        # [config] the env file of the discord bot
├── mahjong-cpp/                # (Nanikiti) another mahjong calculator
├── riichi-mahjong-tiles/       # Mahjong Tiles images
├── .gitignore
├── .wwebjs_auth               # the auth file 
├── .wwebjs_cache              # the cache file 
├── node_modules/              
├── package.json               
├── package-lock.json
└── README.md
```

## Referenced Repo
1. [mahjong-cpp](https://github.com/nekobean/mahjong-cpp) by nekobean: Online Calculator [Nanikiru](https://pystyle.info/apps/mahjong-nanikiru-simulator/)
2. [riichi-mahjong-tiles](https://github.com/FluffyStuff/riichi-mahjong-tiles) by FluffyStuff
3. [tenhou 牌理](https://tenhou.net/2/) 的逆向工程 [tenhou.js](https://github.com/kgspider/crawler/tree/main/tenhou_net) by kgspider

## Command
```
- Ergebnisse von heute:
/e     or 
/ergebnis

- Ergebnisse von einem bestimmten Datum:
/e 20230810

- Los ziehen:
/auslosen [num]
Objekt1
...

- Persönliche Statistik:
/p name

- Anmeldung für Donnerstag:
/komm name1 name2 ... 

- Anmeldung für Runde X:
/komm1 name
/komm2 name

- Abmeldung für Donnerstag:
/!komm name     or
/-komm name 

- Anmeldungen anzeigen:
/donnerstag     or
/wer

- Tile Efficiency Tenhou 
(ohne/mit Bild):
/? 6789m3445556778p
/?b 6789m3445556778p

- Tile Efficiency
/?x 6789m3445556778p  or  
/?x 9m3445556778p 111z 6 E E 4z
/?x <conclead> [melded] [turns] [r_wind] [s_wind] [dora_indicators]
▪ <>: required, []: optional
▪ for <melded>:
  →/: no melded
  →123m: chow
  →111z: pung 
  →1111p: open kan
  →1111s*: concealed kan
▪ for [wind]:
  - E / S / W / N

- Punkteberechnung:
/?c 1234567m 111z2222z* 2m 2 S E
/?c <conclead> <melded> <win_tile> [tsumo/ron] [r_wind] [s_wind]        
· <>: required, []: optional
· for <melded>:
  - /: no melded
  - 123m: chow
  - 111z: pung 
  - 1111p: open kan
  - 1111s*: concealed kan
· for [tsumo/ron]:
  - tsumo: 1/tsumo
  - ron: 2/ron 
· for [wind]:
  - E / S / W / N

- Glückskeks:
/keks
```


## RUN
```bash
pm2 start bmc_ultrabot.js
pm2 reload 0
pm2 status
pm2 logs
```