import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'

const createNew = async (reqBody) => {
  try {
    const newCardData = {
      ...reqBody
    }
    const result = await cardModel.createNew(newCardData)
    const createdCard = await cardModel.findOneById(result.insertedId)

    if (createdCard) {
      // Cập nhật mảng cardOrderIds trong collection columns
      await columnModel.pushCardOrderIds(createdCard)
    }

    return createdCard
  } catch (error) { throw error }
}

export const cardService = {
  createNew
}