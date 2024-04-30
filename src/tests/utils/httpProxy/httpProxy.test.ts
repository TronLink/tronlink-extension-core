import { httpProxy } from '../../../utils';
import fetchApi from '../../../utils/httpProxy/fetch';

jest.mock('../../../utils/httpProxy/fetch');

describe('httpProxy', () => {
  let instance: httpProxy;
  let mockFetchApi: jest.Mocked<fetchApi>;

  beforeEach(() => {
    mockFetchApi = new fetchApi({}) as jest.Mocked<fetchApi>;
    (fetchApi as jest.Mock).mockReturnValue(mockFetchApi);
    instance = new httpProxy({ host: 'https://example.com' });
  });

  it('should create fetchApi instance on construction', () => {
    expect(fetchApi).toHaveBeenCalledWith({});
    expect(instance).toHaveProperty('instance', mockFetchApi);
  });

  it('should configure fetchApi instance on construction', () => {
    expect(mockFetchApi.config).toHaveBeenCalledWith({
      baseURL: 'https://example.com',
      timeout: 30000,
      headers: {},
      auth: false,
    });
  });

  it('should perform request using fetchApi instance', async () => {
    const endpoint = 'endpoint';
    const payload = { key: 'value' };
    const method = 'get';

    try {
      await instance.request(endpoint, payload, method);
    } catch (err) {
      // ignore
    }

    expect(mockFetchApi.request).toHaveBeenCalledWith({
      data: null,
      method: 'get',
      params: { key: 'value' },
      url: 'endpoint',
    });
  });
});
