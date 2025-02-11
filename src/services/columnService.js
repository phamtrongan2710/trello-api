import { boardModel } from '~/models/boardModel'
import { columnModel } from '~/models/columnModel'

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

export const columnService = {
  createNew,
  update
}