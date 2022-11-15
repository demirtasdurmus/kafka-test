import { Producer } from 'kafkajs'
import { AppError } from '../utils/appError'
import { Topics } from '../types/topics'

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

    public produce = async (message: T['message'],) => {
        try {
            await this.producer.connect()
            await this.producer.send({
                topic: this.topic,  // topic name
                messages: [
                    {
                        // key: 'key1',
                        value: JSON.stringify(message), // Your message content, The value can be a Buffer, a string or null
                        // partition: 0, // Which partition to send the message to.
                        // timestamp: Date.now().toString(), // default, The timestamp of when the message was created.
                        // headers: {
                        //     'extraData': 'extraData', // Metadata to associate with your message.
                        //     'arrayData': ['extraData1', 'extraData2'] // Metadata to associate with your message.
                        // }
                    }
                ],
                // acks: -1, //default, Control the number of required acks.-1 = all insync replicas must acknowledge (default) 0 = no acknowledgments 1 = only waits for the leader to acknowledge
                // timeout: 30000, // The time to await a response in ms
                // compression: CompressionTypes.None //default others: GZIP, Snappy, LZ4, ZSTD 
            })
            // await this.producer.disconnect()
            console.log("Produced an event on topic:", this.topic)
        } catch (err: any) {
            throw new AppError(500, err.message, false, 'BASE_PRODUCER_ERROR', err.stack)
        }
    }
}