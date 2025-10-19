// CÓDIGO DEL BOT XIRENHUB (PROXY + BOT) - DEBE IR EN index.js

const express = require('express');
const app = express();
const Discord = require('discord.js');
const axios = require('axios');
const port = process.env.PORT || 3000;

// 1. CONFIGURACIÓN
app.use(express.json());

// Variables secretas que configuras en Render:
const BOT_TOKEN = process.env.DISCORD_TOKEN; 
const SECURITY_TOKEN = process.env.BOT_SECURITY_TOKEN; 
const LINKS_CHANNEL_ID = process.env.LINKS_CHANNEL_ID; 
const PLACE_ID = process.env.PLACE_ID; // El ID de tu lugar de juego de Roblox

// 2. CONEXIÓN DEL BOT DE DISCORD (Xirenhub)
const client = new Discord.Client({ 
    intents: [
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.MessageContent 
    ]
});

// FUNCIÓN CLAVE: Busca el link y ejecuta el teletransporte
async function buscarYTeletransportar(userId) {
    try {
        if (!client.isReady()) {
            console.error("Bot Xirenhub no está listo. Reintente.");
            return;
        }

        const channel = client.channels.cache.get(LINKS_CHANNEL_ID);
        if (!channel) return console.error("Canal de links no encontrado. Revise LINKS_CHANNEL_ID.");

        // Obtenemos los 5 mensajes más recientes
        const messages = await channel.messages.fetch({ limit: 5 });
        
        let targetCode = null;
        
        // El patrón que busca el código de 32 caracteres después de 'code='
        // Ejemplo de link: https://www.roblox.com/share?code=1c7a1d0e905e5845842a12c646c15734&type=Server
        for (const [id, message] of messages) {
            const match = message.content.match(/code=([0-9a-fA-F]{32})/);
            if (match) {
                targetCode = match[1];
                break; // Usa el código del mensaje MÁS RECIENTE
            }
        }
        
        if (!targetCode) {
            channel.send(`⚠️ Xirenhub: No se encontró un código de servidor válido en los últimos 5 mensajes para el usuario ${userId}.`);
            return;
        }

        // --- 3. LÓGICA DE TELEPORTE (SIMULACIÓN de la llamada a la API de Roblox) ---
        // ⚠️ Nota: Para un teletransporte real, aquí se usaría un servicio avanzado 
        // de teletransporte de Roblox. Por ahora, solo confirmaremos la recepción.
        
        console.log(`TELEPORTE INICIADO: Jugador ${userId} a código ${targetCode}`);
        channel.send(`✅ **Teletransporte Iniciado por Xirenhub:** El Jugador **${userId}** será enviado al servidor con código: \`${targetCode}\`.`);
        
    } catch (error) {
        console.error('Error en la búsqueda y teletransporte:', error);
    }
}

// 4. API DE ESCUCHA (EL ENDPOINT QUE ROBLOX LLAMARÁ a través del Proxy Moreira)
app.post('/api/roblox-signal', async (req, res) => {
    const { targetPlayerId, token } = req.body;
    
    // 🔒 Verificación de seguridad
    if (token !== SECURITY_TOKEN) {
        return res.status(401).send({ error: 'Token de seguridad inválido.' });
    }
    
    if (!targetPlayerId) {
        return res.status(400).send({ error: 'Falta el targetPlayerId.' });
    }
    
    // Si la seguridad está OK, ejecutamos la búsqueda y el teletransporte
    await buscarYTeletransportar(targetPlayerId);
    
    res.status(200).send({ message: 'Señal recibida y teletransporte en proceso.' });
});

// 5. INICIAR EL SERVIDOR Y EL BOT
client.on('ready', () => {
    console.log(`Bot Xirenhub conectado y Servidor Proxy Moreira listo como ${client.user.tag}`);
});

client.login(BOT_TOKEN);

app.listen(port, () => {
    console.log(`Servicio Bot/Proxy escuchando en el puerto ${port}`);
});
