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

const updateBoardInvitation = async (userId, status, invitationId) => {
  try {
    const invitation = await invitationModel.findOneById(invitationId)

    // Nếu không tìm thấy invitation thì trả về lỗi
    if (!invitation) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Invitation not found!')
    }

    // Nếu người dùng không phải là người được mời thì trả về lỗi
    if (invitation.inviteeId.toString() !== userId) {
      throw new ApiError(StatusCodes.FORBIDDEN, 'You are not allowed to update this invitation!')
    }

    // Nếu tìm không thấy board thì trả về lỗi
    const board = await boardModel.findOneById(invitation.boardInvitation.boardId)
    if (!board) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Board not found!')
    }

    // Kiểm tra xem nếu status là accepted mà invitee đã là owner hoặc member của board thì trả về thông báo lỗi luôn
    // Note: 2 mảng memberIds và ownerIds của board đang là kiểu dữ liệu objectId nên cho nó về string hết để check
    const boardOwnerAndMemberIds = [...board.ownerIds, ...board.memberIds].toString()
    if (status === BOARD_INVITATION_STATUS.ACCEPTED && boardOwnerAndMemberIds.includes(userId)) {
      throw new ApiError(StatusCodes.NOT_ACCEPTABLE, 'You are already a member or owner of this board!')
    }

    const updateData = {
      boardInvitation: {
        ...invitation.boardInvitation,
        status: status
      }
    }

    // Buớc 1: Cập nhật trạng thái của invitation
    // Bước 2: Nếu trường hợp accept một lời mời thành công thì thêm thông tin user vào trong memberIds của board
    const updatedInvitation = await invitationModel.update(invitationId, updateData)

    if (updatedInvitation.boardInvitation?.status === BOARD_INVITATION_STATUS.ACCEPTED) {
      await boardModel.pushMemberIds(board._id.toString(), userId)
    }

    return updatedInvitation
  } catch (error) {
    throw error
  }
}

export const invitationService = {
  createNewBoardInvitation,
  getInvitations,
  updateBoardInvitation
}