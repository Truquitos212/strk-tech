import { WHATSAPP, CORREO } from '../data/servicios.js'

function PiePagina() {
  return (
    <footer className="pie">
      <div className="contenedor pie-interior">
        <p className="logo">STRK Tech</p>
        <p>Servicio técnico y páginas web en Lampa.</p>
        <p>
          <a href={WHATSAPP} target="_blank" rel="noopener noreferrer">WhatsApp</a>
          {' · '}
          <a href={'mailto:' + CORREO}>{CORREO}</a>
        </p>
      </div>
    </footer>
  )
}

export default PiePagina