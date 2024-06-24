import solace from 'solclientjs'

import {
  SWIMConsumerOptions,
  SWIMConsumerOptionsFactory
} from '@/models'

/**
 * SWIM Consumer class
 */
export class SWIMConsumer {
  private options: SWIMConsumerOptionsFactory
  session: solace.Session
  consumer: solace.MessageConsumer

  constructor (options: SWIMConsumerOptions) {
    this.options = new SWIMConsumerOptionsFactory(options)

    const factoryOptions = new solace.SolclientFactoryProperties({
      profile: this.options.solClientOptions?.profile,
      logLevel: this.options.solClientOptions?.logLevel,
      logger: this.options.solClientOptions?.logger
    })
    solace.SolclientFactory.init(factoryOptions)

    const extraSessionProperties = this.options.sessionOptions.extraSessionProperties
      ? this.options.sessionOptions.extraSessionProperties
      : {}

    // Setup the session for the consumer
    this.session = solace.SolclientFactory.createSession({
      authenticationScheme: solace.AuthenticationScheme.BASIC,
      url: this.options.sessionOptions.url,
      vpnName: this.options.sessionOptions.vpnName,
      userName: this.options.sessionOptions.userName,
      password: this.options.sessionOptions.password,
      ...(extraSessionProperties as solace.SessionProperties)
    })

    const extraConsumerProperties = this.options.messageConsumerOptions.extraConsumerProperties
      ? this.options.messageConsumerOptions.extraConsumerProperties
      : {}

    // Setup the MessageConsumer for the active session
    this.consumer = this.session.createMessageConsumer({
      queueDescriptor: new solace.QueueDescriptor({
        type: solace.QueueType.QUEUE,
        name: this.options.messageConsumerOptions.queueName,
        ...(extraConsumerProperties as solace.MessageConsumerProperties)
      }),
      queueProperties: this.options.messageConsumerOptions.queueProperties
    })

    // Setup a listener on the MESSAGE event if `onNewRawMessage` was supplied
    if (this.options.messageConsumerOptions.onNewRawMessage) {
      this.consumer.on(solace.MessageConsumerEventName.MESSAGE, (msg) => {
        this.options.messageConsumerOptions.onNewRawMessage!(msg.getXmlContent())
      })
    }
  }

  /**
   * Shortcut to session.connect() and consumer.connect()
   */
  connect () {
    this.session.connect()
    this.consumer.connect()
  }

  /**
   * Shortcut to consumer.disconnect() and session.disconnect()
   */
  disconnect () {
    this.consumer.disconnect()
    this.session.disconnect()
  }
}
