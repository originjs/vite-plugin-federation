import * as path from 'path';
import {InputOptions, OutputBundle, OutputChunk, OutputOptions} from "rollup";

const remoteEntryHelperId = 'rollup-plugin-federation/remoteEntry';
const modulePrefix = '__ROLLUP_FEDERATION_MODULE_PREFIX__'
const replaceMap = new Map()

export default function federation(options: VitePluginFederationOptions) {
    const provideExposes = options.exposes as string[];
    let moduleMap = '';
    for (const key in provideExposes) {
        moduleMap += `\n"${key}":()=>{return import('${modulePrefix + '${' + provideExposes[key] + '}'})}`
    }
    const code =
        `let moduleMap = {${moduleMap}}
export const get =(module, getScope) => {
    return moduleMap[module]();
};
export const init =(shareScope, initScope) => {
    console.log('init')
};`

    return {
        name: 'federation',

        options(_options: InputOptions) {
            // Split expose & shared module to separate chunks
            _options.preserveEntrySignatures = 'strict';
            if (typeof _options.input === 'string') {
                _options.input = [_options.input];
            }
            Object.keys(provideExposes).forEach((id) => {
                if (Array.isArray(_options.input)) {
                    // @ts-ignore
                    _options.input.push(provideExposes[id]);
                }
            });
            return _options;
        },

        buildStart(_options: InputOptions) {
            // @ts-ignore
            this.emitFile({
                fileName: options.filename,
                type: 'chunk',
                id: remoteEntryHelperId,
                preserveSignature: "strict"
            })
        },

        resolveId(source: string, importer: string) {
            if (source === remoteEntryHelperId)
                return source
            return null;
        },

        load(id: string) {
            if (id === remoteEntryHelperId) {
                return {
                    code,
                    moduleSideEffects: "no-treeshake"
                }
            }
            return null
        },

        generateBundle(_options: OutputOptions, bundle: OutputBundle) {
            let remoteChunk: OutputChunk;
            for (const file in bundle) {
                const chunk = bundle[file];
                if (chunk.type === 'chunk' && chunk.isEntry) {
                    for (const key in provideExposes) {
                        let provideExpose: string = provideExposes[key];
                        if (chunk.facadeModuleId!.indexOf(path.resolve(provideExpose)) >= 0) {
                            replaceMap.set(modulePrefix + '${' + provideExpose + '}', `http://localhost:8081/${chunk.fileName}`)
                        }
                        if (options.filename === chunk.fileName) {
                            remoteChunk = chunk;
                        }
                    }
                }
            }
            replaceMap.forEach((value, key) => {
                remoteChunk.code = (remoteChunk.code as string).replace(key, value);
            })
        }
    }
}
