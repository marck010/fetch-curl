
import * as Types from './types';
import {Request} from './request';

const fetch = (url: string, options?: Types.OptionsRequest): Promise<Types.ResponseInit> => {
  if (!url || typeof url !== 'string') {
    throw new Error('Url must be string');
  }

  if (!options) {
    options = {};
  }

  return new Request(url, options).send();
};

export {Types};
export default fetch;
