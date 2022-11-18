import { IHeaders } from 'kafkajs'
import { Topics } from '../types/topics'

export interface UserCreatedEvent {
    topic: Topics.UserCreated;
    message: {
        key?: Buffer | string | null
        partition?: number
        headers?: IHeaders
        timestamp?: string
        value: {
            id: string;
            firstName: string;
            lastName: string;
            email: string;
        }
    }
}