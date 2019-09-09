
import { OptionsRequest, Response } from './types';
import { Request } from './request';

const fetch = (url: string, options?: OptionsRequest): Promise<Response> => {
  if (!options) {
    options = {};
  }

  return new Request(url, options).send();
};

export * from './types';

export default fetch;
