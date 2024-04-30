import fetchApi from '../../../utils/httpProxy/fetch';

describe('fetchApi', () => {
  let instance: fetchApi;
  let mockFetch: jest.Mock;

  beforeEach(() => {
    instance = new fetchApi({});
    mockFetch = jest.fn();
    global.fetch = mockFetch;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should successfully perform a GET request', async () => {
    const mockResponse = new Response(JSON.stringify({ data: 'test' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    mockFetch.mockResolvedValue(mockResponse);

    const response = await instance.get('https://example.com', {});

    expect(response.data).toEqual({ data: 'test' });
  });

  it('should successfully perform a POST request', async () => {
    const mockResponse = new Response(JSON.stringify({ data: 'test' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    mockFetch.mockResolvedValue(mockResponse);

    const response = await instance.post('https://example.com', {});

    expect(response.data).toEqual({ data: 'test' });
  });

  it('should successfully perform a DELETE request', async () => {
    const mockResponse = new Response(JSON.stringify({ data: 'test' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    mockFetch.mockResolvedValue(mockResponse);

    const response = await instance.delete('https://example.com', {});

    expect(response.data).toEqual({ data: 'test' });
  });

  it('should successfully perform a PUT request', async () => {
    const mockResponse = new Response(JSON.stringify({ data: 'test' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    mockFetch.mockResolvedValue(mockResponse);

    const response = await instance.put('https://example.com', {});

    expect(response.data).toEqual({ data: 'test' });
  });

  it('should successfully perform a PATCH request', async () => {
    const mockResponse = new Response(JSON.stringify({ data: 'test' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
    mockFetch.mockResolvedValue(mockResponse);

    const response = await instance.patch('https://example.com', {});

    expect(response.data).toEqual({ data: 'test' });
  });

  it('should handle GET request failure', async () => {
    mockFetch.mockRejectedValue(new Error('Failed to fetch'));

    await expect(instance.get('https://example.com', {})).rejects.toThrow('Failed to fetch');
  });

  // Similar tests can be written for 'post', 'delete', 'put', 'patch' methods
});
