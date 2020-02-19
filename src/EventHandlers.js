const Discord = require("discord.js");
const MechMusic = require("./mechmusic");
const Cola = require("./Cola");
/**
 * 
 * @param {Error} err 
 * @param {Discord.VoiceConnection} conexion 
 * @param {MechMusic} mechmusic
 */
async function OnVoiceError(err, conexion, mechmusic) {
    console.log(`[MECHMUSIC] Ha ocurrido un error en la conexión de voz del servidor ${conexion.channel.guild.name}: ${err.message}`);
    conexion.disconnect();
    mechmusic.conexiones.delete(conexion.channel.guild.id);
}

/**
 * @param {Error} err
 * @param {Discord.VoiceConnection} conexion 
 * @param {MechMusic} mechmusic 
 */
async function OnVoiceDisconnect(err, conexion, mechmusic) {
    if (err) console.log(`[MECHMUSIC] Ha ocurrido un error en la conexión de voz del servidor ${conexion.channel.guild.name}: ${err.message}`)
    conexion.cola = null;
    mechmusic.conexiones.delete(conexion.channel.guild.id);
}

/**
 * @param {Discord.VoiceConnection} conexion 
 * @param {Cola} cola
 * @param {MechMusic} mechmusic 
 */
async function OnReady(conexion, cola, mechmusic) {
    cola.Empezar();
}

module.exports = {OnVoiceError, OnVoiceDisconnect, OnReady}