import {
    Kafka,
    KafkaConfig,
    RequestTimeoutEvent,
    ConsumerConfig,
    KafkaMessage,
    logLevel,
    ICustomPartitioner,
    PartitionerArgs,
    PartitionMetadata,
    CompressionTypes,
    Message,
    IHeaders,
    EachMessageHandler,
    EachMessagePayload,
    PartitionAssigners
} from 'kafkajs'
import axios from 'axios'

// ! Client configuration
const kafka = new Kafka({
    clientId: 'kafka-test',
    // brokers: ['PLAINTEXT://kafka-broker:9092'],
    // brokers: ['kafka1:9092', 'kafka2:9092'],
    brokers: async () => {
        // Example getting brokers from Confluent REST Proxy
        const clusterResponse = await axios.get('https://kafka-rest:8082/v3/clusters', {
            headers: { 'Content-Type': 'application/vnd.api+json' },
        })
        const clusterUrl = clusterResponse.data[0].links.self

        const brokersResponse = await axios.get(`${clusterUrl}/brokers`, {
            headers: { 'Content-Type': 'application/vnd.api+json' },
        })

        const brokers = brokersResponse.data.map((broker: any) => {
            const { host, port } = broker.attributes
            return `${host}:${port}`
        })

        return brokers
    },
    // ssl: {
    //     rejectUnauthorized: false,
    //     ca: [fs.readFileSync('/my/custom/ca.crt', 'utf-8')],
    //     key: fs.readFileSync('/my/custom/client-key.pem', 'utf-8'),
    //     cert: fs.readFileSync('/my/custom/client-cert.pem', 'utf-8')
    // },
    // sasl: {
    //     mechanism: 'plain',
    //     username: 'PLAINTEXT',
    //     password: 'test'
    // }
    // connectionTimeout: 3000,
    // requestTimeout: 25000
    // enforceRequestTimeout: false // disables Request timout
    retry: {
        maxRetryTime: 30000,
        initialRetryTime: 300,
        factor: 0.2, // Randomization factor
        multiplier: 2, // Exponential factor
        retries: 5, // Max number of retries per call
        restartOnFailure: async () => true // Only used in consumer. (error: Error) => Promise<boolean>
    },
    logLevel: logLevel.INFO, // default one, others: NOTHING, ERROR, WARN, and DEBUG
})

const start = async () => {
    // ! producer setup
    const producer = kafka.producer({
        createPartitioner: undefined, // default
        retry: undefined, // default
        metadataMaxAge: 300000, // default 5 min. The period of time in milliseconds after which we force a refresh of metadata even if we haven't seen any partition leadership changes to proactively discover any new brokers or partitions
        allowAutoTopicCreation: true, //Allow topic creation when querying metadata for non-existent topics
        transactionTimeout: 60000, // The maximum amount of time in ms that the transaction coordinator will wait for a transaction status update from the producer before proactively aborting the ongoing transaction
        idempotent: false, //Experimental. If enabled producer will ensure each message is written exactly once
        maxInFlightRequests: undefined //  Experimental. If enabled producer will ensure each message is written exactly once (no limit)
    })
    producer.on('producer.connect', () => {
        console.log(`KafkaProvider: connected`)
    })
    producer.on('producer.disconnect', () => {
        console.log(`KafkaProvider: disconnected`)
    })
    producer.on('producer.network.request_timeout', (data: RequestTimeoutEvent) => {
        console.log(`KafkaProvider: request timeout ${data.payload.clientId}`);
    })
    await producer.connect()
    // ! sending a message
    await producer.send({
        topic: 'test-topic',  // topic name
        messages: [
            {
                key: 'key1',
                value: 'Hello World', // Your message content, The value can be a Buffer, a string or null
                partition: 1, // Which partition to send the message to.
                timestamp: Date.now().toString(), // default, The timestamp of when the message was created.
                headers: {
                    'extraData': 'extraData', // Metadata to associate with your message.
                    'arrayData': ['extraData1', 'extraData2'] // Metadata to associate with your message.
                }
            }
        ],
        acks: -1, //default, Control the number of required acks.-1 = all insync replicas must acknowledge (default) 0 = no acknowledgments 1 = only waits for the leader to acknowledge
        timeout: 30000, // The time to await a response in ms
        compression: CompressionTypes.None //default others: GZIP, Snappy, LZ4, ZSTD 
    })

    // ! sending batch messages
    const topicMessages = [
        {
            topic: 'topic-a',
            messages: [{ key: 'key', value: 'hello topic-a' }],
        },
        {
            topic: 'topic-b',
            messages: [{ key: 'key', value: 'hello topic-b' }],
        },
        {
            topic: 'topic-c',
            messages: [
                {
                    key: 'key',
                    value: 'hello topic-c',
                    headers: {
                        'correlation-id': '2bfb68bb-893a-423b-a7fa-7b568cad5b67',
                    },
                }
            ],
        }
    ]
    await producer.sendBatch({ topicMessages })

    // ! Custom partitioner
    const MyPartitioner = () => {
        return ({ topic, partitionMetadata, message }: PartitionerArgs) => {
            // select a partition based on some logic
            // return the partition number
            return 0
        }
    }
    kafka.producer({ createPartitioner: MyPartitioner })


    // ! Consuming a message
    // ! consumer setup
    const consumer = kafka.consumer({
        groupId: 'test-group',
        partitionAssigners: [PartitionAssigners.roundRobin], // default, List of partition assigners
        sessionTimeout: 30000, //default, Timeout in milliseconds used to detect failures
        rebalanceTimeout: 60000, // deafult, The maximum time that the coordinator will wait for each member to rejoin when rebalancing the group
        heartbeatInterval: 3000, // deafult, The expected time in milliseconds between heartbeats to the consumer coordinator.
        metadataMaxAge: 300000, // ddefault, The period of time in milliseconds after which we force a refresh of metadata even if we haven't seen any partition leadership changes to proactively discover any new brokers or partitions
        allowAutoTopicCreation: true, // default, Allow topic creation when querying metadata for non-existent topics
        maxBytesPerPartition: 1048576, // 1MB default, The maximum amount of data per-partition the server will return
        minBytes: 1, // default, Minimum amount of data the server should return for a fetch request, otherwise wait up to maxWaitTimeInMs for more data to accumulate.
        maxBytes: 10485760, // 10MB default, 	Maximum amount of bytes to accumulate in the response. Supported by Kafka >= 0.10.1.0
        maxWaitTimeInMs: 5000, // default, The maximum amount of time in milliseconds the server will block before answering the fetch request if there isn’t sufficient data to immediately satisfy the requirement given by minBytes
        retry: { retries: 5 }, // default, 
        readUncommitted: false, //default, Configures the consumer isolation level. If false (default), the consumer will not return any transactional messages which were not committed.
        maxInFlightRequests: undefined, // default, Max number of requests that may be in progress at any time. If falsey then no limit.
        rackId: undefined, // default, Configure the "rack" in which the consumer resides to enable follower fetching
    })



    consumer.on('consumer.connect', () => {
        console.log('Consumer connected')
    })
    consumer.on('consumer.disconnect', () => {
        console.log('Consumer disonnected')
    })
    consumer.on('consumer.network.request_timeout', (data: RequestTimeoutEvent) => {
        console.log(`Kafka Consumer: request timeout ${data.payload.clientId}`);
    })
    await consumer.connect()

    // subscribing a topic
    await consumer.subscribe({
        topic: 'test-topic',
        fromBeginning: true // default if false
    })

    await consumer.run({
        partitionsConsumedConcurrently: 1, // default, in order to concurrently process several messages per once, you can increase
        eachMessage: async ({ topic, partition, message, heartbeat, pause }: EachMessagePayload) => {
            console.log({
                topic,
                partition,
                offset: message.offset,
                key: message.key?.toString(),
                value: message.value?.toString(),
                headers: message.headers,
            })
        },
    })

}

start().catch(console.error)