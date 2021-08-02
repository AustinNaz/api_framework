import path from "path";
import fs from "fs";
import { Express, Response, NextFunction } from "express";
// const path = require("path");
// const fs = require("fs");

export type RoutesType = {
  app: Express;
  folderName: string;
  extras?: any;
};

function stripFilePath(filePath: string) {
  if (filePath.includes("routes")) {
    if (filePath === "routes") {
      return "/";
    }
    return filePath.slice(filePath.indexOf("/"));
  }

  if (filePath.includes("index.js")) {
    console.log("includes FileName");
  }
  return "";
}

export function recursiveRoutes({ app, folderName, extras }: RoutesType) {
  fs.readdirSync(folderName).forEach(async (file) => {
    const fullName = path.join(folderName, file);
    const stat = fs.lstatSync(fullName);

    if (stat.isDirectory()) {
      recursiveRoutes({ app, folderName: fullName, extras });
    } else if (file.toLowerCase().indexOf(".js")) {
      console.log(stripFilePath(folderName));
      const Routes: { default: ({}: RoutesType) => void } = await import(
        "./" + fullName
      );
      Routes.default({ app, folderName: stripFilePath(folderName), extras });
      console.log("require('" + fullName + "')");
    }
  });
}

export function injectData(data: any) {
  return (req: any, res: Response, next: NextFunction) => {
    Object.keys(data).map((item) => {
      req[item] = data[item];
    });
    next();
  };
}
