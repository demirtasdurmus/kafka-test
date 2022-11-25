import {
    Kafka, logCreator, logLevel, Producer, ProducerBatch, TopicMessages, Message, RecordMetadata, CompressionTypes,
    Consumer, ConsumerSubscribeTopics, EachMessagePayload, EachBatchPayload
} from 'kafkajs'


export class ConsumerFactory {
    private kafkaConsumer: Consumer
    private messageProcessor: any

    public constructor(messageProcessor: any) {
        this.messageProcessor = messageProcessor
        this.kafkaConsumer = this.createKafkaConsumer()
    }

    public async startConsumer(): Promise<void> {
        const topic: ConsumerSubscribeTopics = {
            topics: ['test-topic'],
            fromBeginning: false
        }

        try {
            await this.kafkaConsumer.connect()
            await this.kafkaConsumer.subscribe(topic)

            await this.kafkaConsumer.run({
                eachMessage: async (messagePayload: EachMessagePayload) => {
                    try {
                        const { topic, partition, message } = messagePayload
                        const prefix = `${topic}[${partition} | ${message.offset}] / ${message.timestamp}`
                        console.log("------Message received")
                        // console.log(`- ${prefix} ${message.key}#${message.value}`)
                        console.log("***", message.value?.toString())
                    } catch (error) {
                        console.log("Consumer error", error)
                    }
                }
            })
        } catch (error) {
            console.log('Error: ', error)
        }
    }

    public async listen() {
        // subscribing a topic
        this.kafkaConsumer.on('consumer.connect', () => {
            console.log('Consumer connected')
        })
        await this.kafkaConsumer.connect()
        await this.kafkaConsumer.subscribe({
            topic: 'test-topic',
            fromBeginning: true // default if false
        })

        await this.kafkaConsumer.run({
            // partitionsConsumedConcurrently: 1, // default, in order to concurrently process several messages per once, you can increase
            eachMessage: async ({ topic, partition, message, heartbeat, pause }: EachMessagePayload) => {
                console.log("------Message received")
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

    public async startBatchConsumer(): Promise<void> {
        const topic: ConsumerSubscribeTopics = {
            topics: ['example-topic'],
            fromBeginning: false
        }

        try {
            await this.kafkaConsumer.connect()
            await this.kafkaConsumer.subscribe(topic)
            await this.kafkaConsumer.run({
                eachBatch: async (eachBatchPayload: EachBatchPayload) => {
                    const { batch } = eachBatchPayload
                    for (const message of batch.messages) {
                        const prefix = `${batch.topic}[${batch.partition} | ${message.offset}] / ${message.timestamp}`
                        console.log(`- ${prefix} ${message.key}#${message.value}`)
                    }
                }
            })
        } catch (error) {
            console.log('Error: ', error)
        }
    }

    public async shutdown(): Promise<void> {
        await this.kafkaConsumer.disconnect()
    }

    private createKafkaConsumer(): Consumer {
        const kafka = new Kafka({
            clientId: 'client-id',
            brokers: [`localhost:9092`]
        })
        const consumer = kafka.consumer({ groupId: 'consumer-group' })
        return consumer
    }
}