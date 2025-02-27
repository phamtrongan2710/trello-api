import { StatusCodes } from 'http-status-codes'
import ms from 'ms'
import { userService } from '~/services/userService.js'

const createNew = async (req, res, next) => {
  try {
    const createdUser = await userService.createNew(req.body)
    res.status(StatusCodes.CREATED).json(createdUser)
  } catch (error) { next(error) }
}

const verifyAccount = async (req, res, next) => {
  try {
    const result = await userService.verifyAccount(req.body)
    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

const login = async (req, res, next) => {
  try {
    const result = await userService.login(req.body)

    /**
     * Xử lý trả về http only cookie cho phía trình duyệt
     * httpOnly: true ~ Chỉ server thao tác được cookie này
     * Về cái maxAge và thư viện ms: https://expressjs.com/en/api.html
     * Đối với cái maxAge: để tối đa ngày tùy dự án (NOTE: thời gian sống cookie khác với token)
     */
    res.cookie('accessToken', result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14 days')
    })

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14 days')
    })

    res.status(StatusCodes.OK).json(result)
  } catch (error) { next(error) }
}

export const userController = {
  createNew,
  verifyAccount,
  login
}