// @ts-ignore
import { providers } from 'tronweb';
import fetchApi from './fetch';
// use fetch

const { HttpProvider } = providers;

interface Params {
  host: string;
  timeout?: number;
  user?: any;
  password?: any;
  headers?: any;
  statusPage?: string;
}

export default class httpProxy extends HttpProvider {
  // @ts-ignore
  private instance: fetchApi;

  constructor({
    host,
    timeout = 30000,
    user = false,
    password = false,
    headers = {},
    statusPage = '/',
  }: Params) {
    super(host, timeout, user, password, headers);
    this.instance = this.createInstance({
      baseURL: host,
      timeout: timeout,
      headers: headers,
      auth: user && {
        user,
        password,
      },
    });
  }

  createInstance(params: any) {
    const fetchInstance = new fetchApi({});
    fetchInstance.config(params);
    return fetchInstance;
  }
  // @ts-ignore
  request(endpoint: any, payload = {}, method = 'get') {
    // @ts-ignore
    return super.request(endpoint, payload, method);
  }
}
