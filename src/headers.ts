export interface HeadersInit {
  [key: string]: string | number;
}

export class Headers {
  [k: string]: string | number | any;

  constructor(init?: HeadersInit) {
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

  public append(key: string, value: string | number): void {
    if (key) {
      this[key] = value;
    }
  }

  public has(key: string): boolean {
    return !!this[key];
  }

  public raw(): { [k: string]: string[] } {
    return this;
  }
}
