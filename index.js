module.exports = {
    MechMusic: require("./src/mechmusic"),
    Youtube: require("./src/youtube"),
    Votacion: require("./src/Votacion"),
    Lista: require("./src/Lista"),
    Cola: require("./src/Cola")
}

const MechMusic = require("./src/mechmusic");
const discord = require("discord.js");


const Client = new discord.Client();
const mechmusic = new MechMusic(Client, "AIzaSyANaxTOTWzQopH1FC-_8_98Xx_smYuJf0M");


Client.on("ready", async () => {
    console.log("ready")
});

Client.on("message", async (message) => {
    let args = message.content.split(" ");
    let comando = args.shift()
    let cola = mechmusic.conexiones.get(message.guild.id);
    if (comando === "!yt") {
        let buscar = args.join(" ");
        let resultados = await mechmusic.BuscarListado(message, buscar);
    } else if (comando === "!volumen") {
        cola.Volumen(args[0]);
    } else if (comando === "!desc") {
       cola.get(message.guild.id).Desconectar();
    } else if (comando == "!lista") {
        cola.Pendientes(message);
    } else if (comando == "!saltar") cola.Saltar(message);
    else if (comando == "!pausar") cola.Pausar();
    else if (comando == "!reanudar") cola.Reanudar();
    else if (comando == "!playlist") {
        let url = args[0];
        await mechmusic.ReproducirPlaylist(message, url);
    } else if (comando == "!eval") console.log(eval(args.join(" ")))
    
})

Client.login("NjY2ODI4MTk4NzkyOTIxMDk4.XkmYTg.3RdM1EtpnJC5nSWQ4fZMGRb-0bI")

