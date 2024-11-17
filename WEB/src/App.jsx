import { useState } from 'react'
import './styles/App.css'

function App() {
  const [count, setCount] = useState(0)
  
  return (
    <>
      <h1>Minimarket Bitward</h1>
      <button onClick={() => setCount(count + 1)}>Incrementar</button>
      <button onClick={() => setCount(count - 1)}>Decrementar</button>
      <p>{count}</p>
    </>
  )
}

export default App