import { EachMessagePayload } from 'kafkajs'
import { BaseConsumer } from '../../lib/baseConsumer'
import { UserCreatedEvent } from "../../interfaces/userCreatedEvent"
import { Topics } from "../../types/topics"



export class UserCreatedConsumer extends BaseConsumer<UserCreatedEvent> {
    readonly topic: Topics.UserCreated = Topics.UserCreated
    readonly fromBeginning = true

    onMessage = async (message: UserCreatedEvent['message'], payload: EachMessagePayload) => {
        console.log("Event received User.created:", this.topic, message)
    }
}