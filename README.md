# Amity Social Cloud Typescript SDK

## Getting Started

- With npm: `npm install @amityco/ts-sdk`
- With yarn: `yarn add @amityco/ts-sdk`

## Runtime support

- Modern browsers (es2017 compliant)
- NodeJS (via esm imports)
- React-Native

## Creating a client instance

To connect your users to our platform, you need to create a client instance and connect it.

```ts
import { Client } from '@amityco/ts-sdk';

(async () => {
  const sessionHandler: Amity.SessionHandler = {
    sessionWillRenewAccessToken(renewal: Amity.Renewal) {
      renewal.renew();
      /*
       * If using an auth token
       *
       * try {
       *  renew.renewWithAuthToken(authToken)
       * } catch() {
       *  sdk will try to renew again at a later time
       *
       *  renew.unableToRetrieveAuthToken()
       * }
       */
    },
  };
  const client = Client.createClient(API_KEY, API_REGION);

  let isConnected = await Client.login({ userId: USER_ID }, sessionHandler);
})();
```

The `API_KEY` and `API_REGION` are given at the time you create an application in the [Amity Portal](http://portal.amity.co/).

You can listen to disconnection by using the `onClientDisconnected` function:

```ts
import { Client } from '@amityco/ts-sdk';

const unsub = Client.onClientDisconnected(() => (isConnected = false));
```

The `unsub`'s return value is a _dispose function_ which is used to clean the memory of your client's application. It's been designed to fit perfectly with React, in a useEffect such as:

````ts
useEffect(() => onClientConnected(() => setConnected(false)), [])

## Going further

### Domain types

All the necessary types are automatically exposed in the `Amity` namespace. As long as you import the SDK once, the namespace will be available in your workspace. You can start to type `Amity.` and see the list of types in your intellisense after having imported the SDK in any file of your project.

### Subscribing to real time events

We expose a couple of functions for your to receive simply the events that could fire from our servers, for example, if another user would change their display name, or if a channel would receive a new message.

The `subscribeTopic` method retuns an unsubscriber that can be called on clean up to stop recieving further events.

```ts
import { subscribeTopic, getUserTopic } from '@amityco/ts-sdk'

const unsub = subscribeTopic(getUserTopic({} as Amity.User))
````

### Observe an object using Live Object

For an _'all-in-one'_ approach, we expose live objects, which allow to fetch an object _and_ register to its changes all at once. This has been designed to fit with React's useState and useEffect:

```ts
import { UserRepository } from '@amityco/ts-sdk'

const Component = ({ userId }: { userId: string }) => {
  const [user, setUser] = useState<Amity.User>({})

  useEffect(() => UserRepository.getUser(userId, ({ data: user, loading, error }) => {
    // ensure you call unsub() on cleanup or unmount
    const unsub = subscribeTopic(getUserTopic(user))

    setUser(user)
  }), [userId])

  return <div>{JSON.stringify(user, null, 2)}
}
```

### Observe a collection using Live Collection

Similar to the concept of live object, we expose live collection, which allow to fetch a collection _and_ register to its changes all at once. This has been designed to fit with React's useState and useEffect:

```ts
import { UserRepository.getUsers } from '@amityco/ts-sdk'

const Component = () => {
  const [users, setUsers] = useState<Amity.User[]>({})

  useEffect(() => UserRepository.getUsers({}, ({ data, loading, error, nextPage, hasNextPage }) => {
    // ensure you call unsub() on cleanup or unmount
    // Subscribe to each user in collection for getting real time updates

    setUsers(users)
  }), [userId])

  return <div>{JSON.stringify(user, null, 2)}
}
```

## Documentation

To see the comprehensive documentation please visit [our documentation page](https://docs.amity.co).

If you have any questions, you can visit our [forum](https://forum.amity.co/).
