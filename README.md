# faa-swim-consumer-js
Solace Consumer library for ingesting messages from the FAA's System Wide Information Management (SWIM) endpoint. Mainly Java resources/examples were released by the FAA, and the very few existing open-source solutions were abandoned. I created this library as a way for JS/TS developers to get started quickly with SWIM, or serve as a start for your own custom implementation.

## Installation
Install the library via your package manager of choice:

```shell
# Install via npm
npm install faa-swim-consumer

# Or yarn
yarn add faa-swim-consumer

# Or pnpm
pnpm install faa-swim-consumer
```
## Getting Started

* Ensure you have access to [SWIM](https://www.faa.gov/air_traffic/technology/swim/products/get_connected)
* Select one or more data feeds to subscribe to and ensure they are ready to go
* Obtain the credentials / connection information from the subscription page
* Read the [SWIM User Guide](https://files.swim.faa.gov/documents/user_guide.pdf)
* **Make sure you are always following the SWIM terms of service and [LADD](https://www.faa.gov/pilots/ladd) requirements**

## Usage
Below you'll find all available configuration options - quite a few are exposed that probably won't be needed, but are there in case it's needed in the future. These include `extraSessionProperties`, `extraConsumerProperties`, `queueProperties`, and `solClientOptions`. The only optional field you may need to pass is `onNewRawMessage`, if you would like the library to obtain the XML automatically and pass it along to a function of your choosing. See the examples below for more information on attaching your own message listener instead if needed.

To use the consumer, you must first initialize the consumer and then connect to the consumer. The options can be found below:

* `SWIMConsumerOptions`: Initialization options for SWIMConsumer
  * `sessionOptions` (object, required): Options for connecting to a session (url, username, password, etc)
    * `url` (string, required): JMS Connection URL with port (ex. tcps://ems2.swim.faa.gov:55443)
    * `vpnName` (string, required): Message VPN assigned to the subscription (ex. FDPS)
    * `userName` (string, required): Connection username
    * `password` (string, required): Connection password
    * `extraSessionProperties` (object, optional): Additional session properties to pass to the Session constructor
  * `messageConsumerOptions` (object, required): Options for the Message Consumer (queue name, hooks, etc)
    * `queueName` (string, required): Queue Name (ex. user.example.com.FDPS.824bd0a3-3aec-40eb-b68f-dc406fa2d01a.OUT)
    * `onNewRawMessage` (function, optional): Hook to send raw XML messages to received by the consumer
    * `extraConsumerProperties` (object, optional): Additional message consumer properties to pass to the MessageConsumer constructor
    * `queueProperties` (object, optional): Queue properties to pass to the MessageConsumer's Queue
  * `solClientOptions` (object, optional): Optional parameters to pass to the SolClient Factory to initialize the class
    * `profile` (string, optional): Profile Version to use for the Solclient Factory (default = `Profiles.Version10`)
    * `logLevel` (LogLevel, optional): Log level (default = `LogLevel.TRACE`)
    * `logger` (object, optional): Logger to use (default = `console.log`)

```typescript
// ES6
import { SWIMConsumer } from 'faa-swim-consumer'

// CommonJS
const { SWIMConsumer } = require('faa-swim-consumer')

const handleIncomingRawMessage = (messageXML: string | null) => {
  console.log('New Message Received:', messageXML)
}

// Instantiate the SWIM Consumer
const swim = new SWIMConsumer({
  sessionOptions: {
    url: 'tcps://ems2.swim.faa.gov:55443',
    userName: 'user.example.com',
    // You should use an .env file instead to store this versus raw text
    password: 'abcd1234',
    vpnName: 'FDPS'
  },
  messageConsumerOptions: {
    queueName: 'user.example.com.FDPS.7e7b7c5d-ce85-4ede-bf00-3d4d94f73949.OUT',
    onNewRawMessage: handleIncomingRawMessage
  }
})
swim.connect() // Connect to the Consumer

// Or, instead use your own event listeners
const swim = new SWIMConsumer({
  ...,
  messageConsumerOptions: {
    queueName: 'user.example.com.FDPS.7e7b7c5d-ce85-4ede-bf00-3d4d94f73949.OUT'
  }
})
swim.connect() // Connect to the Consumer

// Setup a listener on the `MESSAGE` event for the consumer
// More info can be found in the `Events` section
swim.consumer.on(
  solace.MessageConsumerEventName.MESSAGE,
  (msg) => {
    console.log('New message received:', msg.getXmlContent())
  }
)

// Later, if you need to disconnect/stop the Consumer
// swim.disconnect()
```

**Note**: If you use the `onNewRawMessage` parameter, the message is automatically converted from `solace.Message` to the raw XML text. If you don't use this hook and instead use your own event listener like above, you'll need to use `msg.getXmlContent()` to convert it if needed.

## Events

Both the Session and the MessageConsumer emit numerous events, such as connection states, messages, and others. By default, the `solclientjs` library retries it's connection if it runs into any issues while running.

### Session

The list of all `SessionEventCode` values can be found [here](https://docs.solace.com/API-Developer-Online-Ref-Documentation/js/solace.SessionEventCode.html#static_properties).

```typescript
const swim = new SWIMConsumer({ ... })

// Watch an SessionEventCode
swim.session.on(solace.SessionEventCode.DISCONNECTED, () => { ... })
```

### MessageConsumer

The list of all `MessageConsumerEventName` values can be found [here](https://docs.solace.com/API-Developer-Online-Ref-Documentation/js/solace.MessageConsumerEventName.html#static_properties).

```typescript
const swim = new SWIMConsumer({ ... })

// Watch an SessionEventCode
swim.consumer.on(solace.MessageConsumerEventName.DOWN, () => { ... })
```

## Usage Resources

* [SWIM User Guide](https://files.swim.faa.gov/documents/user_guide.pdf)
* [Solace Javascript Client Docs](https://docs.solace.com/API-Developer-Online-Ref-Documentation/nodejs/index.html)
* [FAA Data](https://www.faa.gov/data)
