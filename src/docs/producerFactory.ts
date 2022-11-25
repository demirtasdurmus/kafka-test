import {
    Kafka, logCreator, logLevel, Producer, ProducerBatch, TopicMessages, Message, RecordMetadata, CompressionTypes,
    Consumer, ConsumerSubscribeTopics, EachMessagePayload, EachBatchPayload
} from 'kafkajs'
interface CustomMessageFormat { a: string }

export class ProducerFactory {
    private producer: Producer

    constructor() {
        this.producer = this.createProducer()
    }

    public async connect(): Promise<void> {
        try {
            await this.producer.connect()
            console.log("Producer Connected")
        } catch (error) {
            console.log('Error connecting the producer: ', error)
        }
    }

    public async shutdown(): Promise<void> {
        await this.producer.disconnect()
    }

    public async sendBatch(messages: Array<CustomMessageFormat>): Promise<void> {
        const kafkaMessages: Array<Message> = messages.map((message) => {
            return {
                value: JSON.stringify(message)
            }
        })

        const topicMessages: TopicMessages = {
            topic: 'test-topic',
            messages: kafkaMessages
        }

        const batch: ProducerBatch = {
            topicMessages: [topicMessages]
        }

        await this.producer.sendBatch(batch)
    }

    public async send(): Promise<RecordMetadata[]> {
        return await this.producer.send({
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
    }

    private createProducer(): Producer {
        const kafka = new Kafka({
            clientId: 'producer-client',
            brokers: ['localhost:9092'],
        })
        return kafka.producer()
    }
}