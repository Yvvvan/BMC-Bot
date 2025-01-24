module.exports.Instruction = 
`- Ergebnisse:
*/e*        _or_ 
*/ergebnis* _or_ 
*/e* 20230810

- Anmeldung:
*/do* name1 name2 ... 
*/sa* name1 name2 ... 
*/dosa* name1 name2 ...  _or_
*/both* name1 name2 ...

- Anmeldung für Runde X:
*/do1* name1 ... _or_
*/sa2* name1 ...

- Abmeldung für Donnerstag:
*/-do* name     _or_
*/-sa* name 

- Anmeldungen anzeigen:
*/donnerstag*   _or_
*/samstag*

- Los ziehen:
*/auslosen* [num]
Objekt1
...

- Glückskeks:
*/keks*

- Persönliche Statistik:
*/p* name
`;


// ```- Tile Efficiency Tenhou 
// (ohne/mit Bild):
// */?* 6789m3445556778p
// */?b* 6789m3445556778p

// - Tile Efficiency
// */?x* 6789m3445556778p  _or_  
// */?x* 9m3445556778p 111z 6 E E 4z
// */?x* <conclead> [melded] [turns] [r_wind] [s_wind] [dora_indicators]
// ▪ <>: required, []: optional
// ▪ for <melded>:
//   →/: no melded
//   →123m: chow
//   →111z: pung 
//   →1111p: open kan
//   →1111s*: concealed kan
// ▪ for [wind]:
//   - E / S / W / N

// - Punkteberechnung:
// */?c* 1234567m 111z2222z* 2m 2 S E
// */?c* <conclead> <melded> <win_tile> [tsumo/ron] [r_wind] [s_wind]        
// · <>: required, []: optional
// · for <melded>:
//   - /: no melded
//   - 123m: chow
//   - 111z: pung 
//   - 1111p: open kan
//   - 1111s*: concealed kan
// · for [tsumo/ron]:
//   - tsumo: 1/tsumo
//   - ron: 2/ron 
// · for [wind]:
//   - E / S / W / N
// ```;