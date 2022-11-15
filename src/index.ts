import { app } from './app'
import { logLevel } from 'kafkajs'
import { kafkaClient } from './clients/kafkaClient'
import { UserCreatedConsumer } from './events/consumers/userCreatedConsumer'
import { UserUpdatedConsumer } from './events/consumers/userUpdatedConsumer'

// configure Kafka
kafkaClient.config({
    clientId: 'test-id',
    brokers: ['kafka-broker:9092'],
    logLevel: logLevel.NOTHING
})
// create a common producer instance in global
kafkaClient.createProducer()

// set up consumers
new UserCreatedConsumer(kafkaClient.createConsumer({ groupId: 'test-group-one' })).consume().catch(err => console.error(err))
new UserUpdatedConsumer(kafkaClient.createConsumer({ groupId: 'test-group-two' })).consume().catch(err => console.error(err))

app.listen(8000, () => {
    console.log("Server is awake on port 8000")
})