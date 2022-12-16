import models from '../../models'
import { mailer, templates } from '../../utils/mailer'
import { success, failure, authFailure } from '../../utils/responseData'
import { UserToken } from '../../types'

declare global {
  namespace Express {
    interface Request {
      success: typeof success
      failure: typeof failure
      authFailure: typeof authFailure
      userToken?: UserToken
      models: typeof models
      mailer: typeof mailer
      templates: typeof templates
    }
  }
}
