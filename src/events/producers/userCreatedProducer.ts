import { Topics } from "../../types/topics"
import { BaseProducer } from "../../lib/baseProducer"
import { UserCreatedEvent } from "../../interfaces/userCreatedEvent"
import { CompressionTypes } from "kafkajs"


export class UserCreatedProducer extends BaseProducer<UserCreatedEvent> {
    topic: Topics.UserCreated = Topics.UserCreated
}