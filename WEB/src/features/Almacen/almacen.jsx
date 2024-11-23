import { useState } from 'react';
import './styles/almacen.css'
// import useAlmacen from '../../hooks/Almacen/useAlmacen.jsx';

function Almacen() {
  
     
    const handleSubmit = async (e) => {
        e.preventDefault();

        if(productoId===0){
            useProductos()
        }

        //limpiar formulario
        setNombre("");
        setDescripcion("");
        setCategoria("");
        setProveedor("");
        setPrecio(0);
        setCantidad(0);
        setImagen("");
        setProductoId(0);
    };
    
    const eliminarProducto = async (id) => {
        if (confirm("¿Desea quitar el producto?")) {
          const response = await fetch(`http://localhost:3000/administrador/${id}`, {
            method: "DELETE",
          });
    
          if (response.ok) {
            setProducto(productos.filter((producto) => producto.id !== id));
          }
        }
    };

    const modificarProducto = (producto) => {
        setProductoId(producto.id);
        setNombre(producto.nombre)
        setDescripcion(producto.descripcion)
        setCategoria(producto.categoria)
        setProveedor(producto.proveedor)
        setPrecio(producto.precio)
        setCantidad(producto.cantidad)
        setImagen(producto.imagen)
    };
    

  return (
    <div className='almacen-container'>
      <h1 className='titulo'>Listado del almacen</h1><br />
      <div className='contenedor-listado'>
          {productos.map(producto => (
              <div key={producto.id}>
                  <img src={producto.imagen} alt={producto.nombre} />
                  <p>{`${producto.id} - ${producto.nombre} - ${producto.categoria} - P: ${producto.proveedor} - ${producto.descripcion} - ${producto.cantidad}U - ${producto.precio}$`}</p>
                  <button className="modificar" onClick={() => modificarProducto(producto)}>Modificar</button>
                  <button className="eliminar" onClick={() => eliminarProducto(producto.id)}>Eliminar</button>
              </div>
          ))}
      </div>
      <div className='contenedor-entradas'>
            <form onSubmit={handleSubmit}>
                <label >Nombre:</label>
                <input maxLength={10}  id="nombre" type="text"  value={nombre}onChange={(e) => setNombre(parseFloat(e.target.value))}/> 
                <label>Descripcion:</label> 
                <input id="descripcion" type="text" value={descripcion}
                onChange={(e) => setDescripcion(parseFloat(e.target.value))}/> 
                <label >Categoria:</label>
                <input id="apellido" type="text" value={categoria}
                onChange={(e) => setCategoria(parseFloat(e.target.value))}/> 
                <label >Proveedor:</label>
                <input id="proveedor" type="text"value={proveedor}
                onChange={(e) => setProveedor(parseFloat(e.target.value))} />
                <label >Precio:</label><input   id="precio" type="number" value={precio}
                onChange={(e) => setPrecio(parseFloat(e.target.value))} />
                <label >Cantidad:</label><input maxLength="2"type="number" name="" id="cantidad" value={cantidad}
                onChange={(e) => setCantidad(parseFloat(e.target.value))}/>
                <label >Imagen URL:</label><input maxLength={255} id="imagen" type="url" value={imagen}
                onChange={(e) => setImagen(parseFloat(e.target.value))} />
                <div class="contenedor-botones">
                    <button>Guardar</button>
                    <button onClick={() => {setNombre(""); setDescripcion("");setCategoria("");setProveedor("");setPrecio("");setCantidad("");setImagen("")}}>Cancelar</button>
                </div>
            </form>
      </div>
    </div>
  )
}

export default Almacen;