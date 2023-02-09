
import "./Button.css"

import { useState } from "react"

export const Button = () => {
  const [state, setState] = useState(0)
  return (
    <div>
      <button className='shared-btn' onClick={() => setState((s) => s + 1)}>Click me</button>
      <span>{state}</span>
    </div>
  )
}

export default Button