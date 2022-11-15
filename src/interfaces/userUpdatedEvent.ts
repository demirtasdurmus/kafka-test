import { Topics } from '../types/topics'

export interface UserUpdatedEvent {
    topic: Topics.UserUpdated;
    message: {
        id: string;
        isVerified: boolean
    }
}