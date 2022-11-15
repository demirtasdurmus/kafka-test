import { Topics } from '../types/topics'

export interface UserCreatedEvent {
    topic: Topics.UserCreated;
    message: {
        id: string;
        firstName: string;
        lastName: string;
        email: string;
    }
}