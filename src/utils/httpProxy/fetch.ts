import axiosFaker from './axiosFaker';

class fetchApi extends axiosFaker {
  async get(url: string, options: any) {
    options.method = 'GET';
    options.url = url;
    return this.request(options);
  }

  async post(url: string, options: any) {
    options.method = 'POST';
    options.url = url;
    return this.request(options);
  }

  async delete(url: string, options: any) {
    options.method = 'DELETE';
    options.url = url;
    return this.request(options);
  }

  async put(url: string, options: any) {
    options.method = 'PUT';
    options.url = url;
    return this.request(options);
  }

  async patch(url: string, options: any) {
    options.method = 'PATCH';
    options.url = url;
    return this.request(options);
  }
}

export default fetchApi;
