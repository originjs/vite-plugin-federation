import React from 'react'

import Button from 'remote_app/Button';
import Button1 from 'remote_app/Button1';

const App = () => {
  return (
    <React.Suspense fallback="Loading App...">
      <h1>Rollup Host ESM</h1>
      <Button />
      <Button1 />
    </React.Suspense>
  )
}
export default App
