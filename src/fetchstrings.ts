import Strings from "./strings";

interface IError {
  reason: string;
}
interface IStrings {
  [key: string]: string;
}

class FetchStrings {
  host: string;
  lang: string = "en";
  strings: IStrings;

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
      return;
    } else {
      lang = "en";
      strings = await this.loadStringsRaw(lang);
    }
    if (Object.keys(strings).length != 0) {
      this.strings = strings;
    }
  }
  /**
   * Fetch with response strings
   * @param path Request path
   * @param option Request option
   * @returns response data or UNKNOWN ERROR
   */
  async fetchStrings(path: string, option: RequestInit): Promise<IError | any> {
    try {
      const res = await fetch(`${this.host}${path}`, option);
      let data: IError | any;

      if (res.headers.get("content-type")?.includes("application/json")) {
        data = await res.json();
      } else {
        data = {
          reason: "UNKNOWN_ERROR",
        };
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
    } catch (err: any) {
      if (err.message) {
        throw new Error(err.message);
      } else {
        throw new Error(this.strings["UNKNOWN_ERROR"]);
      }
    }
  }
}

export default FetchStrings;
export { IError, Strings };
