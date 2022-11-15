import { Kafka, Consumer, Producer, ProducerConfig, KafkaConfig, ConsumerConfig } from "kafkajs"


class KafkaClient {
    private _kafka?: Kafka

    public config = (config: KafkaConfig) => {
        this._kafka = new Kafka(config)
    }

    public createProducer = (config?: ProducerConfig | undefined): Producer => {
        if (!this._kafka) throw new Error('Configure Kafka first with <config> method')
        return this._kafka!.producer(config)
    }

    public createConsumer = (config: ConsumerConfig): Consumer => {
        if (!this._kafka) throw new Error('Configure Kafka first with <config> method')
        return this._kafka!.consumer(config)
    }
}

export const kafkaClient = new KafkaClient()