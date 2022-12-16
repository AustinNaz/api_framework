require("dotenv").config();
const cors = require("cors");

import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import websocket from "./utils/websocket";
import helmet from "helmet";
import expressJSDocSwagger from "express-jsdoc-swagger";

import firebase from "./utils/firebase";
import { authRoute, isAuthorized } from "./utils/authHelpers";
import { injectData, recursiveRoutes, options } from "./helpers";
import injectableData from "./utils/injectableData";
import logger, { middleWareLogger } from './utils/winston'

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(cors());
app.options("*", cors());
app.use(helmet());
app.use(middleWareLogger)

const port = process.env.PORT || "5000";
const dbUri = process.env.MONGODB_HOST || "";

if (dbUri)
  mongoose
    // .connect(dbUri, { useUnifiedTopology: true, useNewUrlParser: true })
    .connect(dbUri)
    .then(() => logger.info(`MongoDB connected [${dbUri}]`))
    .catch((err) => logger.error("Could not connect to MongoDB:", err));

app.use(injectData(injectableData)); // Injects the extra data

const server = app.listen(port, () => {
  logger.info(`Listening to requests on port: ${port}`);
});

// set WS=ENABLED in .env file to enable websocket
const ws = process.env.WS === "ENABLED" ? websocket(server) : undefined;

expressJSDocSwagger(app)(options);

const firebaseAuth = authRoute({
  // Replace this with your own auth function, needs to return a token with a uid, role and email
  verifyIdToken: (token) => firebase.auth().verifyIdToken(token),
});

recursiveRoutes({
  app,
  folderName: "routes",
  extras: { authRoute: firebaseAuth, isAuthorized, ws, logger },
}); // Creates the routes
