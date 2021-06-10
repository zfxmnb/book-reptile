import React, { ReactElement, useCallback } from 'react';

let LRUCache: any;
const getCache = () => {
  if (!LRUCache) {
    const LRU = require('lru-cache');
    LRUCache = new LRU({
      max: 1024 * 1024 * 100,
      maxAge: 1000 * 60 * 60 * 24
    });
  }
  return LRUCache;
};

const SSR: React.FC<{
  id: string;
  children: React.ReactElement;
}> = ({ id, children }) => {
  const getChildNode = useCallback((): string => {
    const cache = getCache();
    const hash = require('object-hash');
    const hashStr = hash(children.props);
    const cacheKey = `${id}${hashStr}`;
    if (cache.has(cacheKey)) {
      return cache.get(cacheKey) || '';
    }
    const ReactDomServer = require('react-dom/server');
    const html = ReactDomServer.renderToString(children as ReactElement<any>);
    cache.set(cacheKey, html);
    console.log('html', html);
    return html;
  }, []);
  return typeof window === 'object' ? <>{children}</> : <>{getChildNode()}</>;
};

export default SSR;
