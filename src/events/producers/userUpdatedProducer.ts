import { Topics } from "../../types/topics"
import { BaseProducer } from "../../lib/baseProducer"
import { UserUpdatedEvent } from "../../interfaces/userUpdatedEvent"


export class UserUpdatedProducer extends BaseProducer<UserUpdatedEvent> {
    topic: Topics.UserUpdated = Topics.UserUpdated
}