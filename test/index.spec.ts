import Strings from "../src/strings";
import FetchStrings from "../src/fetchstrings";
import express from "express";
import assert from "assert";

describe("Fetchstrings test", () => {
  const app = express();

  app.use(express.json());

  app.post("/welcome", (req, res) => {
    const { name } = req.body;

    if (name == "smile") {
      return res.status(400).send({
        reason: "SO_BEAUTIFUL_ERROR",
      });
    }
    res.status(200).send({ data: "hello!" });
  });
  app.post("/iq", (req, res) => {
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

  it("FetchStrings - ko", async () => {
    koFetch = new FetchStrings(`http://localhost:${port}`, "ko");
    await koFetch.loadStrings();
  });
  it("FetchStrings - en", async () => {
    enFetch = new FetchStrings(`http://localhost:${port}`, "en");
    await enFetch.loadStrings();
  });

  const throwsError = async (callback: () => Promise<any>) => {
    let error = false;
    try {
      await callback();
    } catch {
      error = true;
    }

    return error;
  };

  it("Fetch test1 - ko", async () => {
    const throwsError1 = await throwsError(async () => {
      await koFetch.fetchStrings("/welcome", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "smile" }),
      });
    });
    const throwsError2 = await throwsError(async () => {
      await koFetch.fetchStrings("/iq", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "smile" }),
      });
    });
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
    const throwsError1 = await throwsError(async () => {
      await enFetch.fetchStrings("/welcome", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "smile" }),
      });
    });
    const throwsError2 = await throwsError(async () => {
      await enFetch.fetchStrings("/iq", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: "smile" }),
      });
    });
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

  it("Close express server", () => {
    server.close();
  });
});
