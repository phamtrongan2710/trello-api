import { userModel } from '~/models/userModel'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'
import bcryptjs from 'bcryptjs'
import { v4 as uuidv4 } from 'uuid'
import { pickUser } from '~/utils/formatters'
import { WEBSITE_DOMAIN } from '~/utils/constants'
import { BrevoProvider } from '~/providers/BrevoProvider'
import { env } from '~/config/environment'
import { JwtProvider } from '~/providers/JwtProvider'

const createNew = async (reqBody) => {
  try {
    // Kiểm tra email tồn tại trong hệ thống hay chưa
    const existedUser = await userModel.findOneByEmail(reqBody.email)
    if (existedUser) {
      throw new ApiError(StatusCodes.CONFLICT, 'Email is already existed!')
    }

    // Tạo data để lưu vào database
    const nameFromEmail = reqBody.email.split('@')[0]
    const newUser = {
      email: reqBody.email,
      password: bcryptjs.hashSync(reqBody.password, 8), // Tham số thứ 2 là độ phức tạp, giá trị càng cao thì băm càng lâu
      username: nameFromEmail,
      displayName: nameFromEmail, // mặc định để giống username khi đăng ký mới
      verifyToken: uuidv4()
    }

    // Thực hiện lưu thông tin user vào database
    const result = await userModel.createNew(newUser)
    const createdUser = await userModel.findOneById(result.insertedId)

    // Gửi email cho người dùng xác thực tài khoản
    const verificationLink = `${WEBSITE_DOMAIN}/account/verification?email=${createdUser.email}&token=${createdUser.verifyToken}`
    const customSubject = 'Trello: Please verify your email before using our services!'
    const htmlContent = `
      <h3>Here is your verification link: </h3>
      <h3>${verificationLink}</h3>
      <h3>Sincerely,<br/> - Trello - </h3>
    `

    // Gọi tới provider gửi mail
    await BrevoProvider.sendEmail(createdUser.email, customSubject, htmlContent)

    // Trả về dữ liệu cho controller
    return pickUser(createdUser)
  } catch (error) { throw error }
}

const verifyAccount = async (reqBody) => {
  try {
    const existedUser = await userModel.findOneByEmail(reqBody.email)

    // các bước kiểm tra cần thiết
    if (!existedUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account is not found!')
    if (existedUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Account is already actived!')
    if (reqBody.token !== existedUser.verifyToken) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Token is invalid!')

    // Nếu như mọi thứ ok thì chúng ta update lại thông tin user để verify account
    const updateData = {
      isActive: true,
      verifyToken: null
    }

    const updatedUser = await userModel.update(existedUser._id, updateData)

    return pickUser(updatedUser)
  } catch (error) { throw error }
}

const login = async (reqBody) => {
  try {
    const existedUser = await userModel.findOneByEmail(reqBody.email)

    // các bước kiểm tra cần thiết
    if (!existedUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account is not found!')
    if (!existedUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Account is not actived!')
    if (!bcryptjs.compareSync(reqBody.password, existedUser.password)) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Email or password is incorrect!')

    /** Nếu mọi thứ ok thì bắt đầu tạo tokens đăng nhập để trả về cho phía FE */
    // Tạo thông tin sẽ đính kèm trong JWT Token bao gồm _id và email của user
    const userInfo = { _id: existedUser._id, email: existedUser.email }

    // Tạo ra 2 loại token: accessToken và refreshToken để trả về cho FE
    const accessToken = await JwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      // 5
      env.ACCESS_TOKEN_LIFE
    )

    const refreshToken = await JwtProvider.generateToken(
      userInfo,
      env.REFRESH_TOKEN_SECRET_SIGNATURE,
      // 10
      env.REFRESH_TOKEN_LIFE
    )

    // Trả về thông tin user và 2 token vừa tạo
    return { accessToken, refreshToken, ...pickUser(existedUser) }

  } catch (error) { throw error }
}

const refreshToken = async (clientRefreshToken) => {
  try {
    // Verify/ Giải mã xem cái refreshToken có hợp lệ không
    const refreshTokenDecoded = await JwtProvider.verifyToken(
      clientRefreshToken,
      env.REFRESH_TOKEN_SECRET_SIGNATURE
    )

    // Đoạn này vì chúng ta chỉ lưu những thông tin unique và cố định của user trong token rồi, vì vậy có thể lấy luôn từ decoded ra, tiết kiệm query vào db lấy data mới
    const userInfo = { _id: refreshTokenDecoded._id, email: refreshTokenDecoded.email }

    // Tạo accessToken mới
    const accessToken = await JwtProvider.generateToken(
      userInfo,
      env.ACCESS_TOKEN_SECRET_SIGNATURE,
      // 5
      env.ACCESS_TOKEN_LIFE
    )

    return { accessToken }
  } catch (error) { throw error }
}

const update = async (userId, reqBody) => {
  try {
    // Query user và kiểm tra cho chắc chắn
    const existedUser = await userModel.findOneById(userId)
    if (!existedUser) throw new ApiError(StatusCodes.NOT_FOUND, 'Account is not found!')
    if (!existedUser.isActive) throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Account is not active!')

    // Khởi tạo kết quả update user ban đầu là empty
    let updatedUser = {}

    // Trường hợp change password
    if (reqBody.current_password && reqBody.new_password) {
      // Kiểm tra xem current_password đúng hay không
      if (!bcryptjs.compareSync(reqBody.current_password, existedUser.password)) {
        throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'Current password is incorrect!')
      }

      // Nếu current_password đúng thì chúng ta hash mật khẩu mới và update vào database
      updatedUser = await userModel.update(userId, {
        password: bcryptjs.hashSync(reqBody.new_password, 8)
      })

    } else {
      // Trường hợp update các thông tin chung ví dụ như displayName
      updatedUser = await userModel.update(userId, reqBody)
    }

    return pickUser(updatedUser)

  } catch (error) { throw error }
}

export const userService = {
  createNew,
  verifyAccount,
  login,
  refreshToken,
  update
}