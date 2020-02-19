const Discord = require("discord.js");

module.exports = class Lista {
    
     /**
      * 
      * @param {any[]} array Array con los datos que se usarán
      * @param {(v: any, i: number) => v} map Función que se usará para colocar los datos
      */
    constructor(array , map = (v) => v, {limite_pagina = 4, emoji_pag_sig = "➡️", emoji_pag_ant = "⬅️", timeout = 20000}={}) {
        this.array = array;
        this.map = map;
        this.limite_pagina = limite_pagina;
        this.paginas = Math.ceil(this.array.length / this.limite_pagina);
        this.emoji_pag_sig = emoji_pag_sig;
        this.emoji_pag_ant = emoji_pag_ant;
        this.timeout = timeout;
    }

    /**
     * Crea una lista básica, con páginas
     * @param {Discord.Message} message Mensaje al que se responderá con la lista
     * @param {Discord.RichEmbed} embed_base Embed sobre el que se creará la lista
     * @returns {Promise<Discord.Message>} Retorna el último mensaje editado
     */
    async ListaPaginada(message, embed_base) {
        let titulo_embed = embed_base != undefined ? embed_base.title : "";
        let embed = this.comprobarEmbed(embed_base);
        let pagina = 1;
        let seleccion = 0;
        embed.setDescription(this.array.slice(seleccion, seleccion + this.limite_pagina).map(this.map).join(""));
        let msg = await message.channel.send(embed);
        if (this.paginas <= 1) {
            await new Promise(resolve => setTimeout(resolve, this.timeout));
            return msg;
        }
        await msg.react(this.emoji_pag_ant);
        await msg.react(this.emoji_pag_sig);
        while (true) {
            let editar = false;
            let reacciones = await msg.awaitReactions((r, u) => [this.emoji_pag_ant, this.emoji_pag_sig].includes(r.emoji.name) && u.id === message.author.id, {max: 1, time: this.timeout});
            if (reacciones.size === 0) return msg;
            let reaccion = reacciones.first();
            if (reaccion.emoji.name === this.emoji_pag_sig && pagina < this.paginas) {
                seleccion += this.limite_pagina;
                pagina++;
                editar = true;
            } else if (reaccion.emoji.name === this.emoji_pag_ant && pagina > 1) {
                seleccion -= this.limite_pagina;
                pagina--;
                editar = true;
            }
            
            if (editar) {
                let titulo;
                
                if (titulo_embed.length > 0) titulo = titulo_embed.replace("-curpag", pagina).replace("-totpag", this.paginas || 1);
                else titulo = `Página ${pagina} de ${this.paginas || 1}`;
                embed.setTitle(titulo);
                let descripcion = "";
                
                let curr = this.array.slice(seleccion, seleccion + this.limite_pagina);
                let indexes = [...Array(seleccion + this.limite_pagina).keys()];
                indexes.splice(0, this.limite_pagina * (pagina - 1));
                for (let i = 0; i < curr.length; i++) {
                    let chunk = this.map(curr[i], indexes[i]);
                    descripcion += chunk;
                }
                embed.setDescription(descripcion);
                await msg.edit(embed);
            }
        }
    }

    /**
     * 
     * @param {Discord.RichEmbed} embed 
     */
    comprobarEmbed(embed) {
        if (!embed) {
            embed = new Discord.RichEmbed()
            .setColor("RANDOM")
            .setTitle("Página 1 de " + this.paginas || this.paginas + 1)
            return embed;
        } else {
            if (embed.title.length > 0) embed.setTitle(embed.title.replace("-curpag", 1).replace("-totpag", this.paginas || 1));
            return embed;
        };
    }
}