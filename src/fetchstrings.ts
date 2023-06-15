interface IError {
  reason: string;
}

class FetchStrings {
  host: string;
  lang: string;
  strings: any;

  /**
   * FetchStriings constructor
   * @param host host to fetch
   * @param lang string language
   * @param loadStrings boolean whether to load strings
   */
  constructor(host: string, lang: string, loadStrings: boolean = false) {
    this.host = host;
    this.lang = lang;
    this.strings = {
      UNKNOWN_ERROR: "An unknown error has occurred.",
    };

    if (loadStrings) {
      this.loadStrings();
    }
  }
  /**
   * Load strings
   */
  async loadStrings() {
    return new Promise<void>((resolve) => {
      fetch(`${this.host}/strings/${this.lang}.json`)
        .then(async (res) => {
          if (
            res.ok &&
            res.headers.get("content-type")?.includes("application/json")
          ) {
            const data = await res.json();

            this.strings = data;
          }
        })
        .catch((err) => {
          console.error(err);
        })
        .finally(() => {
          resolve();
        });
    });
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
export { IError };
