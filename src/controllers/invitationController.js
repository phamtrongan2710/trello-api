import { StatusCodes } from 'http-status-codes'
import { invitationService } from '~/services/invitationService.js'

const createNewBoardInvitation = async (req, res, next) => {
  try {
    const inviterId = req.jwtDecoded._id
    const resInvitation = await invitationService.createNewBoardInvitation(req.body, inviterId)
    res.status(StatusCodes.CREATED).json(resInvitation)

  } catch (error) { next(error) }
}

const getInvitations = async (req, res, next) => {
  try {
    const userId = req.jwtDecoded._id
    const invitations = await invitationService.getInvitations(userId)
    res.status(StatusCodes.OK).json(invitations)

  } catch (error) { next(error) }
}

const updateBoardInvitation = async (req, res, next) => {
  try {
    const { status } = req.body
    const { invitationId } = req.params
    const userId = req.jwtDecoded._id

    const resInvitation = await invitationService.updateBoardInvitation(userId, status, invitationId)
    res.status(StatusCodes.OK).json(resInvitation)

  } catch (error) { next(error) }
}

export const invitationController = {
  createNewBoardInvitation,
  getInvitations,
  updateBoardInvitation
}