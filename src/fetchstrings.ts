import Strings from "./strings";

interface IError {
  reason: string;
}
interface IStrings {
  [key: string]: string;
}
interface IData {
  [key: string]: any;
}

class FetchStrings {
  host: string;
  lang: string = "en";
  strings: IStrings;
  loaded: boolean;

  /**
   * FetchStriings constructor
   * @param host host to fetch
   * @param lang string language
   * @param loadStrings boolean whether to load strings
   */
  constructor(host: string) {
    this.host = host;
    this.strings = {
      UNKNOWN_ERROR: "An unknown error has occurred.",
    };
    this.loaded = false;
  }

  private async loadStringsRaw(lang: string): Promise<IStrings> {
    return new Promise<IStrings>((resolve) => {
      fetch(`${this.host}/strings/${lang}.json`)
        .then(async (res) => {
          if (res.ok && res.headers.get("content-type")?.includes("application/json")) {
            const strings = await res.json();

            resolve(strings);
          }
          resolve({});
        })
        .catch((err) => {
          console.error(err);
          resolve({});
        });
    });
  }
  /**
   * load strings
   * @param lang to load language
   * @returns promise
   */
  async loadStrings(lang: string): Promise<void> {
    let strings = await this.loadStringsRaw(lang);
    if (Object.keys(strings).length != 0) {
      this.strings = strings;
    } else {
      lang = "en";
      strings = await this.loadStringsRaw(lang);

      if (Object.keys(strings).length != 0) {
        this.strings = strings;
      }
    }
    this.loaded = true;
  }
  /**
   * Fetch with response strings
   * @param path Request path
   * @param option Request option
   * @returns response data or UNKNOWN ERROR
   */
  async fetchStrings(path: string, option: RequestInit): Promise<IError | any> {
    if (!this.loaded) console.log("Fetchstring Warning: this class not loaded");

    const res = await fetch(`${this.host}${path}`, option);
    let data: IError | any;

    if (res.headers.get("content-type")?.includes("application/json")) {
      try {
        data = await res.json();
      } catch (err: any) {
        throw new Error(this.strings["UNKNOWN_ERROR"]);
      }
    } else {
      throw new Error(this.strings["UNKNOWN_ERROR"]);
    }

    if (!res.ok) {
      const { reason } = data as IError;

      const reasonText = this.strings[reason];

      if (!reasonText) {
        throw new Error(this.strings["UNKNOWN_ERROR"]);
      }

      throw new Error(this.strings[reason]);
    } else {
      return data;
    }
  }
}

class BaseAPI {
  strings: FetchStrings;

  /**
   * Initialize
   * @param host
   */
  constructor(host: string) {
    this.strings = new FetchStrings(host);
  }

  /**
   * Load fetchstrings
   * @param lang language
   */
  async load(lang: string) {
    return this.strings.loadStrings(lang);
  }
  private async sendToBody(path: string, data: IData, option: RequestInit) {
    option.body = JSON.stringify(data);
    option.headers = Object.assign(
      {
        "Content-Type": "application/json",
      },
      option.headers
    );
    return this.strings.fetchStrings(path, option);
  }
  private async sendToURL(path: string, data: IData, option: RequestInit) {
    path = path + "?" + new URLSearchParams(data).toString();
    return this.strings.fetchStrings(path, option);
  }
  /**
   * GET request
   * @param path path
   * @param data data
   * @param option request option
   * @returns data
   */
  protected async get(path: string, data: IData, option?: RequestInit) {
    option = option ? option : {};
    option.method = "GET";
    return this.sendToURL(path, data, option);
  }
  /**
   * POST request
   * @param path path
   * @param data data
   * @param option request option
   * @returns data
   */
  protected async post(path: string, data: IData, option?: RequestInit) {
    option = option ? option : {};
    option.method = "POST";
    return this.sendToBody(path, data, option);
  }
  /**
   * PUT request
   * @param path path
   * @param data data
   * @param option request option
   * @returns data
   */
  protected async put(path: string, data: IData, option?: RequestInit) {
    option = option ? option : {};
    option.method = "PUT";
    return this.sendToBody(path, data, option);
  }
  /**
   * DELETE request
   * @param path path
   * @param data data
   * @param option request option
   * @returns data
   */
  protected async delete(path: string, data: IData, option?: RequestInit) {
    option = option ? option : {};
    option.method = "DELETE";
    return this.sendToBody(path, data, option);
  }
}

export default FetchStrings;
export { IError, BaseAPI };
