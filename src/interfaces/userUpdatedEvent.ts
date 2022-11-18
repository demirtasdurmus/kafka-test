import { IHeaders } from 'kafkajs'
import { Topics } from '../types/topics'

export interface UserUpdatedEvent {
    topic: Topics.UserUpdated;
    message: {
        key?: Buffer | string | null
        partition?: number
        headers?: IHeaders
        timestamp?: string
        value: {
            id: string;
            isVerified: boolean
        }
    }
}