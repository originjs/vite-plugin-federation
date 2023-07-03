import {lazy, Suspense} from "react";
import {ErrorBoundary} from "react-error-boundary";

const remotesMap = {};
if (!globalThis.__federation_shared__){
    globalThis.__federation_shared__={default: {}}
}
var __federation__ = {
    ensure: async (remoteId) => {
        const remote = remotesMap[remoteId];
        if (remote.inited) {
            return remote.lib;
        }
        return new Promise((resolve) => {
            // debugger;
            import(/* @vite-ignore */ remote.url).then((lib) => {
                debugger;
                console.log('lib', lib);
                if (!remote.inited) {
                    lib.init(globalThis.__federation_shared__.default);
                    remote.lib = lib;
                    remote.inited = true;
                }
                resolve(remote.lib);
            });
        });
    },
};
const loadComponent = (url, scope, module) => async () => {
    remotesMap[scope] = {
        url: url,
    };

    return __federation__.ensure(scope).then((remote) => remote.get(module).then((factory) => factory()));
};

const ModuleLoader = ({module, props, scope, url}) => {
    if (!module) {
        return <Alert severity="error">Module name cannot be empty</Alert>;
    }

    const Component = lazy(loadComponent(url, scope, module));

    return (
        <Suspense fallback={<>Loading...</>}>
            <Component {...props} />
        </Suspense>
    );
};

export const RemoteButton = () => {
    const url = 'http://localhost:5001/assets/remoteEntry.js'

    return <ErrorBoundary fallback={<>Failed to load remote component...</>}>
        <ModuleLoader module={'./Button'} scope={'remote_app'} url={url}/>
    </ErrorBoundary>
}
