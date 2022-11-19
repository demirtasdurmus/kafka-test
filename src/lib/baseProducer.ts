import { Producer, IHeaders, CompressionTypes } from 'kafkajs'
import { AppError } from '../utils/appError'
import { SenderConfig } from '../interfaces/senderConfig'
import { Topics } from '../types/topics'
import { ACKS } from '../types/acks'
interface Event {
    topic: Topics
    message: any
}

export abstract class BaseProducer<T extends Event> {
    abstract topic: T['topic']
    protected producer: Producer

    constructor(producer: Producer) {
        this.producer = producer
    }

    public produce = async (messages: T['message'][], config?: SenderConfig) => {
        try {
            console.log("Producing an event on topic:", this.topic)
            return await this.producer.send({
                /*
                Topic to produce the event
                */
                topic: this.topic,
                /*
                An array of objects
                */
                messages: messages.map((message: T['message']) => {
                    return {
                        /*
                        Used for partitioning.
                        */
                        key: message.key,
                        /*
                        Your message content. The value can be a Buffer, a string or null.
                        The value will always be encoded as bytes when sent to Kafka. 
                        When consumed, the consumer will need to interpret the value according to your schema.
                        */
                        value: JSON.stringify(message.value),
                        /*
                        Which partition to send the message to
                        */
                        partition: message.partition,
                        /*
                        The timestamp of when the message was created. Default: Date.now()-string
                        */
                        timestamp: message.timestamp,
                        /*
                        Metadata to associate with your message
                        */
                        headers: message.headers
                    }
                }),
                /*
                Control the number of required acks.-1 = all insync replicas must acknowledge (default)
                0 = no acknowledgments 1 = only waits for the leader to acknowledge
                */
                acks: config?.acks ? config.acks : ACKS.Acknowledge,
                /*
                The time to await a response in ms, default 30000
                 */
                timeout: config?.timeout ? config.timeout : 30000,
                /*
                Compression codec, default CompressionTypes.None others: GZIP, Snappy, LZ4, ZSTD
                */
                compression: config?.compressionType ? config.compressionType : CompressionTypes.None
            })
        } catch (err: any) {
            throw new AppError(500, err.message, false, 'BASE_PRODUCER_ERROR', err.stack)
        }
    }
}