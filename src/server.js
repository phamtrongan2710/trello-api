/* eslint-disable no-console */
/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

import express from 'express'
import cors from 'cors'
import exitHook from 'async-exit-hook'
import { CONNECT_DB, CLOSE_DB } from '~/config/mongodb'
import { env } from '~/config/environment'
import { APIs_v1 } from '~/routes/v1'
import { errorHandlingMiddleware } from '~/middlewares/errorHandlingMiddleware'
import { corsOptions } from './config/cors'

const START_SERVER = () => {
  const app = express()

  app.use(cors(corsOptions))

  // Enable req.body json data
  app.use(express.json())

  // Use APIs v1
  app.use('/v1', APIs_v1)

  // Middleware xử lý lỗi tập trung
  app.use(errorHandlingMiddleware)

  if (env.BUILD_MODE === 'production') {
    // production: currently support Render
    app.listen(process.env.PORT, () => {
      console.log(`3. Production: Hi ${env.AUTHOR}. Server is running at Port: ${process.env.PORT}`)
    })
  } else {
    // local dev
    app.listen(env.LOCAL_DEV_APP_PORT, env.LOCAL_DEV_APP_HOST, () => {
      console.log(`3. Local dev: Hi ${env.AUTHOR}. Server is running at http://${env.LOCAL_DEV_APP_HOST}:${env.LOCAL_DEV_APP_PORT}`)
    })
  }

  // Thực hiện các tác vụ cleanup trước khi dừng server
  exitHook(() => {
    console.log('4. Server is shutting down...')
    CLOSE_DB()
    console.log('5. Disconnected from MongoDB Cloud Atlas.')
  })
}

// Chỉ khi kết nối database thành công thì mới start server backend
// Inmmediately-invoked / Anonymous Async Function (IIFE)
(async () => {
  try {
    console.log('1. Connecting to database...')
    await CONNECT_DB()
    console.log('2. Connected to MongoDB Cloud Atlas!')
    START_SERVER()
  } catch (error) {
    console.error(error)
    process.exit(0)
  }
})()

// Chỉ khi kết nối database thành công thì mới start server backend
// console.log('1. Connecting to database...')
// CONNECT_DB()
//   .then(() => console.log('2. Connected to MongoDB Cloud Atlas!'))
//   .then(() => START_SERVER())
//   .catch(error => {
//     console.error(error)
//     process.exit(0)
//   })
