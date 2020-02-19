const Discord = require("discord.js");
const ytdl = require("ytdl-core");
const Cola = require("./Cola");
const EventHandlers = require("./EventHandlers");
const Youtube = require("./youtube");
const Lista = require("./Lista");
module.exports = class MechMusic {
    /**
     * 
     * @param {Discord.Client} client 
     * @param {String} key
     * @param {boolean} debug
     */
    constructor(client, key, autodesconectar = false, debug = true) {
        this.client = client;
        this.debug = debug;
        if (!key) throw new Error("[MECHMUSIC] Clave de google no especificada");
        client.mechmusic = this;
        /**
         * @type {Discord.Collection<string, Cola>}
         */
        this.conexiones = new Discord.Collection();
        this.autodesconectar = autodesconectar;
        this.videoreg = /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))((\w|-){11})(?:\S+)?$/g;
        this.playlistreg = /^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/g;
        this.ConectadoGoogle = false;
        this.TokenGoogle = key;
    }


    async Buscar(titulo) {
        return Youtube.Buscar(this.TokenGoogle, titulo);
    }

    /**
     * 
     * @param {Discord.Message} message 
     * @param {string} titulo
     * @returns {Promise<Cola>|Promise<void>}
     */
    async BuscarListado(message, titulo) {
        let matched = titulo.match(this.videoreg);
        if (matched) return this.Reproducir(message, matched[0], false);
        let resultados = await this.Buscar(titulo);
        if (resultados.length === 0) return message.reply("No hay resultados :(");
        let embed = new Discord.RichEmbed()
        .setColor("RANDOM")
        .setTitle(`Resultados de ${titulo}, página -curpag de -totpag`)
        .setFooter("Elige usando los números");
        let lista = new Lista(resultados, (v, i) => `${i+1}. ${v.titulo} - ${v.canal}\n`, {limite_pagina: 10});
        lista.ListaPaginada(message, embed).then(m => {if (m.deletable) m.delete()});
        let filtro = (m) => m.author.id === message.author.id && !isNaN(m.content) && m.channel.id === message.channel.id;
        let respuesta = await message.channel.awaitMessages(filtro, {max: 1, time: 30000});
        respuesta = respuesta.first();
        if (!respuesta) return;
        let numero = parseInt(respuesta.content);
        if (numero > resultados.length) numero = resultados.length - 1;
        if (numero < 1) numero = 1;
        numero--;
        return this.Reproducir(message, resultados[numero].url);
    }
    /**
     * 
     * @param {Discord.Message} message 
     * @param {string} fuente
     * @returns {Promise<Cola>}
     */
    async Reproducir(message, fuente, playlist = false) {
        if (!playlist) {
            if (!fuente.match(this.videoreg)) return this.BuscarListado(message, fuente);
        }
        /**
         * @type Discord.VoiceChannel
         */
        let canal = message.member.voiceChannel;
        if (canal === undefined) return;
        let cola = await this.Conectar(canal, message);
        
        if (playlist) await cola.AgregarPlaylist(fuente, message.member);
        else await cola.Agregar(fuente, message.member);
        return cola;
    }


    /**
     * 
     * @param {String} url 
     * @param {Discord.VoiceConnection} conexion
     */
    async ReproducirUrl(url, conexion) {
        try {
            let stream = ytdl(url, {highWaterMark: 1 << 25});
            conexion.playStream(stream);
            return conexion;
        } catch (error) {
            return;
        }
    }

    /**
     * 
     * @param {Discord.Message} message 
     * @param {string} url 
     * @returns {Promise<Cola>|Promise<void>}
     */
    async ReproducirPlaylist(message, url) {
        if (!url.match(this.playlistreg)) {
            if (url.match(this.videoreg)) return this.Reproducir(url);
            else return;
        }
        let videos = await Youtube.Playlist(url);
        let cola = await this.Reproducir(message, videos, true);
        return cola;
    }

    async ObtenerInfo(url) {
        return ytdl.getInfo(url);
    }

    /**
     * 
     * @param {Discord.VoiceChannel} canal 
     * @param {Discord.Message} message 
     * @returns {Promise<Cola>|Cola}
     */
    async Conectar(canal, message) {
        if (!canal.joinable) return;
        if (this.conexiones.has(message.guild.id)) return this.conexiones.get(message.guild.id);
        /**
         * @type {Cola}
         */
        let conexion = await canal.join();
        let cola = new Cola(this, conexion, message, this.autodesconectar);
        this.conexiones.set(canal.guild.id, cola);
        conexion.on("error", (err) => EventHandlers.OnVoiceError(err, conexion, this));
        conexion.on("disconnect", (err) => EventHandlers.OnVoiceDisconnect(err, conexion, this));
        conexion.on("ready", () => EventHandlers.OnReady(conexion, cola, this));
        return cola;
    }

}
