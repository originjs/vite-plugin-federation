System.register(['./__federation_shared_react.js', './__federation_shared_react-dom.js'], (function(exports, module) {
  'use strict'
  var React, ReactDom
  return {
    setters: [function(module) {
      React = module['default']
    }, function(module) {
      ReactDom = module['default']
    }],
    execute: (function() {

      const remotesMap = {
        'remote_app': () => __federation_import('http://localhost:5001/remoteEntry.js')
      }
      const processModule = (mod) => {
        if (mod && mod.default) {
          return mod.default
        }

        return mod
      }
      const shareScope = {
        'react': {
          '16.13.1': {
            loaded: 1,
            get: () => __federation_import('./__federation_shared_react.js').then(r => () => processModule(r))
          }
        }, 'react-dom': {
          '16.13.1': {
            loaded: 1,
            get: () => __federation_import('./__federation_shared_react-dom.js').then(r => () => processModule(r))
          }
        }
      }

      // const shareScope = {
      //   'react': {
      //     version: "16.13.1",
      //     shareScope: "default",
      //     get: () => __federation_import('./__federation_shared_react.js')
      //   }, 'react-dom': {
      //     shareScope: "default",
      //     version: "16.13.1",
      //     get: () => __federation_import('./__federation_shared_react-dom.js')
      //   }
      // };

      async function __federation_import(name) {
        return module.import(name)
      }

      const initMap = {}

      var __federation__ = {
        ensure: async (remoteId) => {
          const remote = await remotesMap[remoteId]()
          if (!initMap[remoteId]) {
            remote.init(shareScope)
            initMap[remoteId] = true
          }
          return remote
        }
      }

      var Button = /*#__PURE__*/React.lazy(function() {
        return __federation__.ensure('remote_app').then(
          (remote) => remote.get('./Button').then(x => {
              return x()
            }
          ))
      }) // const Button1 = React.lazy(() => import('remote_app/Button1'))

      var App = function App() {
        return /*#__PURE__*/React.createElement(React.Suspense, {
          fallback: 'Loading App...'
        }, /*#__PURE__*/React.createElement('h1', null, 'Rollup Host SystemJS'), /*#__PURE__*/React.createElement(Button, null))
      }

      ReactDom.render( /*#__PURE__*/React.createElement(App, null), document.getElementById('root'))

    })
  }
}))
