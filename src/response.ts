import { Headers } from './custom-types';

export class ResponseInit {

  public headers: Headers;
  public ok: boolean;
  public redirected?: boolean;
  public countRedirect?: number;
  public status?: number;
  public statusText?: string;
  public url?: string;
  public json: () => any;
  public text: () => string;
}
