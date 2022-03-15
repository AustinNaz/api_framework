import path from "path";
import fs from "fs";
import { Response, NextFunction } from "express";
import { Options } from 'express-jsdoc-swagger'

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

export function recursiveRoutes({ app, folderName, ws, extras }: Routes) {
  fs.readdirSync(folderName).forEach(async (file) => {
    const fullName = path.join(folderName, file);
    const stat = fs.lstatSync(fullName);

    try {
      if (stat.isDirectory()) {
        recursiveRoutes({ app, folderName: fullName, ws, extras });
      } else if (file.toLowerCase().indexOf(".js")) {
        if (file === 'helpers.ts' || file === 'helpers.js') return
        const Routes: { default: ({}: Routes) => void } = await import(
          "./" + fullName
        );
        Routes.default({ app, folderName: stripFilePath(folderName), ws, extras });
        console.log("require('" + fullName + "')");
      }
    } catch (err) {
      console.log(err);
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

export const options: Options = {
  info: {
    version: '1.0.0',
    title: 'Express API'
  },
  baseDir: __dirname,
  filesPattern: './routes/**/index.ts',
  exposeSwaggerUI: true,
  apiDocsPath: '/api-docs'
}
