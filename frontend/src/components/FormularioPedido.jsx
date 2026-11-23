import { useState } from 'react'
import { servicios } from '../data/servicios.js'

const API = import.meta.env.VITE_API_URL
const vacio = { nombre: '', telefono: '', correo: '', comuna: 'Lampa', direccion: '', servicio: '', descripcion: '', horario: '', acepta: false, sitio: '' }
const MAX_FOTOS = 3
const MAX_BYTES = 5 * 1024 * 1024

function validar(d, fotos) {
  const e = {}
  if (d.nombre.trim().length < 2) e.nombre = 'Escribe tu nombre.'
  if (!/^(\+?56)?9\d{8}$/.test(d.telefono.replace(/[\s-]/g, ''))) e.telefono = 'Usa un celular chileno, por ejemplo 9 1234 5678.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.correo.trim())) e.correo = 'Revisa tu correo.'
  if (!d.comuna.trim()) e.comuna = 'Escribe tu comuna.'
  if (d.direccion.trim().length < 5) e.direccion = 'Escribe la dirección para el retiro.'
  if (!d.servicio) e.servicio = 'Elige un servicio.'
  if (d.descripcion.trim().length < 10) e.descripcion = 'Cuéntanos un poco más (mínimo 10 caracteres).'
  if (!d.horario) e.horario = 'Elige un horario.'
  if (fotos.length > MAX_FOTOS) e.fotos = 'Máximo 3 fotos.'
  else if (fotos.some((f) => !f.type.startsWith('image/'))) e.fotos = 'Solo se aceptan imágenes.'
  else if (fotos.some((f) => f.size > MAX_BYTES)) e.fotos = 'Cada foto debe pesar menos de 5 MB.'
  if (!d.acepta) e.acepta = 'Necesitamos tu autorización para usar tus datos.'
  return e
}

function Campo({ id, etiqueta, error, ancho, children }) {
  return (
    <div className={ancho ? 'campo campo-ancho' : 'campo'}>
      <label htmlFor={id}>{etiqueta}</label>
      {children}
      {error && <p className="error" id={id + '-error'}>{error}</p>}
    </div>
  )
}

function FormularioPedido() {
  const [datos, setDatos] = useState(vacio)
  const [fotos, setFotos] = useState([])
  const [errores, setErrores] = useState({})
  const [errorGeneral, setErrorGeneral] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [numero, setNumero] = useState(null)

  const cambiar = (ev) => {
    const { name, value, type, checked } = ev.target
    setDatos({ ...datos, [name]: type === 'checkbox' ? checked : value })
  }

  const enviar = async (ev) => {
    ev.preventDefault()
    if (datos.sitio) return
    const encontrados = validar(datos, fotos)
    setErrores(encontrados)
    setErrorGeneral('')
    if (Object.keys(encontrados).length > 0) return

    const fd = new FormData()
    Object.entries(datos).forEach(([k, v]) => fd.append(k, String(v)))
    fotos.forEach((f) => fd.append('fotos', f))

    setEnviando(true)
    try {
      const r = await fetch(API + '/api/pedidos', { method: 'POST', body: fd })
      const respuesta = await r.json()
      if (!r.ok) {
        if (respuesta.errores) setErrores(respuesta.errores)
        setErrorGeneral(respuesta.error || 'Revisa los campos marcados.')
        return
      }
      setNumero(respuesta.numero)
    } catch {
      setErrorGeneral('No pudimos conectar con el servidor. Intenta de nuevo o escríbenos por WhatsApp.')
    } finally {
      setEnviando(false)
    }
  }

  const reiniciar = () => {
    setDatos(vacio)
    setFotos([])
    setErrores({})
    setErrorGeneral('')
    setNumero(null)
  }

  const aria = (campo) => ({ 'aria-invalid': errores[campo] ? true : undefined, 'aria-describedby': errores[campo] ? campo + '-error' : undefined })
  const fueraDeLampa = datos.comuna.trim() !== '' && datos.comuna.trim().toLowerCase() !== 'lampa'

  if (numero) {
    return (
      <section id="pedido" className="contenedor">
        <div className="tarjeta-form confirmacion">
          <h2>¡Pedido #{numero} recibido!</h2>
          <p>Te enviamos la confirmación a {datos.correo} y te vamos a contactar al {datos.telefono} para coordinar el retiro.</p>
          <button type="button" className="boton" onClick={reiniciar}>Hacer otro pedido</button>
        </div>
      </section>
    )
  }

  return (
    <section id="pedido" className="contenedor">
      <h2>Pide tu servicio</h2>
      <form className="tarjeta-form form-grilla" onSubmit={enviar} noValidate>
        <Campo id="nombre" etiqueta="Nombre" error={errores.nombre}>
          <input id="nombre" name="nombre" autoComplete="name" value={datos.nombre} onChange={cambiar} {...aria('nombre')} />
        </Campo>
        <Campo id="telefono" etiqueta="Celular" error={errores.telefono}>
          <input id="telefono" name="telefono" type="tel" autoComplete="tel" placeholder="9 1234 5678" value={datos.telefono} onChange={cambiar} {...aria('telefono')} />
        </Campo>
        <Campo id="correo" etiqueta="Correo" error={errores.correo}>
          <input id="correo" name="correo" type="email" autoComplete="email" value={datos.correo} onChange={cambiar} {...aria('correo')} />
        </Campo>
        <Campo id="comuna" etiqueta="Comuna" error={errores.comuna}>
          <input id="comuna" name="comuna" value={datos.comuna} onChange={cambiar} {...aria('comuna')} />
          {fueraDeLampa && <p className="aviso">Fuera de Lampa el retiro tiene un recargo de $5.000.</p>}
        </Campo>
        <Campo id="direccion" etiqueta="Dirección para el retiro" error={errores.direccion} ancho>
          <input id="direccion" name="direccion" autoComplete="street-address" value={datos.direccion} onChange={cambiar} {...aria('direccion')} />
        </Campo>
        <Campo id="servicio" etiqueta="Servicio" error={errores.servicio}>
          <select id="servicio" name="servicio" value={datos.servicio} onChange={cambiar} {...aria('servicio')}>
            <option value="">Elige uno</option>
            {servicios.map((s) => <option key={s.titulo} value={s.titulo}>{s.titulo} ({s.precio})</option>)}
            <option value="Otro">Otro / no estoy seguro</option>
          </select>
        </Campo>
        <Campo id="horario" etiqueta="Horario preferido para el retiro" error={errores.horario}>
          <select id="horario" name="horario" value={datos.horario} onChange={cambiar} {...aria('horario')}>
            <option value="">Elige uno</option>
            <option value="Mañana">Mañana (9:00 a 13:00)</option>
            <option value="Tarde">Tarde (14:00 a 18:00)</option>
            <option value="Noche">Noche (18:00 a 21:00)</option>
          </select>
        </Campo>
        <Campo id="descripcion" etiqueta="¿Qué necesitas?" error={errores.descripcion} ancho>
          <textarea id="descripcion" name="descripcion" rows="4" placeholder="Ej: mi notebook está muy lento y quiero formatearlo sin perder mis fotos." value={datos.descripcion} onChange={cambiar} {...aria('descripcion')} />
        </Campo>
        <Campo id="fotos" etiqueta="Fotos del equipo o del problema (opcional, máximo 3)" error={errores.fotos} ancho>
          <input id="fotos" name="fotos" type="file" accept="image/*" multiple onChange={(ev) => setFotos(Array.from(ev.target.files))} {...aria('fotos')} />
          {fotos.length > 0 && <p className="aviso">{fotos.length} foto(s) seleccionada(s)</p>}
        </Campo>
        <div className="trampa" aria-hidden="true">
          <label htmlFor="sitio">No llenar este campo</label>
          <input id="sitio" name="sitio" tabIndex={-1} autoComplete="off" value={datos.sitio} onChange={cambiar} />
        </div>
        <div className="campo campo-ancho">
          <label className="check">
            <input type="checkbox" name="acepta" checked={datos.acepta} onChange={cambiar} {...aria('acepta')} />
            Autorizo a STRK Tech a usar mis datos solo para coordinar este servicio.
          </label>
          {errores.acepta && <p className="error" id="acepta-error">{errores.acepta}</p>}
        </div>
        <div className="campo-ancho">
          {errorGeneral && <p className="error" role="alert">{errorGeneral}</p>}
          <button type="submit" className="boton" disabled={enviando}>{enviando ? 'Enviando...' : 'Enviar pedido'}</button>
        </div>
      </form>
    </section>
  )
}

export default FormularioPedido