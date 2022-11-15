import { Consumer, EachMessagePayload, KafkaMessage } from 'kafkajs'
import { AppError } from '../utils/appError'
import { Topics } from '../types/topics'

interface Event {
    topic: Topics
    message: any
}

export abstract class BaseConsumer<T extends Event> {
    abstract topic: T['topic']
    abstract fromBeginning: boolean
    abstract onMessage(message: T['message'], payload: EachMessagePayload): void
    protected consumer: Consumer

    constructor(consumer: Consumer) {
        this.consumer = consumer
    }

    public consume = async () => {
        try {
            await this.consumer.connect()
            await this.consumer.subscribe({
                topic: this.topic,
                fromBeginning: this.fromBeginning // default if false
            })
            await this.consumer.run({
                eachMessage: async (payload: EachMessagePayload) => {
                    this.onMessage(this.parseMessage(payload.message), payload)
                },
            })
            console.log("Kafka Consumer started listening on topic:", this.topic)
        } catch (err: any) {
            throw new AppError(500, err.message, false, 'BASE_CONSUMER_ERROR', err.stack)
        }
    }

    private parseMessage = (message: KafkaMessage): undefined | T['message'] => {
        if (!message.value) return undefined
        return typeof message.value === 'string'
            ? JSON.parse(message.value)
            : JSON.parse(message.value?.toString('utf-8'))
    }
}

