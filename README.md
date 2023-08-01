# Fetchstrings - fetch with multiple language strings

## Example

strings/en.json

```json
{
  "UNKNOWN_ERROR": "An unknown error has occurred.",
  "TEST_ERROR": "Test error!"
}
```

Strings server

```typescript
import Strings from "fetchstrings/dist/strings";
import express from "express";

const app = express();

app.use(express.json());

app.post("/", (req, res) => {
  const { id } = req.body;

  if (id === "test") {
    return res.status(400).send({
      reason: "TEST_ERROR",
    });
  }

  res.status(200).send({
    data: "hello world!",
  });
});

new Strings(app);

app.listen(3000, () => {
  console.log("Run!");
});
```

FetchStrings

```typescript
import FetchStrings from "fetchstrings";

const fetchStrings = new FetchStrings("http://localhost:3000");

(async () => {
  await fetchStrings.loadStrings("en");

  try {
    console.log(
      await fetchStrings.fetchStrings("/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id: "test" }),
      })
    );
  } catch (err) {
    console.log(err);
  }
})();
```

BaseAPI

```typescript
import { BaseAPI, Strings } from "./fetchstrings";

class TestAPI extends BaseAPI {
  async index(id: string) {
    return this.post("/", { id: id });
  }
}

(async () => {
  const testAPI = new TestAPI("http://localhost:3000");
  await testAPI.load("en");

  try {
    console.log(await testAPI.index("test"));
  } catch (err) {
    console.log(err);
  }
})();
```
