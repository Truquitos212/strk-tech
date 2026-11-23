const WHATSAPP = 'https://wa.me/56961908372?text=Hola%20STRK%20Tech,%20quiero%20cotizar%20un%20servicio'

const servicios = [
  { titulo: 'Formateo + Windows', precio: 'Desde $25.000', detalle: 'Respaldamos tus archivos, dejamos Windows limpio y los drivers al día.' },
  { titulo: 'Instalación de Windows', precio: 'Desde $15.000', detalle: 'Para PC recién armados o discos nuevos, sin respaldo.' },
  { titulo: 'Armado de PC', precio: 'Desde $40.000', detalle: 'Armado con Windows y drivers incluidos. Piezas aparte.' },
  { titulo: 'Páginas web para negocios', precio: 'Desde $150.000', detalle: 'Reservas, fotos, horarios y automatizaciones. 50% al inicio y 50% al entregar.' },
]

function App() {
  return (
    <>
      <header className="encabezado">
        <div className="contenedor encabezado-interior">
          <a href="#" className="logo">STRK Tech</a>
          <nav className="menu">
            <a href="#servicios">Servicios</a>
            <a href="#pedido">Pedir</a>
          </nav>
          <a className="boton boton-secundario" href={WHATSAPP} target="_blank" rel="noopener noreferrer">WhatsApp</a>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="contenedor">
            <p className="etiqueta">Servicio técnico y páginas web en Lampa</p>
            <h1>Tu computador como nuevo, sin salir de casa.</h1>
            <p className="bajada">Retiro gratis en Lampa y entrega en 2 días hábiles. Precios claros desde el inicio.</p>
            <div className="acciones">
              <a className="boton" href="#pedido">Pide tu servicio</a>
              <a className="boton boton-secundario" href="#servicios">Ver servicios</a>
            </div>
          </div>
        </section>

        <section id="servicios" className="contenedor">
          <h2>Servicios</h2>
          <div className="grilla">
            {servicios.map((s) => (
              <article className="tarjeta" key={s.titulo}>
                <h3>{s.titulo}</h3>
                <p className="precio">{s.precio}</p>
                <p>{s.detalle}</p>
              </article>
            ))}
          </div>
          <p className="nota">Fuera de Lampa: recargo de $5.000 por el retiro. Páginas web más grandes, a cotizar.</p>
        </section>
      </main>
    </>
  )
}

export default App