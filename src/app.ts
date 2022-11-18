import express from 'express'

const app = express()
import { kafkaClient } from './clients/kafkaClient'
import { UserCreatedProducer } from './events/producers/userCreatedProducer'
import { UserUpdatedProducer } from './events/producers/userUpdatedProducer'
import { ACKS } from './types/acks'

app.post("/create", async (req, res, next) => {
    const user = {
        id: "test-user",
        firstName: "Durmuş",
        lastName: "Demirtaş",
        email: "demirtasdurmus@gmail.com"
    }
    const resp = await new UserCreatedProducer(kafkaClient.producer).produce([{ value: user }])
    res.send({ message: resp })
})

app.post("/update", (req, res, next) => {
    const user = {
        id: "test-user",
        isVerified: true
    }
    new UserUpdatedProducer(kafkaClient.producer).produce([{ value: user }])
    res.send({ message: 'updated' })
})


export { app }