/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

import { slugify } from '~/utils/formatters'
import { boardModel } from '~/models/boardModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import { cloneDeep } from 'lodash'
import { columnModel } from '~/models/columnModel'
import { cardModel } from '~/models/cardModel'

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

const getDetails = async (boardId) => {
  try {
    const board = await boardModel.getDetails(boardId)
    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!')
    }

    // deep clone để tạo ra cái mới để xử lý, không ảnh hưởng board ban đầu (tùy mục đích dự án mà cần bước này hay không)
    const resBoard = cloneDeep(board)
    // Đưa cards vào đúng columns
    resBoard.columns.forEach(column => {
      // ObjectId trong mongoDB có support method equals để so sánh
      column.cards = resBoard.cards.filter(card => card.columnId.equals(column._id))

      // column.cards = resBoard.cards.filter(card => card.columnId.toString() === column._id.toString())
    })
    // Xóa trường cards ở resBoard
    delete resBoard.cards

    return resBoard
  } catch (error) { throw error }
}

const update = async (boardId, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }
    const updatedBoard = await boardModel.update(boardId, updateData)
    return updatedBoard
  } catch (error) { throw error }
}

const moveCardToDifferentColumn = async (reqBody) => {
  try {
    // 1. Cập nhật cardOrderIds của Column ban đầu chưa nó (xóa _id khỏi mảng)
    await columnModel.update(reqBody.prevColumnId, {
      cardOrderIds: reqBody.prevCardOrderIds,
      updatedAt: Date.now()
    })

    // 2. Cập nhật cardOrderIds của Column tiếp theo (thêm _id vào mảng)
    await columnModel.update(reqBody.nextColumnId, {
      cardOrderIds: reqBody.nextCardOrderIds,
      updatedAt: Date.now()
    })

    // 3. Cập nhật lại columnId của card đã kéo
    await cardModel.update(reqBody.currentCardId, {
      columnId: reqBody.nextColumnId,
      updatedAt: Date.now()
    })

    return { updateResult: ' Successfully!' }
  } catch (error) { throw error }
}

export const boardService = {
  createNew,
  getDetails,
  update,
  moveCardToDifferentColumn
}