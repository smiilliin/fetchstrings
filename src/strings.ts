import express from "express";
import path from "path";

class Strings {
  router: express.Router;

  /**
   * Strings constructor
   * @param stringsPath strings directory path
   */
  constructor(stringsPath: string = "./strings") {
    this.router = express.Router();
    this.router.use(
      express.static(stringsPath, {
        extensions: ["json"],
      })
    );
  }
  /**
   * Use strings router
   * @param app Express app
   */
  use(app: express.Express) {
    app.use("/strings", this.router);
  }
}

export default Strings;
