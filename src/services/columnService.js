import { boardModel } from '~/models/boardModel'
import { columnModel } from '~/models/columnModel'
import { cardModel } from '~/models/cardModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

const createNew = async (reqBody) => {
  try {
    const newColumnData = {
      ...reqBody
    }
    const result = await columnModel.createNew(newColumnData)
    const createdColumn = await columnModel.findOneById(result.insertedId)

    if (createdColumn) {
      // Xử lý cấu trúc data ở đây trước khi trả dữ liệu về
      createdColumn.cards = []

      // Cập nhật mảng columnOrderIds trong collection boards
      await boardModel.pushColumnOrderIds(createdColumn)
    }

    return createdColumn
  } catch (error) { throw error }
}

const update = async (columnId, reqBody) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }
    const updatedColumn = await columnModel.update(columnId, updateData)
    return updatedColumn
  } catch (error) { throw error }
}

const deleteItem = async (columnId) => {
  try {
    const targetColumn = await columnModel.findOneById(columnId)

    if (!targetColumn) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Column not found!')
    }
    // Xóa column
    await columnModel.deleteOneById(columnId)

    // Xóa toàn bộ card thuộc column trên
    await cardModel.deleteManyByColumnId(columnId)

    // Xóa columnId trong mảng columnOrderIds của Board chứ nó
    await boardModel.pullColumnOrderIds(targetColumn)

    return { deleteResult: 'Column and its Cards deleted successfully' }
  } catch (error) { throw error }
}

export const columnService = {
  createNew,
  update,
  deleteItem
}