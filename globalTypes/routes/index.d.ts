import { Express } from 'express'
import { wssRooms, AuthRoute } from '../../types'
import { authRoute, isAuthorized} from '../../utils/authHelpers'

declare global {
  interface Routes {
    app: Express
    folderName: string
    extras?: {
      authRoute: AuthRoute
      isAuthorized: typeof isAuthorized
      ws?: wssRooms
    }
  }
}
