import * as path from 'path';

const remoteEntryHelperId = 'rollup-plugin-federation/remoteEntry';
const moduleMapMarker = '__ROLLUP_FEDERATION_MODULE_MAP__';

function getModuleMap(exposes, chunk) {
    for (let key in exposes) {
        const exposeFile = path.resolve(exposes[key]);
        if (chunk.facadeModuleId.indexOf(exposeFile) === 0) {
            return `"${key}": () => {  return import('http://localhost:8081/${chunk.fileName}').then(({ default: apply }) => (()=> (apply())))},\n`
        }
    }
    return '';
}

export default function federation(options) {
    const provideExposes = options.exposes || {};
    const code =
        `${moduleMapMarker}
export const get =(module, getScope) => {
    return moduleMap[module]();
};
export const init =(shareScope, initScope) => {
    console.log('init')
};`

    return {
        name: 'federation',

        options(_options) {
            // Split expose & shared module to separate chunks
            _options.preserveEntrySignatures = 'strict';
            if (typeof _options.input === 'string') {
                _options.input = [_options.input];
            }
            Object.keys(provideExposes).forEach((id) => {
                _options.input.push(provideExposes[id]);
            });
            return _options;
        },

        buildStart(_options) {
            this.emitFile({
                fileName: options.filename,
                type: 'chunk',
                id: remoteEntryHelperId,
                preserveSignature: "strict"
            })
        },

        resolveId(source, importer) {
            if (source === remoteEntryHelperId)
                return source
            return null;
        },

        load(id) {
            if (id === remoteEntryHelperId) {
                return {
                    code,
                    moduleSideEffects: "no-treeshake"
                }
            }
            return null
        },

        generateBundle(_options, bundle) {
            let modules = '';
            let remoteEntry;
            for (const file in bundle) {
                const chunk = bundle[file];
                if (chunk.type === 'chunk' && chunk.isEntry) {
                    modules += getModuleMap(provideExposes, chunk);
                }
                if (chunk.fileName === options.filename) {
                    remoteEntry = chunk;
                }
            }
            console.log(modules)
            remoteEntry.code = remoteEntry.code.replace(moduleMapMarker,
                `let moduleMap={ ${modules} }`);
        }
    }
}