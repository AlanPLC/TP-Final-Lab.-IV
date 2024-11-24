import './styles/lobby.css'

function Lobby() {

  return (
    <div className='lobby-container'>
      <div className='pre-presentacion-container'>
        <div className='presentacion-container'>
          <h1 className='titulo'>MINIMARKET BITWARD</h1>
          <p className='desc'>Proyecto universitario sobre aplicación de enfoque vendedor de un minimarket, con el objetivo de administrar productos para su venta con generación de ticket de la misma mostrando todos sus detalles.</p>
          <ul>
            <li><p className='nombres'>Alarcón Mauro</p></li>
            <li><p className='nombres'>Carrizo Alan</p></li>
            <li><p className='nombres'>Cuello Joaquín</p></li>
            <li><p className='nombres'>Francisco</p></li>
          </ul>
        </div>
        <a href="/productos">Ir a los Productos...</a>
      </div>
    </div>
  )
}

export default Lobby