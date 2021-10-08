import { Express } from 'express'

declare global {
  interface Routes {
    app: Express
    folderName: string
    extras?: any
  }
}
