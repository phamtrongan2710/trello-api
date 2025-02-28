import { StatusCodes } from 'http-status-codes'
import { JwtProvider } from '~/providers/JwtProvider'
import { env } from '~/config/environment'
import ApiError from '~/utils/ApiError'

// Middleware xác thực cái JWT accessToken nhận được từ phía FE có hợp lệ không
const isAuthorized = async (req, res, next) => {
  // Lấy accessToken nằm trong request Cookies từ client gửi lên (withCredentials = true trong file authorizedAxios)
  const clientAccessToken = req.cookies?.accessToken

  // nếu clientAccessToken không tồn tại thì trả về lỗi luôn
  if (!clientAccessToken) {
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized! (token is not found)'))
    return
  }

  try {
    // Bước 1: Thực hiện giải mã token xem nó có hợp lệ không
    const accessTokenDecoded = await JwtProvider.verifyToken(
      clientAccessToken,
      env.ACCESS_TOKEN_SECRET_SIGNATURE
    )
    // console.log('🚀 ~ isAuthorized ~ accessTokenDecoded:', accessTokenDecoded)

    // Bước 2: Quan trọng: Nếu như cái token hợp lệ thì sẽ cần phải lưu thông tin giải mã được vào cái req.jwtDecoded để sử dụng cho các tầng xử lý phía sau
    req.jwtDecoded = accessTokenDecoded

    // Bước 3: Cho phép cái request đi tiếp
    next()

  } catch (error) {
    // console.log('🚀 ~ isAuthorized ~ error:', error)
    // Nếu accessToken bị hết hạn (expired) thì mình cần trả về một cái mã lỗi GONE - 410 cho phía FE biết để gọi API refreshToken
    if (error?.message?.includes('jwt expired')) {
      next(new ApiError(StatusCodes.GONE, 'Need to refresh token.'))
      return
    }

    // Nếu accessToken không hợp lệ do bất kỳ điều gì khác ngoài hết hạn thì chúng ta trả về mã 401 cho phía FE gọi api signout luôn
    next(new ApiError(StatusCodes.UNAUTHORIZED, 'Unauthorized!'))
  }
}

export const authMiddleware = {
  isAuthorized
}