import { useState } from 'react';
import './styles/productos.css'
import useProductos from '../../hooks/productos/useProductos';

function Productos() {
    const [productos, setProducto] = useState([
        {
          "id": 1,
          "nombre": "Laptop Gamer",
          "categoria": "Electrónica",
          "proveedor": "TechWorld",
          "descripcion": "Laptop de alto rendimiento con tarjeta gráfica NVIDIA GTX 3050.",
          "cantidad": 15,
          "precio": 1200.99
        },
        {
          "id": 2,
          "nombre": "Silla Ergonómica",
          "categoria": "Muebles",
          "proveedor": "ComfortPlus",
          "descripcion": "Silla de oficina ajustable con soporte lumbar.",
          "cantidad": 50,
          "precio": 199.99
        },
        {
          "id": 3,
          "nombre": "Auriculares Bluetooth",
          "categoria": "Accesorios",
          "proveedor": "SoundMax",
          "descripcion": "Auriculares inalámbricos con cancelación de ruido.",
          "cantidad": 100,
          "precio": 79.99
        },
        {
          "id": 4,
          "nombre": "Mesa de Centro",
          "categoria": "Muebles",
          "proveedor": "DecoHome",
          "descripcion": "Mesa moderna de madera con acabado mate.",
          "cantidad": 20,
          "precio": 149.99
        },
        {
          "id": 5,
          "nombre": "Smartphone X20",
          "categoria": "Electrónica",
          "proveedor": "MobileTech",
          "descripcion": "Teléfono inteligente con cámara de 108 MP y pantalla AMOLED.",
          "cantidad": 30,
          "precio": 899.99
        },
        {
          "id": 6,
          "nombre": "Botella Térmica",
          "categoria": "Hogar",
          "proveedor": "EcoLife",
          "descripcion": "Botella de acero inoxidable que mantiene la temperatura por 12 horas.",
          "cantidad": 200,
          "precio": 24.99
        },
        {
          "id": 7,
          "nombre": "Mochila Impermeable",
          "categoria": "Accesorios",
          "proveedor": "AdventureGear",
          "descripcion": "Mochila resistente al agua con múltiples compartimentos.",
          "cantidad": 80,
          "precio": 59.99
        },
        {
          "id": 8,
          "nombre": "Cámara Reflex",
          "categoria": "Fotografía",
          "proveedor": "PhotoPro",
          "descripcion": "Cámara DSLR con lente intercambiable y grabación en 4K.",
          "cantidad": 10,
          "precio": 1299.99
        }
    ])

    const [nombre, setNombre] = useState(" ")
    const [descripcion, setDescripcion] = useState("")
    const [categoria, setCategoria] = useState("")
    const [proveedor, setProveedor] = useState("")
    const [precio, setPrecio] = useState("")
    const [cantidad, setCantidad] = useState("")
    const [imagen, setImagen] = useState("")
    const [productoId, setProductoId] = useState(0)

     
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
            // Pedir todas las sumas a la api
            // getSumas();
    
            // Quitamos la suma de sumas
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
        <ul>
            {productos.map(producto => (
                <li key={producto.id}>
                    {`${producto.nombre} - ${producto.descripcion} - ${producto.precio}`} 
                    <button onClick={()=>modificarProducto(producto)}>Modificar</button>
                    <button onClick={()=>eliminarProducto(producto.id)}>Eliminar</button> <br />
                    
                </li>
            ))} 
        </ul>
      </div>
      <div className='contenedor-entradas'>
            <form onSubmit={handleSubmit}>
                <label >Nombre:</label><input  id="nombre" type="text"  value={nombre}
                onChange={(e) => setNombre(parseFloat(e.target.value))}/> <br />
                <label>Descripcion:</label> <input id="descripcion" type="text" value={descripcion}
                onChange={(e) => setDescripcion(parseFloat(e.target.value))}/> <br />
                <label >Categoria:</label><input id="apellido" type="text" value={categoria}
                onChange={(e) => setCategoria(parseFloat(e.target.value))}/> <br />
                <label >Proveedor:</label><input id="proveedor" type="text"value={proveedor}
                onChange={(e) => setProveedor(parseFloat(e.target.value))} /><br />
                <label >Precio:</label><input   id="precio" type="number" value={precio}
                onChange={(e) => setPrecio(parseFloat(e.target.value))} /><br />
                <label >Cantidad:</label><input type="number" name="" id="cantidad" value={cantidad}
                onChange={(e) => setCantidad(parseFloat(e.target.value))}/><br />
                <label >Imagen URL:</label><input  id="imagen" type="url" value={imagen}
                onChange={(e) => setImagen(parseFloat(e.target.value))} /><br />
                <div class="contenedor-botones">
                    <button>Guardar</button>
                    <button onClick={() => {setNombre(""); setDescripcion("");setCategoria("");setProveedor("");setPrecio(0);setCantidad(0);setImagen("")}}>Cancelar</button>
                </div>
            </form>
      </div>
    </div>
  )
}

export default Productos;