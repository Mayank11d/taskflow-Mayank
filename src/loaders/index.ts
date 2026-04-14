import { Application } from "express";
import dbLoader from "./db";
import expressLoader from "./express";

const initLoaders = async (app: Application): Promise<void> => {
  await dbLoader();
  console.log("DB Loader done");

  expressLoader(app);
  console.log("Express Loader done");
};

export default initLoaders;
