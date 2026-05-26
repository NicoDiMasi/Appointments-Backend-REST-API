import dotenv from "dotenv"
dotenv.config()

import app from "./app.js"
import { MongoDBClient } from "./config/database.js"

const PORT = process.env.PORT || 3000

const start = async () => {
    try {
        await MongoDBClient.connect()
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
    } catch (error) {
        console.error(error)
    }
}

start()
