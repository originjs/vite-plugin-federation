// *****************************************************************************
// Copyright (C) 2022 Origin.js and others.
//
// This program and the accompanying materials are licensed under Mulan PSL v2.
// You can use this software according to the terms and conditions of the Mulan PSL v2.
// You may obtain a copy of Mulan PSL v2 at:
//          http://license.coscl.org.cn/MulanPSL2
// THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND,
// EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT,
// MERCHANTABILITY OR FIT FOR A PARTICULAR PURPOSE.
// See the Mulan PSL v2 for more details.
//
// SPDX-License-Identifier: MulanPSL-2.0
// *****************************************************************************

import {
  parseExposeOptions,
  removeNonRegLetter,
  NAME_CHAR_REG,
 } from "../utils";
 import { parsedOptions } from "../public";
 import type { VitePluginFederationOptions } from "types";
 import type { PluginHooks } from "../../types/pluginHooks";
 
 export function devExposePlugin(
  options: VitePluginFederationOptions
 ): PluginHooks {
  let moduleMap = "";
  parsedOptions.devExpose = parseExposeOptions(options);
  for (const item of parseExposeOptions(options)) {
    const name = removeNonRegLetter(item[0], NAME_CHAR_REG);
    moduleMap += `"${item[0]}":()=>{
      return __federation_import('./__federation_expose_${name}.js').then(module =>Object.keys(module).every  (item => exportSet.has(item)) ? () => module.default : () => module)},`;
  }
  return {
  name: "originjs:expose-development",
  virtualFile: {
    [`__remoteEntryHelper__${options.filename}`]: `
      const currentImports = {}
      const exportSet = new Set(['Module', '__esModule', 'default', '_export_sfc']);
      let moduleMap = {${moduleMap}}
      const seen = {}
      async function __federation_import(name) {
        currentImports[name] ??= import(name)
        return currentImports[name]
      };
      export const get =(module) => {
        if(!moduleMap[module]) throw new Error('Can not find remote module ' + module)
        return moduleMap[module]();
      };
      export const init =(shareScope) => {
        globalThis.__federation_shared__= globalThis.__federation_shared__|| {};
        Object.entries(shareScope).forEach(([key, value]) => {
          for (const [versionKey, versionValue] of Object.entries(value)) {
            const scope = versionValue.scope || 'default'
            globalThis.__federation_shared__[scope] = globalThis.__federation_shared__[scope] || {};
            const shared= globalThis.__federation_shared__[scope];
            (shared[key] = shared[key]||{})[versionKey] = versionValue;
          }
        });
      }`,
    },
    configServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || "";
        const setCorsHeaders = () => {
          res.setHeader("Access-Control-Allow-Origin", "*");
          res.setHeader("Access-Control-Allow-Methods", "*");
          res.setHeader("Access-Control-Allow-Headers", "*");
        };
        if (url === `/${options.filename}`) {
          if (req.method === "OPTIONS") {
            setCorsHeaders();
            res.statusCode = 204;
            res.end();
            return;
          }
          setCorsHeaders();
          try {
            const moduleId = `__remoteEntryHelper__${options.filename}`;
            const result = await server.transformRequest(moduleId);
            if (result) {
              res.setHeader("Content-Type", "application/javascript");
              res.end(result.code);
            } else {
              res.statusCode = 404;
              res.end("Module not found");
            }
          } catch (error) {
            res.statusCode = 500;
            res.end("Internal server error");
          }
          return;
        }
        if (url.includes("__federation_expose_")) {
          if (req.method === "OPTIONS") {
            setCorsHeaders();
            res.statusCode = 204;
            res.end();
            return;
          }
          setCorsHeaders();
          try {
            const match = url.match(/__federation_expose_(.+?)\.js/);
            if (match) {
              const exposeName = match[1];
              const exposeItem = parsedOptions.devExpose.find((item) => {
                const itemName = removeNonRegLetter(item[0], NAME_CHAR_REG);
                return itemName === exposeName;
              });
              if (exposeItem && exposeItem[1] && exposeItem[1].import) {
                const modulePath = exposeItem[1].import;
                const result = await server.transformRequest(modulePath);
                if (result) {
                  res.setHeader("Content-Type", "application/javascript");
                  res.end(result.code);
                } else {
                  res.statusCode = 404;
                  res.end(`Module not found: ${modulePath}`);
                }
              } else {
                res.statusCode = 404;
                res.end(`Expose module not found: ${exposeName}`);
              }
            } else {
              res.statusCode = 400;
              res.end("Invalid expose module URL");
            }
          } catch (error) {
            console.error("Error loading expose module:", error);
            res.statusCode = 500;
            res.end("Internal server error");
          }
          return;
        }
        next();
      });
    },
  };
}