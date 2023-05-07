import 'virtual:sfc-list'

import { handlers } from './plugin/server-function.server'

import express from 'express'
import multer from 'multer'
import bodyParser from 'body-parser'

console.log(handlers)

import { createServer } from 'vite'
import path from 'path'
import { ACTION_PREFIX, RedirectError } from './plugin/server-function-utils'

const storage = multer.memoryStorage()
const upload = multer({ storage: storage });

async function wrapHandle (handler: (arg: any) => any, value: any) {
  try {
    const res = await handler(value)
    return {
      type: 'return' as const,
      value: res
    }
  } catch (err) {
    if (err instanceof RedirectError) {
      return {
        type: 'redirect' as const,
        url: err.url
      }
    } else {
      return {
        type: 'error' as const,
        error: (err as any)?.stack ?? String(err)
      }
    }
  }
}

(async () => {
  const app = express()

  const vite = await createServer({
    configFile: path.resolve(__dirname, './vite.config.client.ts'),
    server: { middlewareMode: true },
  })

  app.use(ACTION_PREFIX + ':name', bodyParser.json(), bodyParser.urlencoded(), upload.any(), (req, res, next) => {
    const name = req.params.name

    if (handlers[name]) {
      console.log(req.body)
      wrapHandle(handlers[name] as any, req.body).then(result => {
        switch (result.type) {
          case 'error':
            return res.status(500).end(result.error)
          case 'return':
            return res.status(200).jsonp(result.value)
          case 'redirect':
            return res.redirect(result.url)
        }
      })
    } else {
      next()
    }
  })

  app.use(vite.middlewares)

  const server = app.listen(1337, () => {
    const address = server.address()
    if (typeof address === 'object') {
      console.log(`listening at ${address?.address}:${address?.port}`)
    } else {
      console.log(`listening at ${address}`)
    }
  })
})()