const Routes = ({ app, folderName: routeName, ws }: Routes) => {
  app.get(routeName, (req, res, next) => {
    const { success, failure } = req;
    try {
      success({ res, next, body: "Welcome to the Framework!" });
    } catch (err) {
      console.log(err);
      return failure({ res, next, body: "Route Failed" });
    }
  });
};

export default Routes;
