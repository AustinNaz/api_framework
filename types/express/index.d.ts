import { FuncResStruct, FuncExpessMiddle } from "../../utils/responseData";

declare global {
  namespace Express {
    interface Request {
      success: FuncResStruct;
      failure: FuncResStruct;
      parseReq: FuncExpessMiddle;
    }
  }
}
