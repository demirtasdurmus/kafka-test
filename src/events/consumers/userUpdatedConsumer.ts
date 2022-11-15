import { EachMessagePayload } from 'kafkajs'
import { BaseConsumer } from '../../lib/baseConsumer'
import { UserUpdatedEvent } from "../../interfaces/userUpdatedEvent"
import { Topics } from "../../types/topics"



export class UserUpdatedConsumer extends BaseConsumer<UserUpdatedEvent> {
    readonly topic: Topics.UserUpdated = Topics.UserUpdated
    readonly fromBeginning = true

    onMessage = async (message: UserUpdatedEvent['message'], payload: EachMessagePayload) => {
        console.log("Event received User.updated:", this.topic, message)
    }
}