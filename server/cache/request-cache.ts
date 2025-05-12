
import NodeCache from 'node-cache';

const cache = new NodeCache({
  stdTTL: 300, // 5 minutes default TTL
  checkperiod: 60
});

export const cacheMiddleware = (ttl = 300) => {
  return (req: any, res: any, next: any) => {
    if (req.method !== 'GET') {
      return next();
    }

    const key = `${req.originalUrl}`;
    const cachedResponse = cache.get(key);

    if (cachedResponse) {
      return res.json(cachedResponse);
    }

    const originalJson = res.json;
    res.json = (body: any) => {
      cache.set(key, body, ttl);
      return originalJson.call(res, body);
    };

    next();
  };
};
