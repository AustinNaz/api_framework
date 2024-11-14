import { Express } from 'express'
import { wssRooms, AuthRoute } from '../../types'
import { authRoute, isAuthorized} from '../../utils/authHelpers'
import { parseReq } from '../../helpers'
import logger from '../../utils/winston'

declare global {
  interface Routes<T extends Express | Router = Express> {
    app: T
    folderPath: string
    extras: {
      authRoute: AuthRoute
      isAuthorized: typeof isAuthorized
      ws?: wssRooms
      parseReq: typeof parseReq
      logger: typeof logger
    }
  }
}
