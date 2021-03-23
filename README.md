# axios-oauth2
This library makes oauth with axios easy.
There is a oauth-client, a token interceptor and caching.

## Quickstart
You can use only the client, or combine it with the token interceptor and caching.

### Simple client usage
```ts
import axios from 'axios';
import {clientFactory} from '@scienta/axios-oauth';
const client = clientFactory(axios.create(), {
  url: 'https://oauth.com/2.0/token',
  grant_type: 'client_credentials',
  client_id: 'foo',
  client_secret: 'bar',
  scope: 'baz'
});

const auth = await client(); // => { "access_token": "...", "expires_in": 900, ... }
```

### Client usage with interceptor
```ts
import axios from 'axios';
import {clientFactory, interceptorFactory} from '@scienta/axios-oauth';
const axiosInstance = axios.create();
axiosInstance.interceptors.request.use(
  interceptorFactory(clientFactory(axiosInstance, {
    url: 'https://oauth.com/2.0/token',
    grant_type: 'client_credentials',
    client_id: 'foo',
    client_secret: 'bar',
    scope: 'baz'
  }))
);
axiosInstance.get('https://oauth.com/2.0/protectedResource')
```

### Client usage with token-caching interceptor
```ts
import axios from 'axios';
import {clientFactory, interceptorFactory, LockingTokenCache} from '@scienta/axios-oauth';

const axiosInstance = axios.create();
axiosInstance.interceptors.request.use(
  interceptorFactory(
    clientFactory(axiosInstance, {
      url: 'https://oauth.com/2.0/token',
      grant_type: 'client_credentials',
      client_id: 'foo',
      client_secret: 'bar',
      scope: 'baz'
    }),
    new LockingTokenCache()
  )
);

axiosInstance.get('https://oauth.com/2.0/protectedResource')
```

## Locking cache (used by LockingTokenCache)
The `LockingTokenCache` class uses a separate library for locking and caching.
Locking cache is a caching-library suited for simple and complex locking while caching.
Locking with caching ensures that only one request is executed to request a token.
Want to know more? [@scienta/locking-cache](https://www.npmjs.com/package/@scienta/locking-cache).
