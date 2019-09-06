export interface HeadersInit {
  [k: string]: string | number | any;
}

export type RequestRedirect = 'error' | 'follow' | 'manual';
export type MethodHttp = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD' | 'OPTION' | 'CONNECT';

export class Headers {
  [k: string]: string | number | any;

  constructor(init?: HeadersInit | undefined) {

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

  public append(key: string, value: string | number) {
    if (key) {
      this[key] = value;
    }
  }

  public has(key: string) {
    return !!this[key];
  }

  public raw(): Headers {
    return this;
  }

}