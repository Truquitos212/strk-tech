export function validarPedido(d, fotos) {
  const e = {}
  const texto = (v) => (typeof v === 'string' ? v.trim() : '')
  if (texto(d.nombre).length < 2) e.nombre = 'Escribe tu nombre.'
  if (!/^(\+?56)?9\d{8}$/.test(texto(d.telefono).replace(/[\s-]/g, ''))) e.telefono = 'Usa un celular chileno.'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(texto(d.correo))) e.correo = 'Revisa tu correo.'
  if (!texto(d.comuna)) e.comuna = 'Escribe tu comuna.'
  if (texto(d.direccion).length < 5) e.direccion = 'Escribe la dirección para el retiro.'
  if (!texto(d.servicio)) e.servicio = 'Elige un servicio.'
  if (texto(d.descripcion).length < 10) e.descripcion = 'Cuéntanos un poco más.'
  if (!['Mañana', 'Tarde', 'Noche'].includes(d.horario)) e.horario = 'Elige un horario.'
  if (fotos.some((f) => !f.mimetype.startsWith('image/'))) e.fotos = 'Solo se aceptan imágenes.'
  if (d.acepta !== 'true') e.acepta = 'Necesitamos tu autorización para usar tus datos.'
  return e
}