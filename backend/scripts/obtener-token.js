import 'dotenv/config'
import http from 'node:http'
import fs from 'node:fs'
import { exec } from 'node:child_process'

const { GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET } = process.env
if (!GMAIL_CLIENT_ID || !GMAIL_CLIENT_SECRET || GMAIL_CLIENT_ID.startsWith('PEGA') || GMAIL_CLIENT_ID.startsWith('pega')) {
  console.error('Primero pon GMAIL_CLIENT_ID y GMAIL_CLIENT_SECRET en el .env')
  process.exit(1)
}

const PUERTO = 5555
const REDIRECT = 'http://localhost:' + PUERTO
const url = 'https://accounts.google.com/o/oauth2/v2/auth?' + new URLSearchParams({
  client_id: GMAIL_CLIENT_ID,
  redirect_uri: REDIRECT,
  response_type: 'code',
  scope: 'https://www.googleapis.com/auth/gmail.send',
  access_type: 'offline',
  prompt: 'consent',
})

const servidor = http.createServer(async (req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8')
  const codigo = new URL(req.url, REDIRECT).searchParams.get('code')
  if (!codigo) { res.end('Esperando autorizacion...'); return }
  const r = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    body: new URLSearchParams({ code: codigo, client_id: GMAIL_CLIENT_ID, client_secret: GMAIL_CLIENT_SECRET, redirect_uri: REDIRECT, grant_type: 'authorization_code' }),
  })
  const j = await r.json()
  if (!j.refresh_token) {
    console.error('No llego el permiso:', j)
    res.end('Algo fallo. Revisa la terminal.')
    servidor.close()
    return
  }
  let env = fs.readFileSync('.env', 'utf8')
  const linea = 'GMAIL_REFRESH_TOKEN=' + j.refresh_token
  env = /^GMAIL_REFRESH_TOKEN=.*$/m.test(env) ? env.replace(/^GMAIL_REFRESH_TOKEN=.*$/m, linea) : env.trimEnd() + '\n' + linea + '\n'
  fs.writeFileSync('.env', env)
  console.log('Listo: permiso guardado en el .env (GMAIL_REFRESH_TOKEN).')
  res.end('Listo. Cierra esta pestana y vuelve a la terminal.')
  servidor.close()
})

servidor.listen(PUERTO, () => {
  console.log('Abriendo el navegador para autorizar...')
  console.log('Si no se abre, copia este link:\n' + url)
  exec('start "" "' + url + '"')
})