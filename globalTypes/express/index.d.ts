import { success, failure, parseReq } from '../../utils/responseData'

declare global {
  namespace Express {
    interface Request {
      success: typeof success
      failure: typeof failure
      parseReq: typeof parseReq
    }
  }
}
