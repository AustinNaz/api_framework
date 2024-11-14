const Routes = ({ app, folderPath: routeName, extras: { logger } }: Routes) => {
  /**
   * Get /
   * @summary This is the first endpoint
   * @returns {string} 200 - success response
   * @tags index
   */
  app.get(routeName, (req, res, next) => {
    const { success, failure } = req;
    try {
      success({ res, next, body: "Welcome to the Framework!" });
    } catch (err) {
      logger.error(err);
      return failure({ res, next, body: "Route Failed" });
    }
  });
};

export default Routes;
