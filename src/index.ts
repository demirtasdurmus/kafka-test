import { app } from './app'
import { logLevel } from 'kafkajs'
import { kafkaClient } from './clients/kafkaClient'
import { UserCreatedConsumer } from './events/consumers/userCreatedConsumer'
import { UserUpdatedConsumer } from './events/consumers/userUpdatedConsumer'
import { UserUpdatedConsumer2 } from './events/consumers/userUpdatedConsumer2'

// configure Kafka
kafkaClient.config({
    clientId: 'test-id',
    brokers: ['kafka-broker:9092'],
    logLevel: logLevel.NOTHING
})
// create a common producer instance in global
kafkaClient.createProducer()

// set up consumers
/*
We can test the group id effect by setting same/different group id to same topic listeners
-if passed the same group ids to the same topics, only first consumer will be able to receive the message
-if passed different group ids to the same topics, all consumers will be able to receive the message
-to prevent data loss or data duplication, this feature should be used with utmost care
*/
new UserCreatedConsumer(kafkaClient.createConsumer({ groupId: 'test-group-one' })).consume().catch(err => console.error(err))
new UserUpdatedConsumer(kafkaClient.createConsumer({ groupId: 'test-group-two' })).consume().catch(err => console.error(err))
new UserUpdatedConsumer2(kafkaClient.createConsumer({ groupId: 'test-group-three' })).consume().catch(err => console.error(err))

app.listen(8000, () => {
    console.log("Server is awake on port 8000")
})