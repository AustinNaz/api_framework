const Routes = ({ app, folderName: routeName }: Routes) => {
  app.get(routeName, (req, res, next) => {
    const { success } = req;
    success({ res, next, body: "Scrape Scrape!" });
  });
};

export default Routes;
