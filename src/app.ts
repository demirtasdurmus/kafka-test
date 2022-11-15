import express from 'express'

const app = express()
import { kafkaClient } from './clients/kafkaClient'
import { UserCreatedProducer } from './events/producers/userCreatedProducer'
import { UserUpdatedProducer } from './events/producers/userUpdatedProducer'


app.post("/create", (req, res, next) => {
    const user = {
        id: "test-user",
        firstName: "Durmuş",
        lastName: "Demirtaş",
        email: "demirtasdurmus@gmail.com"
    }
    new UserCreatedProducer(kafkaClient.createProducer()).produce(user)
    res.send({ message: 'created' })
})

app.post("/update", (req, res, next) => {
    const user = {
        id: "test-user",
        isVerified: true
    }
    new UserUpdatedProducer(kafkaClient.createProducer()).produce(user)
    res.send({ message: 'updated' })
})


export { app }