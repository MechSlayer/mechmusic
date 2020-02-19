const Discord = require("discord.js");

module.exports = class Votacion {
    /**
     * 
     * @param {Discord.TextChannel} channel 
     * @param {number} votos 
     */
    constructor(channel, votos, aux) {
        this.votos = 0;
        this.votado = [];
        this.votosNecesarios = votos;
        this.canal = channel;
        this.aux = aux;
    }

    /**
     * 
     * @param {Discord.User} usuario 
     */
    Votar(usuario) {
        if (!this.votado.includes(usuario.id)) {
            this.votado.push(usuario.id);
            this.votos++;
            if (this.votos >= this.votosNecesarios) return true;
            else return false;
        } else return false;
    }
}