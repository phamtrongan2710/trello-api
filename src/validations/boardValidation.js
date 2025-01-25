/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

import Joi from 'joi'
import { StatusCodes } from 'http-status-codes'

const createNew = async (req, res, next) => {
  /**
   * Mặc định: không cần custom massage ở BE vì FE tự validate và custom cho phía FE cho đẹp
   * BE chỉ cần validate đảm bảo dữ liệu chuẩn xác, trả về mesage mặc định từ thư viện là được
   * Quan trọng: Việc validate dữ liệu bắt buộc phải có ở phía BE vì đây là điểm cuối để lưu trữ dữ liệu vào database
   * Và thông thường trong thực tế, điều tốt nhất cho hệ thống là luôn validate dữ liệu ở cả BE và FE
   */
  const correctCondition = Joi.object({
    title: Joi.string().required().min(3).max(50).trim().strict().messages({
      // 'any.required': 'Title is required',
      // 'string.empty': 'Title is not allowed to be empty',
      // 'string.min': 'Title min 3 chars',
      // 'string.max': 'Title max 50 chars',
      // 'string.trim': 'Title must not have leading or trailing whitespace'
    }),
    description: Joi.string().required().min(3).max(256).trim().strict()
  })

  try {
    // console.log('body:', req.body)
    // set abortEarly: false để trả về tất cả lỗi
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    // next()
    res.status(StatusCodes.CREATED).json({ message: 'POST: Api create new board.' })
  } catch (error) {
    res.status(StatusCodes.UNPROCESSABLE_ENTITY).json({
      errors: new Error(error).message
    })
  }
}

export const boardValidation = {
  createNew
}