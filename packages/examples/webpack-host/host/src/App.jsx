import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import webpackLogo from './assets/webpack.svg'
import './App.css'
import { Button } from 'viteRemote/Button';

function App() {
  return (
    <div className="App">
      <div>
        <a href="https://webpack.js.org/" target="_blank">
          <img src={webpackLogo} className="logo" alt="Webpack logo" />
        </a>
        <a href="https://reactjs.org" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
      </div>
      <h1>Webpack + React + Vite</h1>
      <div className="card">
        <Button />
        <p>
          Edit <code>src/App.jsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </div>
  )
}

export default App
