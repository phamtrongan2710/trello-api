import ApiError from '~/utils/ApiError'
import { userModel } from '~/models/userModel'
import { invitationModel } from '~/models/invitationModel'
import { boardModel } from '~/models/boardModel'
import { pickUser } from '~/utils/formatters'
import { INVITATION_TYPES, BOARD_INVITATION_STATUS } from '~/utils/constants'
import { StatusCodes } from 'http-status-codes'

const createNewBoardInvitation = async (reqBody, inviterId) => {
  try {
    // Nguời đi mời chính là người đang gửi request nên chúng ta tìm theo id lấy từ token
    const inviter = await userModel.findOneById(inviterId)
    // Người được mời lấy theo email lấy từ phía FE
    const invitee = await userModel.findOneByEmail(reqBody.inviteeEmail)
    // Tìm board để lấy data ra xử lý
    const board = await boardModel.findOneById(reqBody.boardId)

    // Không được mời chính mình
    // if (inviter._id.toString() === invitee._id.toString()) {
    //   throw new ApiError(StatusCodes.BAD_REQUEST, 'You cannot invite yourself!')
    // }

    // Nếu không tồn tại 1 trong 3 thì reject
    if (!inviter || !invitee || !board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Inviter or invitee or board not found!')
    }

    // Tạo data cần thiết để lưu vào trong db
    const newInvitationData = {
      inviterId: inviter._id.toString(),
      inviteeId: invitee._id.toString(), // chuyển từ ObjectId sang string vì sang bên Model có check lại data ở hàm create
      type: INVITATION_TYPES.BOARD_INVITATION,
      boardInvitation: {
        boardId: board._id.toString(),
        status: BOARD_INVITATION_STATUS.PENDING
      }
    }

    // Gọi sang Model để lưu dữ liệu vào db
    const createdInvitation = await invitationModel.createNewBoardInvitation(newInvitationData)
    const getInvitation = await invitationModel.findOneById(createdInvitation.insertedId.toString())

    // Ngoài thông tin của cái board invitation mới tạo thì trả về đủ luôn board, inviter, invitee cho FE thoải mái xử lý
    const resInvitation = {
      ...getInvitation,
      board,
      inviter: pickUser(inviter),
      invitee: pickUser(invitee)
    }

    return resInvitation

  } catch (error) {
    throw error
  }
}

const getInvitations = async (userId) => {
  try {
    const invitations = await invitationModel.findByUserId(userId)

    // dữ liệu invitee, inviter, board đang trả về là mảng 1 phần tử nếu lấy ra được nên chúng ta sẽ chuyển về object trước khi chuyển về cho FE
    const resInvitations = invitations.map(i => {
      return {
        ...i,
        board: i.board[0] || null,
        inviter: i.inviter[0] || null,
        invitee: i.invitee[0] || null
      }
    })

    return resInvitations
  } catch (error) {
    throw error
  }
}

export const invitationService = {
  createNewBoardInvitation,
  getInvitations
}