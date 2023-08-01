import express from "express";

class Strings {
  /**
   * Strings constructor
   * @param app express app
   * @param stringsPath strings directory path
   */
  constructor(app: express.Express, stringsPath: string = "./src/strings") {
    app.use(
      "/strings",
      express.static(stringsPath, {
        extensions: ["json"],
      })
    );
  }
}

export default Strings;
