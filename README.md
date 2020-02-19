# mechmusic
Librería para facilitar la creación de bots de música

### De la gran mayoría se encarga la librería, si deseas cambiar algo específico puedes hacerlo desde node_modules


### Ejemplo usando casi todas las funciones
```js
const MechMusic = require("mechmusic");
const discord = require("discord.js");
require("dotenv").config();

const Client = new discord.Client();
const mechmusic = new MechMusic(Client, process.env.google);


Client.on("ready", async () => {
    console.log("ready")
});

Client.on("message", async (message) => {
    let args = message.content.split(" ");
    let comando = args.shift().toLowerCase();
    let cola = mechmusic.conexiones.get(message.guild.id);
    if (comando === "!yt") {
        cola = await mechmusic.Reproducir(message, args[0]);
    } else if (comando === "!lista" && cola) {
        cola.Pendientes(message);
    } else if (comando === "!saltar" && cola) {
        cola.Saltar(message, true);
    } else if (comando === "!pausar" && cola) {
        cola.Pausar();
    } else if (comando === "!reanudar" && cola) {
        cola.Reanudar()
    } else if (comando === "!volumen" && cola) {
        cola.Volumen(args[0]);
    } else if (comando === "!eliminar" && cola) {
        let eliminado = cola.Eliminar(args[0])
        if (eliminado) await message.reply(`Se ha eliminado \`${eliminado.titulo}\` de la cola`);
        else await message.reply("Posición inválida");
    } else if (comando === "!cancion" && cola) {
        await message.reply(`Reproduciendo ${cola.reproduciendo.titulo}`);
    }
})
Client.login(process.env.token)
```

### La variable mechmusic se puede acceder desde el cliente ej: message.client.mechmusic, client.mechmusic, etc...

### La variable cola también se puede acceder desde el servidor ej: message.guild.cola

