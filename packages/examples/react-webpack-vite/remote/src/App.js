import React from "react";

import Button from "./Button";

const App = () => (
  <div>
    <React.Suspense fallback={<div>Loading the header</div>}>
    </React.Suspense>
    <h1>Webpack Remote</h1>

    <Button />
  </div>
);

export default App;
