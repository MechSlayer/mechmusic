const Discord = require("discord.js");
const MechMusic = require("./mechmusic");
const Lista = require("./Lista");
const Votacion = require("./Votacion");

module.exports = class Cola {
    /**
     * 
     * @param {MechMusic} mechmusic 
     * @param {Discord.VoiceConnection} conexion 
     * @param {Discord.Message} message
     */
    constructor(mechmusic, conexion, message, autodc) {
        /**
         * @type {{url:String, duracion:number, titulo: string, solicitante: Discord.GuildMember}[]}
         */
        this.cola = [];
        this.message = message;
        this.MechMusic = mechmusic;
        this.conexion = conexion;
        this.pausado = false;
        this.autodesconectar = autodc;
        this.duracion = 0;
        /**
         * @type {{url:String, duracion:number, titulo: string, solicitante: Discord.GuildMember}|null}
         */
        this.reproduciendo = null;
        this.finalizado = true;
        this.volumen = 1;
        this.votandoSaltar = false;
        /**
         * @type {Votacion|null}
         */
        this.votacion;

        
    }

    SegundosAMinutos(segundos) {
        let minutos = Math.floor(segundos / 60);
        let segundoss = segundos - minutos * 60;
        return `${minutos}:${segundoss < 10 ? "0" + segundoss: segundoss}`;

    }


    async Agregar(url, solicitante) {
        let info = await this.MechMusic.ObtenerInfo(url);
        let duracion = parseInt(info.length_seconds);
        this.cola.push({url: url, duracion: duracion, titulo: info.title, solicitante: solicitante});
        if (this.finalizado) this.Empezar();  
        
        if (this.duracion === 0) await this.message.channel.send(`Reproduciendo \`${info.title}\``);
        else {
            let minutos = Math.floor(this.duracion / 60);
            let segundos = this.duracion - minutos * 60;
            await this.message.channel.send(`Agregado \`${info.title}\` a la cola en la posición #${this.cola.length}\nSe reproducirá en ${minutos}:${segundos} minutos.`);
        }
        this.duracion += isNaN(duracion) ? 0 : duracion;
        return this;
    }

    async AgregarPlaylist(videos, solicitante) {
        for (const video of videos) {
            let minutos = parseInt(video.duracion.split(":")[0]);
            let segundos = parseInt(video.duracion.split(":")[1]);
            let total = (minutos * 60) + segundos;
            this.cola.push({url: video.url, duracion: total, titulo: video.titulo, solicitante});
            this.duracion += isNaN(total) ? 0 : total;
        }
        if (this.finalizado) this.Empezar();  
        return this;
    }

    Eliminar(index) {
        if (index < 0 || index > this.cola.length) return;
        let url = this.cola.splice(index, 1);
        return url;
    }
    
    Pausar() {
        this.conexion.dispatcher.pause();
        this.pausado = true;
    }

    Pendientes(message) {
        if (this.cola.length === 0) return message.reply("La cola esá vacía");
        let embed = new Discord.RichEmbed()
        .setColor("RANDOM")
        .setTitle("Canciones en cola, página -curpag de -totpag")
        .setFooter(`Restante: ${this.SegundosAMinutos(this.duracion)} minutos`);
        let lista = new Lista(this.cola, (v, i) => `#${i+1} ${v.titulo} - ${this.SegundosAMinutos(v.duracion)}\n`, {limite_pagina: 10});
        lista.ListaPaginada(message, embed).then(msg => {if (msg.deletable) msg.delete();});
    }
    Reanudar() {
        this.conexion.dispatcher.resume();
        this.pausado = false;
    }

    Desconectar() {
        this.conexion.disconnect();
        this.cola = [];
        this.finalizado = true;
        this.duracion = 0;
        this.MechMusic = null;
        this.message = null;
        this.votacion = null;
        this.votandoSaltar = false;
        this.reproduciendo = null;
        
    }

    Volumen(volumen) {
        if (volumen.constructor !== Number) volumen = parseInt(volumen);
        this.volumen = isNaN(volumen) ? 1 : volumen;
        if (this.conexion.dispatcher) this.conexion.dispatcher.setVolume(this.volumen);
    }

    /**
     * 
     * @param {Discord.Message} message 
     */
    Saltar(message) {
        if (false) {
            if (this.conexion.dispatcher) this.conexion.dispatcher.end("Skip");
            this.votandoSaltar = false;
            this.votacion = null;
            return true;
        }
        if (!message.member.voiceChannel) return false;
        if (this.conexion.dispatcher) {
            if (message.member.id === this.reproduciendo.solicitante.id && !this.votandoSaltar || this.conexion.channel.members.size === 2 && !this.votandoSaltar) {
                this.conexion.dispatcher.end("Skip");
                return true;
            } else {
                if (this.votandoSaltar) {
                    let voto = this.votacion.Votar(message.author);
                    if (voto) {
                        this.votandoSaltar = false;
                        if (this.conexion.dispatcher && this.reproduciendo === this.votacion.aux) this.conexion.dispatcher.end("Skip");
                        this.votacion = null;
                        return true
                    } else {
                        message.channel.send(`Votos necesarios: ${this.votacion.votosNecesarios - this.votacion.votos}`);
                        return false;
                    };
                }
                let votosNecesarios = Math.ceil(this.conexion.channel.members.size / 2);
                this.votacion = new Votacion(message.channel, votosNecesarios, this.reproduciendo);
                this.votacion.Votar(message.author);
                this.votandoSaltar = true;
                message.channel.send(`Votación para saltar ${this.reproduciendo.titulo}, 1/${votosNecesarios}`);

            }
        }
    }

    async Empezar() {
        this.finalizado = false;
        while (this.cola.length > 0) {
            let url = this.cola.shift();
            this.reproduciendo = url;
            let conn = await this.MechMusic.ReproducirUrl(url.url, this.conexion);
            if (conn) {
                this.conexion.dispatcher.setVolume(this.volumen);
                let r = await new Promise(resolve => this.conexion.dispatcher.once("end", (r) => resolve(r)));
                await new Promise(resolve => setTimeout(resolve, 2000));
                if (this.MechMusic.debug) console.log("[MECHMUSIC]Stream finalizado: " + r);
            }
            this.duracion -= url.duracion;
            this.votacion = null;
            this.votandoSaltar = false;
        }
        this.finalizado = true;
    }
}