/* eslint-disable no-useless-catch */
/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

import { slugify } from '~/utils/formatters'
import { boardModel } from '~/models/boardModel'

const createNew = async (reqBody) => {
  try {
    // Xử lý logic dữ liệu tùy đặc thù dự án
    const newBoardData = {
      ...reqBody,
      slug: slugify(reqBody.title)
    }

    // Gọi tới tầng Model để xử lý lưu bản ghi newBoard vào trong database
    /** result trả về
    * {
        acknowledged: true nếu ghi thành công và false nếu không ghi được
        insertedId: id của bản ghi vừa tạo mới
      }
    */
    const result = await boardModel.createNew(newBoardData)

    // Lấy bản ghi board vừa tạo (tùy mục đích dự án mà cần bước này hay không)
    const createdBoard = await boardModel.findOneById(result.insertedId)

    // Làm thêm các xử lý logic khác với các Collection khác tùy đặc thù dự án
    // Bắn email, notification về cho admin khi có 1 cái board mới được tạo

    // trả kết quả về (trong service luôn phải có return)
    return createdBoard
  } catch (error) { throw error }
}

export const boardService = {
  createNew
}