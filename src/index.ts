import path from 'path'
import hasha from 'hasha'
import del from 'del'
import execa from 'execa'
import os from 'os'

async function main() {
  const existingHashes: string[] = []
  await download()
  const referenceHashes = await getHashes()
  console.log(`Reference hashes for concurrency 1:`)
  console.log('Query Engine, Migration Engine, Introspection Engine')
  console.log(referenceHashes)
  existingHashes.push(referenceHashes)

  for (let i = 0; i < 100; i++) {
    /** Clear all caches */
    await del('**', {
      cwd: path.join(os.homedir(), '.cache/prisma'),
      deep: 10,
    } as any)
    await del('*engine*', {
      cwd: path.join(__dirname, '../'),
    } as any)
    // get between 2 and 5 parallel downloads
    const arr = new Array(getRandomNumber()).fill(undefined)
    console.log(`Concurrency: ${arr.length}`)
    await Promise.all(arr.map(() => download()))
    const hashes = await getHashes()
    if (!existingHashes.includes(hashes)) {
      console.error(`Got new hash, looks like we have a reproduction 🎉`)
      existingHashes.push(hashes)
    }
    console.log(hashes)
  }
}

async function download() {
  try {
    await execa.command(`ts-node ${path.join(__dirname, 'downloader.ts')}`)
  } catch (e) {
    console.error(e.message)
  }
}

main()

function getRandomNumber(min = 2, max = 3) {
  const delta = max - min
  return Math.round(Math.random() * delta) + min
}

async function getHashes() {
  const hashes = await Promise.all([
    hasha.fromFile(path.join(__dirname, '../query-engine-darwin'), {
      algorithm: 'sha256',
    }),
    hasha.fromFile(path.join(__dirname, '../migration-engine-darwin'), {
      algorithm: 'sha256',
    }),
    hasha.fromFile(path.join(__dirname, '../introspection-engine-darwin'), {
      algorithm: 'sha256',
    }),
  ])
  return hashes.join(', ')
}
