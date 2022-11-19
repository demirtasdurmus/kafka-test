import { Kafka, Consumer, Producer, ProducerConfig, KafkaConfig, ConsumerConfig } from "kafkajs"


class KafkaClient {
    private _kafka?: Kafka
    private _producer?: Producer
    private _consumer?: Consumer
    private producerConnected: boolean = false
    private consumerConnected: boolean = false

    /**
     * a single producer instance
     */
    public get producer(): Producer {
        if (!this._producer) throw new Error('Please create a producer instance with <createProducer> method first')
        return this._producer
    }

    /**
     * a single consumer instance
     */
    public get consumer(): Consumer {
        if (!this._consumer) throw new Error('Please create a consumer instance with <createConsumer> method first')
        return this._consumer
    }

    /**
     * configures Kafka client
     * 
     * @param config - Kafka config options
     * 
     * @returns void 
     */
    public config(config: KafkaConfig): void {
        this._kafka = new Kafka(config)
    }

    /**
     * creates a producer instance
     * 
     * @param config - Kafka Producer config options or undefined
     * 
     * @returns a Producer instance
     */
    public createProducer(config?: ProducerConfig | undefined): Producer {
        if (!this._kafka) throw new Error('Configure Kafka first with <config> method')
        this._producer = this._kafka!.producer(config)
        return this._producer
    }

    /**
     * creates a consumer instance for class
     * 
     * @param config - Kafka Consumer config options
     * 
     * @returns a Consumer instance
     */
    public createConsumer(config: ConsumerConfig): Consumer {
        if (!this._kafka) throw new Error('Configure Kafka first with <config> method')
        this._consumer = this._kafka!.consumer(config)
        return this._consumer
    }

    /**
     * connects to a Kafka producer
     * 
     * @returns void
     */
    public async connectProducer(): Promise<void> {
        if (!this._producer) throw new Error('Please create a producer instance with <createProducer> method first')
        await this._producer.connect()
        this.producerConnected = true
    }

    /**
     * connectConsumer
     */
    public async connectConsumer(): Promise<void> {
        if (!this._consumer) throw new Error('Please create a consumer instance with <createProducer> method first')
        await this._consumer.connect()
        this.consumerConnected = true
    }

    /**
     * disconnects the connected producer if there is one
     * 
     * @returns void
     */
    public async shutdownProducer(): Promise<void> {
        if (!this._producer || !this.producerConnected) return
        console.log("Shutting down the Kafka producer...")
        await this._producer.disconnect()
        this.producerConnected = false
    }

    /**
     * disconnects the connected consumer if there is one
     * 
     * @returns void
     */
    public async shutdownConsumer(): Promise<void> {
        if (!this._consumer || !this.consumerConnected) return
        console.log("Shutting down the Kafka producer...")
        await this._consumer.disconnect()
        this.consumerConnected = false
    }
}

export const kafkaClient = new KafkaClient()