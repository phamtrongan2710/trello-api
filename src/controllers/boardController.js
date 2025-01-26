/**
 * Updated by trungquandev.com's author on August 17 2023
 * YouTube: https://youtube.com/@trungquandev
 * "A bit of fragrance clings to the hand that gives flowers!"
 */

import { StatusCodes } from 'http-status-codes'

const createNew = async (req, res, next) => {
  try {
    // console.log('body:', req.body)

    // Điều hướng dữ liệu sang tầng Service
    // Có kết quả thì trả về
    res.status(StatusCodes.CREATED).json({ message: 'POST: Api create new board.' })

  } catch (error) { next(error) }
}

export const boardController = {
  createNew
}