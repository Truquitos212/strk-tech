import nodemailer from 'nodemailer'

const compositor = nodemailer.createTransport({ streamTransport: true, buffer: true })
let cache = { token: null, vence: 0 }

async function tokenDeAcceso() {
  if (cache.token && Date.now() < cache.vence) return cache.token
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    body: new URLSearchParams({
      client_id: process.env.GMAIL_CLIENT_ID,
      client_secret: process.env.GMAIL_CLIENT_SECRET,
      refresh_token: process.env.GMAIL_REFRESH_TOKEN,
      grant_type: 'refresh_token',
    }),
  })
  const j = await r.json()
  if (!r.ok) throw new Error('No se pudo renovar el acceso a Gmail: ' + (j.error_description || j.error))
  cache = { token: j.access_token, vence: Date.now() + (j.expires_in - 60) * 1000 }
  return cache.token
}

export async function enviarCorreo(opciones) {
  const { message } = await compositor.sendMail(opciones)
  const token = await tokenDeAcceso()
  const r = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw: message.toString('base64url') }),
  })
  if (!r.ok) throw new Error('Gmail API ' + r.status + ': ' + (await r.text()))
}