import models from "../models";
import { mailer, templates } from "./mailer";
import { success, failure, authFailure } from "./responseData";

export default {
  success,
  failure,
  authFailure,
  models,
  mailer,
  templates,
};
