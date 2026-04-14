import express, { Application } from "express";
import initLoaders from "./loaders/index";


const createApp = async (): Promise<Application> => {
  const app = express();
  await initLoaders(app);
  return app;
};

export default createApp;
