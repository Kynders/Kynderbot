const { default: Kynderbot, Browsers, DisconnectReason, useMultiFileAuthState } = require("@whiskeysockets/baileys")
const axios = require("axios")
const pino = require("pino")
const { Boom } = require("@hapi/boom")

const Sayangku = process.argv.includes("--Kynders")

async function KynderbotWhatsapp() {
    const auth = await useMultiFileAuthState("./lib/Kynders")
    const riky = await Kynderbot({
        printQRInTerminal: !Sayangku,
        browser: Sayangku ? Browsers.ubuntu("RikyXD") : Browsers.macOS("Kynderbot"),
        auth: auth.state,
        logger: pino({ level: "silent" })
    })

    riky.ev.on("creds.update", auth.saveCreds)
    riky.ev.on("connection.update", (update) => {
        if (update.connection === "close") {
            let reconnect = new Boom(update.lastDisconnect?.error)?.output.statusCode !== DisconnectReason.loggedOut
            console.log("Koneksi terputus pada ", update.lastDisconnect.error, "Menghubungkan ulang ", reconnect)
            if (reconnect) {
                KynderbotWhatsapp()
            }
        } else if (update.connection === "open") {
            console.log("Tersambung ke ", riky.user.id.split(":")[0])
        }
    })

    riky.ev.on("messages.upsert", message => {
        
        const chats = message.messages[0]
        let jawab
        if (chats.message) {
            jawab = chats.message.conversation
        }

        const kirim = chats ? chats.key.remoteJid : chats.key.participant
        const orang = chats ? chats.pushName : "Admin"

        try {
            let teks = `\x1b[1;31m~ (${kirim}) ${orang} > ${jawab}`
            console.log(JSON.stringify(teks, undefined, 2))
        } catch (error) {
            Kynderbot()
        }

        if (!kirim.endsWith("@g.us")) {
            riky.sendMessage(kirim, { text: "yang balas bot ya" })
        }
    })
}

KynderbotWhatsapp()