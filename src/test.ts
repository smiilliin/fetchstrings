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
