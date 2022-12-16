import winston from 'winston'
import { Request, Response, NextFunction } from 'express'

const { combine, timestamp, printf, colorize, align } = winston.format

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    colorize({ all: true }),
    timestamp({
      format: 'YYYY-MM-DD hh:mm:ss.SSS A'
    }),
    align(),
    printf(info => `[${info.timestamp}] ${info.level}: ${info.message}`)
  ),
  transports: [
    process.env.NODE_ENV !== 'PROD'
      ? new winston.transports.Console()
      : new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/info.log', level: 'info' })
  ]
})

const middleWareLogger = (req: Request, res: Response, next: NextFunction) => {
  logger.info(req.originalUrl)
  next()
}

export default logger
export { middleWareLogger }
