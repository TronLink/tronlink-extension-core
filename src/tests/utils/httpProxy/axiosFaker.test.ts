import axiosFaker from '../../../utils/httpProxy/axiosFaker';

describe('axiosFaker', () => {
  let instance: any;
  let originalFetch: any;

  beforeEach(() => {
    instance = new axiosFaker({});
    originalFetch = global.fetch;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('should handle successful GET request', async () => {
    const mockResponse = new Response(JSON.stringify({ foo: 'bar' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    global.fetch = () => Promise.resolve(mockResponse);

    const result = await instance.request({ url: 'https://example.com', method: 'GET' });

    expect(result.data).toEqual({ foo: 'bar' });
    expect(result.status).toEqual(200);
  });

  it('should handle successful POST request', async () => {
    const mockResponse = new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    global.fetch = () => Promise.resolve(mockResponse);

    const result = await instance.request({
      url: 'https://example.com',
      method: 'POST',
      data: { foo: 'bar' },
    });

    expect(result.data).toEqual({ success: true });
    expect(result.status).toEqual(200);
  });

  it('should handle failed request', async () => {
    const mockResponse = new Response(null, {
      status: 404,
      statusText: 'Not Found',
    });
    global.fetch = () => Promise.resolve(mockResponse);

    const result = await instance.request({ url: 'https://example.com', method: 'GET' });

    expect(result.status).toEqual(404);
    expect(result.statusText).toEqual('Not Found');
  });

  it('should throw error when url is undefined', async () => {
    instance = new axiosFaker({ baseURL: '' });
    await expect(instance.request({ method: 'GET' })).rejects.toThrow('request: url is undefined.');
  });

  it('should throw error when url is undefined while using default config', async () => {
    await expect(instance.request({ method: 'GET' })).rejects.toThrow(
      'Failed to parse URL from /?',
    );
  });

  it('should throw error when method is undefined', async () => {
    await expect(instance.request({ url: 'https://example.com' })).rejects.toThrow(
      'request: method is undefined.',
    );
  });

  it('should handle "text/plain" content type', async () => {
    const mockResponse = new Response('Hello, World!', {
      status: 200,
      headers: { 'Content-Type': 'text/plain' },
    });
    global.fetch = () => Promise.resolve(mockResponse);

    const result = await instance.request({ url: 'https://example.com', method: 'GET' });

    expect(result.data).toEqual('Hello, World!');
    expect(result.status).toEqual(200);
  });

  it('should handle "application/octet-stream" content type', async () => {
    const blob = new Blob(['Hello, World!'], { type: 'application/octet-stream' });
    const mockResponse = new Response(blob, {
      status: 200,
      headers: { 'Content-Type': 'application/octet-stream' },
    });
    global.fetch = () => Promise.resolve(mockResponse);

    const result = await instance.request({ url: 'https://example.com', method: 'GET' });

    expect(result.data).toEqual(blob);
    expect(result.status).toEqual(200);
  });

  it('should handle "text/unknown" content type', async () => {
    const mockResponse = new Response(JSON.stringify({ foo: 'bar' }), {
      status: 200,
      headers: { 'Content-Type': 'text/unknown' },
    });
    global.fetch = () => Promise.resolve(mockResponse);

    const result = await instance.request({ url: 'https://example.com', method: 'GET' });

    expect(result.data).toEqual({ foo: 'bar' });
    expect(result.status).toEqual(200);
  });

  it('should handle "text/unknown" content type error', async () => {
    const mockResponse = new Response('hello world', {
      status: 200,
      headers: { 'Content-Type': 'text/unknown' },
    });
    global.fetch = () => Promise.resolve(mockResponse);

    const result = await instance.request({ url: 'https://example.com', method: 'GET' });

    expect(result.data).toEqual(null);
    expect(result.status).toEqual(200);
  });
});
