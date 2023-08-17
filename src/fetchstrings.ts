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

class StringsError extends Error {
  constructor(name: string, message: string) {
    super(message);
    this.name = name;
  }
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
          if (
            res.ok &&
            res.headers.get("content-type")?.includes("application/json")
          ) {
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
  async fetchStrings<T>(path: string, option: RequestInit): Promise<T> {
    const res = await fetch(`${this.host}${path}`, option);
    let data: IError | any;

    if (res.headers.get("content-type")?.includes("application/json")) {
      try {
        data = await res.json();
      } catch (err: any) {
        throw new StringsError("UNKNOWN_ERROR", this.strings["UNKNOWN_ERROR"]);
      }
    } else {
      throw new StringsError("UNKNOWN_ERROR", this.strings["UNKNOWN_ERROR"]);
    }

    if (!res.ok) {
      const { reason } = data as IError;

      const reasonText = this.strings[reason];

      if (!reasonText) {
        throw new StringsError("UNKNOWN_ERROR", this.strings["UNKNOWN_ERROR"]);
      }

      throw new StringsError(reason, this.strings[reason]);
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
  private async sendToBody<T>(
    path: string,
    data: IData,
    option: RequestInit
  ): Promise<T> {
    option.body = JSON.stringify(data);
    option.headers = Object.assign(
      {
        "Content-Type": "application/json",
      },
      option.headers
    );
    return this.strings.fetchStrings<T>(path, option);
  }
  private async sendToURL<T>(
    path: string,
    data: IData,
    option: RequestInit
  ): Promise<T> {
    path = path + "?" + new URLSearchParams(data).toString();
    return this.strings.fetchStrings<T>(path, option);
  }
  /**
   * GET request
   * @param path path
   * @param data data
   * @param option request option
   * @returns data
   */
  protected async get<T>(
    path: string,
    data: IData,
    option?: RequestInit
  ): Promise<T> {
    option = option ? option : {};
    option.method = "GET";
    return this.sendToURL<T>(path, data, option);
  }
  /**
   * POST request
   * @param path path
   * @param data data
   * @param option request option
   * @returns data
   */
  protected async post<T>(
    path: string,
    data: IData,
    option?: RequestInit
  ): Promise<T> {
    option = option ? option : {};
    option.method = "POST";
    return this.sendToBody<T>(path, data, option);
  }
  /**
   * PUT request
   * @param path path
   * @param data data
   * @param option request option
   * @returns data
   */
  protected async put<T>(
    path: string,
    data: IData,
    option?: RequestInit
  ): Promise<T> {
    option = option ? option : {};
    option.method = "PUT";
    return this.sendToBody<T>(path, data, option);
  }
  /**
   * PATCH request
   * @param path path
   * @param data data
   * @param option request option
   * @returns data
   */
  protected async patch<T>(
    path: string,
    data: IData,
    option?: RequestInit
  ): Promise<T> {
    option = option ? option : {};
    option.method = "PATCH";
    return this.sendToBody<T>(path, data, option);
  }
  /**
   * DELETE request
   * @param path path
   * @param data data
   * @param option request option
   * @returns data
   */
  protected async delete<T>(
    path: string,
    data: IData,
    option?: RequestInit
  ): Promise<T> {
    option = option ? option : {};
    option.method = "DELETE";
    return this.sendToBody<T>(path, data, option);
  }
}

export default FetchStrings;
export { IError, BaseAPI };
