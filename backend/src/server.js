import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import multer from 'multer'
import rateLimit from 'express-rate-limit'
import { createClient } from '@supabase/supabase-js'
import { validarPedido } from './validar.js'
import { enviarCorreo } from './correo.js'

const { PORT = 3000, FRONTEND_URL, SUPABASE_URL, SUPABASE_SECRET_KEY, GMAIL_USER } = process.env

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, { auth: { persistSession: false } })
const subir = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024, files: 3 } })
const limitePedidos = rateLimit({ windowMs: 15 * 60 * 1000, limit: 5, message: { error: 'Demasiados pedidos seguidos. Intenta en 15 minutos.' } })

const app = express()
app.set('trust proxy', 1)
app.use(cors({ origin: FRONTEND_URL }))
app.use(express.json())

app.get('/api/salud', (req, res) => res.json({ ok: true }))

app.post('/api/pedidos', limitePedidos, subir.array('fotos', 3), async (req, res) => {
  const d = req.body
  const fotos = req.files ?? []
  if (d.sitio) return res.status(201).json({ numero: '0000' })

  const errores = validarPedido(d, fotos)
  if (Object.keys(errores).length > 0) return res.status(400).json({ errores, error: 'Revisa los campos marcados.' })

  const pedido = {
    nombre: d.nombre.trim(),
    telefono: d.telefono.replace(/[\s-]/g, ''),
    correo: d.correo.trim().toLowerCase(),
    comuna: d.comuna.trim(),
    direccion: d.direccion.trim(),
    servicio: d.servicio.trim(),
    descripcion: d.descripcion.trim(),
    horario: d.horario,
  }

  const { data, error } = await supabase.from('pedidos').insert(pedido).select('id, numero').single()
  if (error) {
    console.error('Error al guardar:', error.message)
    return res.status(500).json({ error: 'No pudimos guardar el pedido. Intenta de nuevo o escríbenos por WhatsApp.' })
  }

  const rutas = []
  for (const [i, f] of fotos.entries()) {
    const ext = (f.mimetype.split('/')[1] || 'jpg').replace(/[^a-z0-9]/gi, '')
    const ruta = `${data.id}/foto-${i + 1}.${ext}`
    const { error: errFoto } = await supabase.storage.from('fotos').upload(ruta, f.buffer, { contentType: f.mimetype })
    if (errFoto) console.error('Foto no subida:', errFoto.message)
    else rutas.push(ruta)
  }
  if (rutas.length > 0) await supabase.from('pedidos').update({ fotos: rutas }).eq('id', data.id)

  const num = String(data.numero).padStart(4, '0')
  const detalle = [
    `Pedido #${num}`,
    `Servicio: ${pedido.servicio}`,
    `Nombre: ${pedido.nombre}`,
    `Celular: ${pedido.telefono}`,
    `Correo: ${pedido.correo}`,
    `Comuna: ${pedido.comuna}${pedido.comuna.toLowerCase() === 'lampa' ? '' : ' (recargo $5.000)'}`,
    `Dirección: ${pedido.direccion}`,
    `Horario: ${pedido.horario}`,
    `Fotos: ${rutas.length}`,
    '',
    pedido.descripcion,
  ].join('\n')

  try {
    await enviarCorreo({
      from: `STRK Tech <${GMAIL_USER}>`,
      to: GMAIL_USER,
      replyTo: pedido.correo,
      subject: `[STRK] Pedido #${num} · ${pedido.servicio} · ${pedido.comuna}`,
      text: detalle,
    })
    await enviarCorreo({
      from: `STRK Tech <${GMAIL_USER}>`,
      to: pedido.correo,
      subject: `Recibimos tu pedido #${num} · STRK Tech`,
      text: `Hola ${pedido.nombre}:\n\nRecibimos tu pedido #${num} (${pedido.servicio}). Te vamos a contactar al ${pedido.telefono} para coordinar el retiro.\n\nSTRK Tech · Lampa`,
    })
  } catch (e) {
    console.error('Correo no enviado (el pedido sí quedó guardado):', e.message)
  }

  res.status(201).json({ numero: num })
})

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ errores: { fotos: 'Máximo 3 fotos de hasta 5 MB cada una.' }, error: 'Revisa las fotos.' })
  }
  console.error(err)
  res.status(500).json({ error: 'Error inesperado. Intenta de nuevo.' })
})

app.listen(PORT, () => console.log(`API de STRK Tech en http://localhost:${PORT}`))