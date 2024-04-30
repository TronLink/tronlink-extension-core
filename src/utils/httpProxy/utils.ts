function serialize(obj: any) {
  const str: string[] = [];
  for (const p in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, p)) {
      str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
    }
  }
  return str.join('&');
}

function transformHeader(headers: any) {
  const keys: any[] = Array.from(headers.keys());
  return keys.reduce((prev, key) => {
    prev[key] = headers.get(key);
    return prev;
  }, {});
}

function promiseTimeout(ms: number, promise: any) {
  // Create a promise that rejects in <ms> milliseconds
  const timeout = new Promise((resolve, reject) => {
    const id = setTimeout(() => {
      clearTimeout(id);
      reject('Timeout');
    }, ms);
  });
  // Returns a race between our timeout and the passed in promise
  return Promise.race([promise, timeout]);
}

function isAbsoluteURL(url: string) {
  return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(url);
}

export { serialize, transformHeader, promiseTimeout, isAbsoluteURL };
