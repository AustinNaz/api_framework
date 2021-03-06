require("dotenv").config();
const cors = require("cors");

import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import websocket from "./utils/websocket";
import helmet from "helmet"
import expressJSDocSwagger from "express-jsdoc-swagger";

import { injectData, recursiveRoutes, options } from "./helpers";
import injectableData from "./utils/injectableData";

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(bodyParser.text());
app.use(cors());
app.options("*", cors());
app.use(helmet());

const port = process.env.PORT || "5000";
const dbUri = process.env.MONGODB_HOST || "";

if (dbUri)
  mongoose
    // .connect(dbUri, { useUnifiedTopology: true, useNewUrlParser: true })
    .connect(dbUri)
    .then(() => console.log(`MongoDB connected [${dbUri}]`))
    .catch((err) => console.error("Could not connect to MongoDB:", err));

app.use(injectData(injectableData)); // Injects the extra data

const server = app.listen(port, () => {
  console.log(`Listening to requests on port: ${port}`);
});

// set WS=ENABLED in .env file to enable websocket
const ws = process.env.WS === "ENABLED" ? websocket(server) : undefined;

expressJSDocSwagger(app)(options)

recursiveRoutes({ app, folderName: "routes", ws }); // Creates the routes
