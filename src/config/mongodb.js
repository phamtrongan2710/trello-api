/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */
import { MongoClient, ServerApiVersion } from 'mongodb'
import { env } from '~/config/environment'

// Khởi tạo 1 đối tượng trelloDatabaseInstance ban đầu là null vì chưa connect database
let trelloDatabaseInstance = null

// Khởi tạo 1 đối tượng client instance để connect tới MongoDB
const mongoClientInstance = new MongoClient(env.MONGODB_URI, {
  /**
   * Lưu ý: serverApi có từ phiên bản MongoDB 5.0.0 trở lên
   * Có thể không cần dùng nó, còn nếu dùng nó là chúng ta sẽ chỉ định một cái stable api version của mongoDB
   * https://www.mongodb.com/docs/drivers/node/current/fundamentals/stable-api/
  */
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true
  }
})

// Kết nối tới database
export const CONNECT_DB = async () => {
  // Gọi kết nối tới MongoDB Atlas với URI đã khai báo trong thân của mongoClient
  await mongoClientInstance.connect()

  // Kết nối thành công thì lấy ra database theo tên và gán vào trelloDatabaseInstance
  trelloDatabaseInstance = mongoClientInstance.db(env.DATABASE_NAME)
}

/**
 * function GET_DB (không async) này có nhiệm vụ export ra cái Trello Database Instance sau khi connect thành công tới
 * MongoDB để chúng ta sử dụng ở nhiều nơi khác nhau trong code.
 * Lưu ý: phải đảm bảo chỉ luôn gọi GET_DB này sau khi đã kết nối thành công tới MongoDB
 */
export const GET_DB = () => {
  if (!trelloDatabaseInstance) throw new Error('Must connect to database first!')
  return trelloDatabaseInstance
}

// Đóng kết nối tới database khi cần
export const CLOSE_DB = async () => {
  await mongoClientInstance.close()
}