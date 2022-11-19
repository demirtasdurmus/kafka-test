import { app } from './app'
import { logLevel } from 'kafkajs'
import { kafkaClient } from './clients/kafkaClient'
import { UserCreatedConsumer } from './events/consumers/userCreatedConsumer'
import { UserUpdatedConsumer } from './events/consumers/userUpdatedConsumer'
import { UserUpdatedConsumer2 } from './events/consumers/userUpdatedConsumer2'
import { Server } from 'http'


const setupKafka = async (server: Server) => {
    try {
        // configure Kafka
        kafkaClient.config({
            clientId: 'test-id',
            brokers: ['kafka-broker:9092'],
            logLevel: logLevel.NOTHING
        })
        // create a common producer instance in global
        kafkaClient.createProducer()
        kafkaClient.producer.on('producer.connect', () => {
            console.info('Connected to Kafka producer successfully')
        })
        await kafkaClient.producer.connect()
        process.on('SIGINT', () => {
            console.log('👋 SIGINT RECEIVED. Shutting down gracefully')
            kafkaClient.shutdownProducer()
            kafkaClient.shutdownConsumer()
            server.close(() => {
                console.log('💥 Process terminated!')
            })
        })
        process.on('SIGTERM', () => {
            console.log('👋 SIGTERM RECEIVED. Shutting down gracefully')
            kafkaClient.shutdownProducer()
            kafkaClient.shutdownConsumer()
            server.close(() => {
                console.log('💥 Process terminated!')
            })
        })

        // set up consumers
        /*
        We can test the group id effect by setting same/different group id to same topic listeners
        -if passed the same group ids to the same topics, only first consumer will be able to receive the message
        -if passed different group ids to the same topics, all consumers will be able to receive the message
        -to prevent data loss or data duplication, this feature should be used with utmost care
        */
        new UserCreatedConsumer(kafkaClient.createConsumer({ groupId: 'test-group-one' })).consume().catch(err => console.error(err))
        new UserUpdatedConsumer(kafkaClient.createConsumer({ groupId: 'test-group-two' })).consume().catch(err => console.error(err))
        // new UserUpdatedConsumer2(kafkaClient.createConsumer({ groupId: 'test-group-three' })).consume().catch(err => console.error(err))
    } catch (error: any) {
        console.error(error)
    }
}

const server = app.listen(8001, () => {
    console.log("Server is awake on port 8000")
})

setupKafka(server)