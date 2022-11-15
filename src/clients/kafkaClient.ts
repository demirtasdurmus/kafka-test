import { Kafka, Consumer, Producer, ProducerConfig, KafkaConfig, ConsumerConfig } from "kafkajs"


class KafkaClient {
    private _kafka?: Kafka
    private _producer?: Producer
    private _consumer?: Consumer

    // if you want to use a uniform producer instance call this getter
    get producer() {
        if (!this._producer) throw new Error('Please create a provider with <createProducer> method first')
        return this._producer
    }

    // if you want to use a uniform consumer instance call this getter
    get consumer() {
        if (!this._consumer) throw new Error('Please create a consumer with <createConsumer> method first')
        return this._consumer
    }

    // configure Kafka client with necessary credentials 
    public config = (config: KafkaConfig) => {
        this._kafka = new Kafka(config)
    }

    // create a producer instance for class itself and also return
    public createProducer = (config?: ProducerConfig | undefined): Producer => {
        if (!this._kafka) throw new Error('Configure Kafka first with <config> method')
        this._producer = this._kafka!.producer(config)
        return this._producer
    }

    // create a consumer instance for class itself and also return
    public createConsumer = (config: ConsumerConfig): Consumer => {
        if (!this._kafka) throw new Error('Configure Kafka first with <config> method')
        this._consumer = this._kafka!.consumer(config)
        return this._consumer
    }

    // disconnect the common producer
    public shutdownProducer = async (): Promise<void> => {
        if (!this._producer) throw new Error('Kafka producer is not connected to any brokers')
        console.log("Shutting down the Kafka producer...")
        await this._producer.disconnect()
    }

    // disconnect the common consumer
    public shutdownConsumer = async (): Promise<void> => {
        if (!this._consumer) throw new Error('Kafka consumer is not connected to any brokers')
        console.log("Shutting down the Kafka producer...")
        await this._consumer.disconnect()
    }
}

export const kafkaClient = new KafkaClient()