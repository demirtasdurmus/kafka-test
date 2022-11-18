import { CompressionTypes } from 'kafkajs'
import { ACKS } from '../types/acks'

export interface SenderConfig {
    acks?: ACKS,
    compressionType?: CompressionTypes
    timeout?: number
}