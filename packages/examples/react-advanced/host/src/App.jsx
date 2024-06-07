import './App.css'
import useBearStore from 'remoteApp/useBearStore';
import Button from 'remoteApp/Button';

function App() {
  const bears = useBearStore((state) => state.bears)

  return (
    <div className="App">
      <h1>{bears} around here ...</h1>
      <Button/>
    </div>
  )
}

export default App
