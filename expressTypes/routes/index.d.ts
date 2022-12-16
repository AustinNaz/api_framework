import { Express } from 'express'
import { wssRooms, AuthRoute } from '../../types'
import { authRoute, isAuthorized} from '../../utils/authHelpers'
import logger from '../../utils/winston'

declare global {
  interface Routes {
    app: Express
    folderName: string
    extras: {
      logger: typeof logger
      authRoute: AuthRoute
      isAuthorized: typeof isAuthorized
      ws?: wssRooms
    }
  }
}
