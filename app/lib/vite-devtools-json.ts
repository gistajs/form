import { randomUUID } from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import type { Plugin, ResolvedConfig } from 'vite'

type DevtoolsJsonOptions = {
  uuid?: string
  projectRoot?: string
  normalizeForWindowsContainer?: boolean
}

const endpoint = '/.well-known/appspecific/com.chrome.devtools.json'

export default function devtoolsJson(
  options: DevtoolsJsonOptions = {},
): Plugin {
  return {
    name: 'devtools-json',
    enforce: 'post',
    configureServer(server) {
      let { config } = server

      if (!config.env.DEV) return

      server.middlewares.use(endpoint, (_req, res) => {
        let root = normalizePath(resolveProjectRoot(config, options), options)
        let uuid = getOrCreateUuid(config, options)

        res.setHeader('Content-Type', 'application/json')
        res.end(
          JSON.stringify(
            {
              workspace: {
                root,
                uuid,
              },
            },
            null,
            2,
          ),
        )
      })
    },
    configurePreviewServer(server) {
      server.middlewares.use(endpoint, (_req, res) => {
        res.writeHead(404)
        res.end()
      })
    },
  }
}

function resolveProjectRoot(
  config: ResolvedConfig,
  options: DevtoolsJsonOptions,
) {
  if (options.projectRoot) return path.resolve(options.projectRoot)
  return path.isAbsolute(config.root)
    ? config.root
    : path.resolve(process.cwd(), config.root)
}

function getOrCreateUuid(config: ResolvedConfig, options: DevtoolsJsonOptions) {
  if (options.uuid) return options.uuid

  let cacheDir = path.isAbsolute(config.cacheDir)
    ? config.cacheDir
    : path.resolve(resolveProjectRoot(config, options), config.cacheDir)
  let uuidPath = path.join(cacheDir, 'uuid.json')

  if (fs.existsSync(uuidPath)) {
    let uuid = fs.readFileSync(uuidPath, 'utf8').trim()
    if (isUuid(uuid)) return uuid
  }

  fs.mkdirSync(cacheDir, { recursive: true })

  let uuid = randomUUID()
  fs.writeFileSync(uuidPath, uuid, 'utf8')
  return uuid
}

function normalizePath(root: string, options: DevtoolsJsonOptions) {
  if (options.normalizeForWindowsContainer === false) return root

  if (process.env.WSL_DISTRO_NAME) {
    let withoutLeadingSlash = root.replace(/^\//, '')
    return path
      .join(
        '\\\\wsl.localhost',
        process.env.WSL_DISTRO_NAME,
        withoutLeadingSlash,
      )
      .replace(/\//g, '\\')
  }

  if (process.env.DOCKER_DESKTOP && !root.startsWith('\\\\')) {
    let withoutLeadingSlash = root.replace(/^\//, '')
    return path
      .join('\\\\wsl.localhost', 'docker-desktop-data', withoutLeadingSlash)
      .replace(/\//g, '\\')
  }

  return root
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  )
}
