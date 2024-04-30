import {
  serialize,
  transformHeader,
  promiseTimeout,
  isAbsoluteURL,
} from '../../../utils/httpProxy/utils';

describe('utils', () => {
  describe('serialize', () => {
    it('should serialize an object into a query string', () => {
      const result = serialize({ a: 1, b: 2 });
      expect(result).toEqual('a=1&b=2');
    });
  });

  describe('transformHeader', () => {
    it('should transform headers into an object', () => {
      const headers = new Headers({ 'Content-Type': 'application/json' });
      const result = transformHeader(headers);
      expect(result).toEqual({ 'content-type': 'application/json' });
    });
  });

  describe('promiseTimeout', () => {
    it('should reject if the promise does not resolve within the specified time', async () => {
      const promise = new Promise((resolve) => setTimeout(resolve, 2000));
      await expect(promiseTimeout(1000, promise)).rejects.toEqual('Timeout');
    });

    it('should resolve if the promise resolves within the specified time', async () => {
      const promise = Promise.resolve('Resolved');
      await expect(promiseTimeout(1000, promise)).resolves.toEqual('Resolved');
    });
  });

  describe('isAbsoluteURL', () => {
    it('should return true for absolute URLs', () => {
      const result = isAbsoluteURL('https://example.com');
      expect(result).toBe(true);
    });

    it('should return false for relative URLs', () => {
      const result = isAbsoluteURL('/path/to/resource');
      expect(result).toBe(false);
    });
  });
});
