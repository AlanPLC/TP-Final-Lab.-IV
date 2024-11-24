import { useState } from 'react';
import './styles/productos.css'
import useProductos from '../../hooks/productos/useProductos';

function Productos() {
    const [productos, setProducto] = useState([
      {
        "id": 1,
        "nombre": "Arroz Blanco",
        "categoria": "Alimentos",
        "proveedor": "Granos del Valle",
        "descripcion": "Arroz blanco de grano largo",
        "cantidad": 100,
        "precio": 1.50,
        "imagen": "https://static.cotodigital3.com.ar/sitios/fotos/full/00002200/00002270.jpg?3.0.176"
      },
      {
        "id": 2,
        "nombre": "Aceite de Oliva",
        "categoria": "Alimentos",
        "proveedor": "Oro Verde",
        "descripcion": "500ml",
        "cantidad": 50,
        "precio": 5.99,
        "imagen": "https://acdn.mitiendanube.com/stores/001/058/870/products/zuel03_1-19205db104702fb1fd16964495714682-640-0.jpg"
      },
      {
        "id": 3,
        "nombre": "Leche Entera",
        "categoria": "Lácteos",
        "proveedor": "Lácteos Frescos",
        "descripcion": "1L Serenisima",
        "cantidad": 80,
        "precio": 0.99,
        "imagen": "https://acdn.mitiendanube.com/stores/093/780/products/serenisima-clasica-751-95fea92d1a27f8e9ab15710914346750-480-0.png"
      },
      {
        "id": 4,
        "nombre": "Pan de Molde",
        "categoria": "Panadería",
        "proveedor": "Panadería Artesanal",
        "descripcion": "Pan para sandwiches.",
        "cantidad": 60,
        "precio": 2.49,
        "imagen": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTY4lFT9HBMR4IvJ_3tqzY_kqhFCY-VRhfnlA&s"
      },
      {
        "id": 5,
        "nombre": "Jugo de Naranja",
        "categoria": "Bebidas",
        "proveedor": "Frutas del Sol",
        "descripcion": "500ml citric.",
        "cantidad": 40,
        "precio": 3.29,
        "imagen": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRlk4o6hcXBcMisHTlNLGPtkUBfatxESE6kKa7LoFhvWZyMFQJnsoLnSoL_NfoGARwOx1g&usqp=CAU"
      },
      {
        "id": 6,
        "nombre": "Galletas de Chocolate",
        "categoria": "Snacks",
        "proveedor": "Dulces Delicias",
        "descripcion": "Rumba",
        "cantidad": 150,
        "precio": 1.99,
        "imagen": "https://www.distribuidorapop.com.ar/wp-content/uploads/2016/09/galletitas-rumba-venta.jpg"
      },
      {
        "id": 7,
        "nombre": "Cereal",
        "categoria": "Desayuno",
        "proveedor": "NutriCereal",
        "descripcion": "Mix frutal",
        "cantidad": 70,
        "precio": 4.99,
        "imagen": "https://acdn.mitiendanube.com/stores/002/625/145/products/cereal-mix-infantil1-afc350c7d6e490f91a16792663950445-1024-1024.jpg"
      },
      {
        "id": 8,
        "nombre": "Pasta Espagueti",
        "categoria": "Alimentos",
        "proveedor": "Pasta Fresca",
        "descripcion": "Espagueti de trigo duro",
        "cantidad": 90,
        "precio": 1.75,
        "imagen": "https://img.freepik.com/fotos-premium/paquete-transparente-pasta-espagueti-o-capellini-aislado-sobre-fondo-blanco_461160-2596.jpg?w=360"
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
                <label >Nombre:</label><input maxLength={10}  id="nombre" type="text"  value={nombre}
                onChange={(e) => setNombre(parseFloat(e.target.value))}/> <br />
                <label>Descripcion:</label> <input id="descripcion" type="text" value={descripcion}
                onChange={(e) => setDescripcion(parseFloat(e.target.value))}/> <br />
                <label >Categoria:</label><input id="apellido" type="text" value={categoria}
                onChange={(e) => setCategoria(parseFloat(e.target.value))}/> <br />
                <label >Proveedor:</label><input id="proveedor" type="text"value={proveedor}
                onChange={(e) => setProveedor(parseFloat(e.target.value))} /><br />
                <label >Precio:</label><input   id="precio" type="number" value={precio}
                onChange={(e) => setPrecio(parseFloat(e.target.value))} /><br />
                <label >Cantidad:</label><input maxLength="2"type="number" name="" id="cantidad" value={cantidad}
                onChange={(e) => setCantidad(parseFloat(e.target.value))}/><br />
                <label >Imagen URL:</label><input maxLength={255} id="imagen" type="url" value={imagen}
                onChange={(e) => setImagen(parseFloat(e.target.value))} /><br />
                <div class="contenedor-botones">
                    <button>Guardar</button>
                    <button onClick={() => {setNombre(""); setDescripcion("");setCategoria("");setProveedor("");setPrecio("");setCantidad("");setImagen("")}}>Cancelar</button>
                </div>
            </form>
      </div>
    </div>
  )
}

export default Productos;