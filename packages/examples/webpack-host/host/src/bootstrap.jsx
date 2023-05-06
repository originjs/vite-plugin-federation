import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

const root = document.createElement('div')
root.id = 'root'

ReactDOM.createRoot(document.body.appendChild(root)).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
