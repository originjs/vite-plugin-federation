import React from 'react'

const Button = React.lazy(() => import('remote_app/Button'))

const App = () => {
  return (
    <React.Suspense fallback="Loading App...">
      <h1>Rollup Host</h1>
      <Button />
    </React.Suspense>
  )
}
export default App
