# mechmusic
### Librería para facilitar la creación de bots de música

De la gran mayoría se encarga la librería, si deseas cambiar algo específico puedes hacerlo desde node_modules


### Ejemplo usando casi todas las funciones
```js
const MechMusic = require("mechmusic");
const discord = require("discord.js");
require("dotenv").config();

const Client = new discord.Client();
const mechmusic = new MechMusic(Client, process.env.google, true, false);


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


### [MechMusic](client, key, autodesconectar = false, debug = true)
La clase principal de la librería

-   client: El cliente de discord que usará esta instancia
-   key: Clave api de google
-   autodesconectar: Si se desea que al terminar la cola, el bot se desconecte
-   debug: Si se desea mostrar en consola los mensajes de depuración

### [MechMusic].Reproducir(message, fuente, playlist = false)
El método principal para reproducir música, se encarga de filtrar el tipo de enlace y configurar la cola del bot

-   message: El mensaje con el que se solicitó la canción
-   fuente: El enlace de la canción, playlist o el nombre a buscar
-   playlis: Se usa para indicar que se va a agregar una playlist

-   devuelve: La cola creada o la cola a la que se ha agregado al canción o playlist en forma de promesa


### [MechMusic].Buscar(titulo)
Sirve para buscar canciones por el título
-   titulo: Título que se quiere buscar

-   devuelve: Un array con los resultados en forma de promesa


### [MechMusic].BuscarListado(message, titulo)
Sirve para buscar canciones por el título, una vez realizada la búsqueda se creará una lista y el usuario tendrá que elegir la canción que quiere

-   message: El mensaje con el que se buscó la canción
-   titulo: El título de la canción

-   devuelve: La cola en la que se agregó la canción seleccionada en forma de promesa


### [MechMusic].ReproducirUrl(url, conexion) 
Sirve para reproducir una url en una conexión existente (No recomendado usar directamente)

-   url: La url que se quiere reproducir
-   conexion: La conexión de voz

- devuelve: La conexión en la que se reproducirá la canción en forma de promesa


### [MechMusic].ReproducirPlaylist(message, url)
Sirve para agregar una playlist a la cola y reproducir la primera canción si no hay nada reproduciendose(En caso de que se quiera filtrar manualmente los enlaces)

-   message: El mensaje con el que se solicitó la playlist
-   url: url de la playlist

-   devuelve: La cola a la que se ha agregado la playlist o void si no se ha podido encontrar


### [MechMusic].ObtenerInfo(url)
Sirve para obtener información de un video

-   url: url del vídeo

-   devuelve: la información del vídeo en forma de promesa

### [MechMusic].Conectar(canal, message)
Sirve para iniciar la conexión del bot y configurar la cola del mismo

-   canal: Canal de voz al que conectarse
-   message: El mensaje con el que se solicitó la conexión

-   devuelve: La cola de la conexión


### [Cola].Agregar(url, solicitante)
Sirve para agregar manualmente una canción a la cola

-   url: url de la canción
-   solicitante: [Member] del servidor que solicitó la canción

-   devuelve: La cola en forma de promesa

### [Cola].AgregarPlaylist(videos, solicitante)
Sirve para agregar una playlist a la cola

-   videos: Array con los objetos devueltos por mechmusic.Youtube.playlist()
-   solicitante: [Member] del servidor que solicitó la playlist

-   devuelve: La cola en forma de persona

### [Cola].Eliminar(index)
Elimina la canción de la lista, de la posición indicada (Comienza en 1)

-   index: Posición de la canción en la cola

-   devuelve: La canción eliminada de la cola

### [Cola].Pausar()
Pausa la reproducción

### [Cola].Reanudar()
Reanuda la reproducción

### [Cola].Pendientes(message)
Crea y enviá una lista paginada con las canciones pendientes

-   message: El mensaje con el que se solicitó la lista

### [Cola].Desconectar()
Desconecta al bot, vacía la cola y destruye los streams

### [Cola].Volumen(volumen)
Cambia el volumen del bot

-   volumen: volumen al que se quiera cambiar (máximo 10000)

### [Cola].Saltar(message, votacion = true)
Salta la canción actual, o comienza una votación para saltarla

-   message: El mensaje con el que se solicitó la función

-   votacion: Si se esperará a una votación o se saltará directamente (en caso de solicitarlo la persona que solicitó la canción, se saltará directamente)

### [Cola].Empezar()
Empieza la reproducción de las cancioens que haya en cola (No usar manualmente)

### [Cola].Shuffle()
Ordena de manera aleatoria la cola de canciones