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

import type { PluginHooks } from '../../types/pluginHooks'
import { parseSharedOptions } from '../utils'
import { parsedOptions } from '../public'
import type { VitePluginFederationOptions } from 'types'

export function devSharedPlugin(
  options: VitePluginFederationOptions
): PluginHooks {
  parsedOptions.devShared = parseSharedOptions(options)

  return {
    name: 'originjs:shared-development'
  }
}
