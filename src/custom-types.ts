interface HeaderKeyValuePair { [k: string]: string | number; }

export class Headers {
  constructor(init?: Headers | HeaderKeyValuePair) {

    if (init) {
      const headerNames = Object.keys(init);

      for (const headerName of headerNames) {
        this.append(headerName, init[headerName]);
      }
    }
  }

  public get(name: string): string {
    return this[name];
  }

  public append(key, value) {
    if (key) {
      this[key] = value;
    }
  }

  public has(key) {
    return !!this[key];
  }

  public raw() {
    return this;
  }

}

export type RequestRedirect = 'error' | 'follow' | 'manual';
