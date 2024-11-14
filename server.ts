require('dotenv').config()
const cors = require('cors')
import express, { Router } from 'express'
import mongoose, { ConnectOptions } from 'mongoose'
import bodyParser from 'body-parser'
import websocket from './utils/websocket'
import expressJSDocSwagger from 'express-jsdoc-swagger'
import helmet from 'helmet'

import {
  injectData,
  traverseFolders,
  populateRoutes,
  options,
  parseReq,
  cleanLookupTable,
  addRoutes,
  updateRoutes,
  deleteRoutes,
  stripFilePath
} from './helpers'
import injectableData from './utils/injectableData'
import { authRoute, isAuthorized } from './utils/authHelpers'
import logger, { middleWareLogger } from './utils/winston'
import watcher from './utils/chokidar'
import firebase from "./utils/firebase";


const app = express()
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(bodyParser.text())
// app.use(cors())
// app.options('*', cors())
app.use(helmet())
app.use(middleWareLogger)

const port = process.env.PORT || '5000'
const dbUri = process.env.MONGODB_HOST || ''
const routesPath = 'routes/'
let lookupTable: [string, number, number][]

mongoose
  .connect(dbUri, { useUnifiedTopology: true, useNewUrlParser: true } as ConnectOptions)
  .then(() => console.log(`MongoDB connected!`))
  .catch(err => console.error('Could not connect to MongoDB: ' + err))

const server = app.use(injectData(injectableData)) // Injects the extra data
// set WS=ENABLED in .env file to enable websocket
const ws = process.env.WS === 'ENABLED' ? websocket(server) : undefined

const customAuth = authRoute({
  // Replace this with your own auth function, needs to return a token with a uid, role and email
  verifyIdToken: (token) => firebase.auth().verifyIdToken(token),
});

app.listen(port, async () => {
  console.log('Setting up Routes. Please Wait')

  lookupTable = cleanLookupTable(
    traverseFolders({
      app,
      folderPath: routesPath
    })
  )

  await populateRoutes({
    app,
    extras: { authRoute: customAuth, isAuthorized, ws, parseReq, logger },
    lookupTable
  })

  console.log(`Listening to requests on port: ${port}`)
  console.log('lookup', lookupTable)
})

expressJSDocSwagger(app)(options)

watcher(routesPath).on('all', async (event, filePath) => {
  console.log('Route file change detected:', event, filePath)

  try {
    if (event === 'change' || event === 'add') {
      console.log({ lookupTable })
      // Not sure if using delete here leaves this behind
      delete require.cache[require.resolve('./' + filePath)]
      const Routes: { default: ({}: Routes<Router>) => void } = await import('./' + filePath)
      if (!Routes || typeof Routes.default !== 'function')
        return console.log('null or not a function')

      const newRouter = express.Router()
      newRouter.use(injectData(injectableData))
      const extras = { authRoute: customAuth, isAuthorized, ws, parseReq, logger }

      Routes.default({
        app: newRouter,
        folderPath: stripFilePath(filePath),
        extras
      })

      if (event === 'add') addRoutes(filePath, app._router.stack, newRouter.stack, lookupTable)
      else if (event === 'change')
        updateRoutes(filePath, app._router.stack, newRouter.stack, lookupTable)
    } else if (event === 'unlink') deleteRoutes(filePath, app._router.stack, lookupTable)
  } catch (e) {
    console.log(e)
  }
})
