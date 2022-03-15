import { Express } from 'express'
import { wssRooms } from '../../types'

declare global {
  interface Routes {
    app: Express
    folderName: string
    ws?: wssRooms
    extras?: any
  }
}
