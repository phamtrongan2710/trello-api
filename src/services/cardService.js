import { cardModel } from '~/models/cardModel'
import { columnModel } from '~/models/columnModel'
import { CloudinaryProvider } from '~/providers/CloudinaryProvider'

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

const update = async (cardId, reqBody, cardCoverFile, userInfo) => {
  try {
    const updateData = {
      ...reqBody,
      updatedAt: Date.now()
    }

    let updatedCard = {}

    if (cardCoverFile) {
      // Trường hợp upload file lên cloud storage, cụ thể là cloudinary
      const uploadResult = await CloudinaryProvider.streamUpload(cardCoverFile.buffer, 'card-covers')
      updatedCard = await cardModel.update(cardId, {
        cover: uploadResult.secure_url
      })

    } else if (reqBody?.commentToAdd) {
      // Tạo dữ liệu comment để thêm vào db, cần bổ sung thêm các field cần thiết
      const commentData = {
        ...updateData.commentToAdd,
        commentedAt: Date.now(),
        userId: userInfo._id,
        userEmail: userInfo.email
      }

      updatedCard = await cardModel.unshiftNewComment(cardId, commentData)
    } else {
      // Trường hợp update các thông tin chung ví dụ như displayName
      updatedCard = await cardModel.update(cardId, updateData)
    }

    return updatedCard
  } catch (error) { throw error }
}

export const cardService = {
  createNew,
  update
}