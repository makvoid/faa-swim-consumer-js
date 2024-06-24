import solace from 'solclientjs'

export interface SolClientOptions {
  /**
   * Profile Version to use for the Solclient Factory
   */
  profile?: solace.SolclientFactoryProfiles

  /**
   * Log level (default = LogLevel.TRACE)
   */
  logLevel?: solace.LogLevel

  /**
   * Logger to use (default = console.log)
   */
  logger?: solace.LogImpl
}

export interface SessionOptions {
  /**
   * JMS Connection URL with port (ex. tcps://ems2.swim.faa.gov:55443)
   */
  url: string

  /**
   * Message VPN assigned to the subscription (ex. FDPS)
   */
  vpnName: string

  /**
   * Connection username
   */
  userName: string

  /**
   * Connection password
   */
  password: string

  /**
   * Additional session properties to pass to the Session constructor
   */
  extraSessionProperties?: Partial<solace.SessionProperties>
}

export interface MessageConsumerOptions {
  /**
   * Queue Name (ex. user.example.com.FDPS.824bd0a3-3aec-40eb-b68f-dc406fa2d01a.OUT)
   */
  queueName: string

  /**
   * Hook to send raw XML messages to that are received by the consumer
   *
   * @param newMessage raw xml string of message
   * @returns void
   */
  onNewRawMessage?: (newMessage: string | null) => void

  /**
   * Additional message consumer properties to pass to the MessageConsumer constructor
   */
  extraConsumerProperties?: Partial<solace.MessageConsumerProperties>

  /**
   * Queue properties to pass to the MessageConsumer's Queue
   */
  queueProperties?: Partial<solace.QueueProperties>
}

/**
 * Initialization options for the SWIMConsumer
 */
export interface SWIMConsumerOptions {
  /**
   * Optional parameters to pass to the SolClient Factory to initialize the class
   */
  solClientOptions?: SolClientOptions

  /**
   * Options for connecting to a session (url, username, password, etc)
   */
  sessionOptions: SessionOptions

  /**
   * Options for the Message Consumer (queue name, mode, etc)
   */
  messageConsumerOptions: MessageConsumerOptions
}

/**
 * Takes an incoming `SWIMConsumerOptions` object and applies any defaults if needed.
 * Intended for internal use by the `SWIMConsumer` class. If you are just setting up
 * the configuration parameters, just use `SWIMConsumerOptions`.
 */
export class SWIMConsumerOptionsFactory implements SWIMConsumerOptions {
  solClientOptions?: SolClientOptions = {
    profile: solace.SolclientFactoryProfiles.version10,
    logLevel: solace.LogLevel.TRACE
  }

  sessionOptions: SessionOptions
  messageConsumerOptions: MessageConsumerOptions

  constructor (options: SWIMConsumerOptions) {
    if (options.solClientOptions) {
      this.solClientOptions = {
        profile: options.solClientOptions.profile
          ? options.solClientOptions.profile
          : solace.SolclientFactoryProfiles.version10,
        logLevel: options.solClientOptions.logLevel
          ? options.solClientOptions.logLevel
          : solace.LogLevel.TRACE,
        logger: options.solClientOptions.logger
          ? options.solClientOptions.logger
          : undefined
      }
    }
    this.sessionOptions = options.sessionOptions
    this.messageConsumerOptions = options.messageConsumerOptions
  }
}
