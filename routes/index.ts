// module.exports = (app, routeName) => {
//   app.get(routeName, (req, res) => {
//       res.send('Welcome to Jk Charms API!')
//   });
// }

import { Express } from "express";
import { RoutesType } from "../helpers";

const Routes = ({ app, folderName: routeName }: RoutesType) => {
  app.get(routeName, (req, res) => {
    res.send("Welcome to the Framework!");
  });
};

export default Routes;
