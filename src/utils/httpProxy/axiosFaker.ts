import defaultOption from './defaultOption';
import { isAbsoluteURL, promiseTimeout, serialize, transformHeader } from './utils';

export default class axiosFaker {
  private defaultOps: any;

  constructor(options: any) {
    this.defaultOps = {};
    Object.assign(this.defaultOps, defaultOption, options);
  }

  config(options: any) {
    Object.assign(this.defaultOps, options);
  }

  /**
   * define FaxiosRequest=>FaxiosResponse
   * @param req
   */
  async request(...req: any) {
    req = req || {};

    const customOps = req.config || {};
    let res;
    const timeout = customOps.timeout || this.defaultOps.timeout || 30000;
    req.config = Object.assign({}, this.defaultOps, req.config);
    try {
      const { url, requestInit } = await this.transformRequest(req);
      const response = await promiseTimeout(timeout, fetch(url, requestInit));
      res = await this.transformResponse(response, req);
      return res;
    } catch (err) {
      throw err;
    }
  }

  private async transformRequest(req: any) {
    const customOps = req.config || {};
    const reqOps = Object.assign({}, this.defaultOps, customOps);
    const { mode } = reqOps;
    const { method, params, data } = req[0];
    let url = req[0].url;
    let headers = req.headers;
    if (reqOps.baseURL && !isAbsoluteURL(url)) {
      url = url
        ? reqOps.baseURL.replace(/\/+$/, '') + '/' + url.replace(/^\/+/, '')
        : reqOps.baseURL;
    }
    if (!url) {
      throw new Error('request: url is undefined.');
    }

    if (!method) {
      throw new Error('request: method is undefined.');
    }

    if (method.toUpperCase() === 'GET') {
      url += '?' + serialize(params);
    }
    headers = Object.assign({}, this.defaultOps.headers, headers || {});
    let body = data;
    const contentType = headers['Content-Type'];
    if (body) {
      body = JSON.stringify(data);
    }
    // https://developer.mozilla.org/zh-CN/docs/Web/API/Request/Request
    const requestInit = {
      method,
      headers,
      body,
      mode,
    };
    return { url, requestInit };
  }

  private async transformResponse(response: any, req: any) {
    const resp = {
      data: null,
      status: response.status,
      statusText: response.statusText,
      headers: transformHeader(response.headers),
      config: req.config || {},
      request: req,
      originalResponse: response,
    };

    if (response.ok) {
      let contentType = response.headers.get('Content-Type') || 'application/json';
      contentType = contentType.toLowerCase();

      if (/^application\/json/.test(contentType)) {
        resp.data = await response.json();
      } else if (/^text\/plain/.test(contentType)) {
        resp.data = await response.text();
      } else if (/^application\/octet-stream/.test(contentType)) {
        resp.data = await response.blob();
      } else {
        try {
          resp.data = await response.json();
        } catch (e) {
          console.warn('unknow content-type to parse response!');
          // ignore...
        }
      }
    }
    return resp;
  }
}
