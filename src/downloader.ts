#!/usr/bin/env ts-node

import { download } from '@prisma/fetch-engine'
import path from 'path'

async function downloadIt(version: string) {
  try {
    await waitRandomTime()
    const result = await download({
      binaries: {
        'introspection-engine': path.join(__dirname, '../'),
        'migration-engine': path.join(__dirname, '../'),
        'query-engine': path.join(__dirname, '../'),
      },
      version,
      ignoreCache: true,
    })
  } catch (e) {
    console.error(e)
  }
}

downloadIt('4ff8379527ec7797e7bb5b55d374f82f5812a6f9')

function waitRandomTime() {
  return new Promise(r => {
    const timeout = Math.round(Math.random() * 2000)
    setTimeout(r, timeout)
  })
}
