const request = require("request-promise");
const ytpl = require("ytpl");

/**
 * 
 * @param {stirng} token 
 * @param {string} titulo 
 * @returns {{url: string, tipo: string, titulo: string, descripcion: string, canal: string}[]}
 */
async function Buscar(token, titulo) {
    let params = {
        part: "snippet",
        q: titulo,
        key: token,
        maxResults: 50
    };

    let response = await request.get("https://www.googleapis.com/youtube/v3/search", {qs: params, json: true});
    let items = response.items;
    let resultados = [];
    for(const item of items) {
        if (item.id.kind === "youtube#video") {
            let url = "https://www.youtube.com/watch?v=" + item.id.videoId;
            let titulo = item.snippet.title;
            let descripcion = item.snippet.description;
            let canal = item.snippet.channelTitle;
            resultados.push({url, tipo: "video", titulo, descripcion, canal});
        }
    }
    return resultados;
}


async function Playlist(url) {
    let lista;
    try {
        lista = await ytpl(url);    
    } catch (error) {
        return [];
    }
    
    let fuentes = [];
    for (const item of lista.items) {
        fuentes.push({url: item.url, tipo: "video", duracion: item.duration,titulo: item.title, canal: item.author.name});
    }
    return fuentes;
}
module.exports = {Buscar, Playlist}