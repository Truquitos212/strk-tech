import { servicios, WHATSAPP } from './data/servicios.js'
import kamala from './assets/kamala.svg'
import ComoFunciona from './components/ComoFunciona.jsx'
import FormularioPedido from './components/FormularioPedido.jsx'
import PiePagina from './components/PiePagina.jsx'

function App() {
  return (
    <>
      <header className="encabezado">
        <div className="contenedor encabezado-interior">
          <a href="#" className="logo">
            <img src="/favicon.svg" alt="" width="36" height="36" className="logo-icono" />
            STRK Tech
          </a>
          <nav className="menu">
            <a href="#servicios">Servicios</a>
            <a href="#como-funciona">Cómo funciona</a>
            <a href="#pedido">Pedir</a>
          </nav>
          <a className="boton boton-secundario" href={WHATSAPP} target="_blank" rel="noopener noreferrer">WhatsApp</a>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="contenedor hero-interior">
            <div>
              <p className="etiqueta">Servicio técnico y páginas web en Lampa</p>
              <h1>Tu computador como nuevo, sin salir de casa.</h1>
              <p className="bajada">Retiro gratis en Lampa y entrega en 2 días hábiles. Precios claros desde el inicio.</p>
              <div className="acciones">
                <a className="boton" href="#pedido">Pide tu servicio</a>
                <a className="boton boton-secundario" href="#servicios">Ver servicios</a>
              </div>
            </div>
            <img src={kamala} alt="Kamala, la mascota de STRK Tech" width="320" height="320" className="hero-kamala" />
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

        <ComoFunciona />
        <FormularioPedido />
      </main>

      <PiePagina />
    </>
  )
}

export default App