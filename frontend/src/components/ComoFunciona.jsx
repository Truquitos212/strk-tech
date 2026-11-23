const pasos = [
  { n: 1, titulo: 'Pides en la web', texto: 'Llenas el formulario con lo que necesitas y el horario que te acomoda.' },
  { n: 2, titulo: 'Retiramos tu equipo', texto: 'Gratis en Lampa. Fuera de Lampa, recargo de $5.000.' },
  { n: 3, titulo: 'Te lo devolvemos listo', texto: 'En 2 días hábiles, funcionando y con todo explicado.' },
]

function ComoFunciona() {
  return (
    <section id="como-funciona" className="contenedor">
      <h2>Cómo funciona</h2>
      <ol className="pasos">
        {pasos.map((p) => (
          <li className="paso" key={p.n}>
            <span className="paso-numero">{p.n}</span>
            <h3>{p.titulo}</h3>
            <p>{p.texto}</p>
          </li>
        ))}
      </ol>
    </section>
  )
}

export default ComoFunciona