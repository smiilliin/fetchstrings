import Strings from "../src/strings";
import FetchStrings, { BaseAPI } from "../src/fetchstrings";
import express, { Response } from "express";
import assert from "assert";
import en from "./strings/en.json";

interface IError {
  reason: keyof typeof en;
}
interface IData {
  data: string;
}

describe("Fetchstrings test", () => {
  const app = express();

  app.use(express.json());

  app.get("/admin", (req, res: Response<IError | IData>) => {
    const { name } = req.query;

    if (name == "smile") {
      return res.status(200).send({ data: "hello!" });
    }
    res.status(400).send({
      reason: "NOT_ADMIN",
    });
  });
  app.post("/welcome", (req, res: Response<IError | IData>) => {
    const { name } = req.body;

    if (name == "smile") {
      return res.status(400).send({
        reason: "SO_BEAUTIFUL_ERROR",
      });
    }
    res.status(200).send({ data: "hello!" });
  });
  app.post("/iq", (req, res: Response<IError | IData>) => {
    const { name } = req.body;
    if (name == "smile") {
      return res.status(400).send({
        reason: "I'M_FOOL_ERROR",
      });
    }
    res.status(200).send({ data: "wow!" });
  });

  const strings = new Strings("./test/strings");

  strings.use(app);

  let server: any;
  let port: number;

  it("Express server listen", async () => {
    let done = false;
    for (let i = 3010; !done; i++) {
      done = await new Promise<boolean>((resolve) => {
        try {
          server = app.listen(i, () => {
            port = i;
            resolve(true);
          });
        } catch {
          resolve(false);
        }
      });
    }
  });
  let koFetch: FetchStrings;
  let enFetch: FetchStrings;
  let wrongFetch: FetchStrings;

  it("FetchStrings - ko", async () => {
    koFetch = new FetchStrings(`http://localhost:${port}`);

    await koFetch.loadStrings("ko");
  });
  it("FetchStrings - en", async () => {
    enFetch = new FetchStrings(`http://localhost:${port}`);
    await enFetch.loadStrings("en");
  });
  it("FetchStrings - wrong language", async () => {
    wrongFetch = new FetchStrings(`http://localhost:${port}`);
    await wrongFetch.loadStrings("wrong");
  });

  const throwsError = async (callback: Promise<any>) => {
    let error = false;
    try {
      await callback;
    } catch {
      error = true;
    }

    return error;
  };

  it("Fetch test1 - ko", async () => {
    const throwsError1 = await throwsError(
      koFetch.fetchStrings("/welcome", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "smile" }),
      })
    );
    const throwsError2 = await throwsError(
      koFetch.fetchStrings("/iq", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "smile" }),
      })
    );
    assert(throwsError1);
    assert(throwsError2);
  });
  it("Fetch test2 - ko", async () => {
    const data1 = await koFetch.fetchStrings("/welcome", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: "person" }),
    });
    const data2 = await koFetch.fetchStrings("/iq", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: "person" }),
    });
    assert(data1);
    assert(data2);
  });
  it("Fetch test1 - en", async () => {
    const throwsError1 = await throwsError(
      enFetch.fetchStrings("/welcome", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "smile" }),
      })
    );
    const throwsError2 = await throwsError(
      enFetch.fetchStrings("/iq", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "smile" }),
      })
    );
    assert(throwsError1);
    assert(throwsError2);
  });
  it("Fetch test2 - en", async () => {
    const data1 = await enFetch.fetchStrings("/welcome", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: "person" }),
    });
    const data2 = await enFetch.fetchStrings("/iq", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: "person" }),
    });
    assert(data1);
    assert(data2);
  });

  class TestAPI extends BaseAPI {
    constructor(host: string) {
      super(host);
    }
    async admin(name: string) {
      return this.get("/admin", { name: name });
    }
    async welcome(name: string) {
      return this.get("/welcome", { name: name });
    }
  }
  let testAPI: TestAPI;
  it("TestAPI load", async () => {
    testAPI = new TestAPI(`http://localhost:${port}`);
    await testAPI.load("ko");
  });
  it("TestAPI admin", async () => {
    assert(await testAPI.admin("smile"));
  });
  it("TestAPI welcome", async () => {
    assert(await throwsError(testAPI.welcome("smile")));
  });

  it("Close express server", () => {
    server.close();
  });
});
