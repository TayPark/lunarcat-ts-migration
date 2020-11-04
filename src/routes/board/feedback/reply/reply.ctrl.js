import { Reply, Feedback } from '../../../../models'
import Joi from 'joi'
import createError from 'http-errors'
import { startSession } from 'mongoose'

/* 
  This is reply router.
  base url: /boards/{boardId}/feedback
  OPTIONS: [ GET / POST / PATCH / DELETE ]
*/

export const postReply = async (req, res, next) => {
  const replyForm = {
    writer: res.locals.uid,
    boardId: req.params.boardId,
    parentId: req.params.feedbackId,
    replyBody: req.body.replyBody,
  }

  const replyValidateSchema = Joi.object({
    replyBody: Joi.string().trim().required(),
  })

  try {
    await replyValidateSchema.validateAsync({
      replyBody: replyForm.replyBody,
    })
  } catch (e) {
    console.log(
      `[INFO] 유저 ${res.locals.uid} 가 적절하지 않은 데이터로 댓글을 작성하려 했습니다. ${e}`
    )
    return next(createError(400, '입력값이 적절하지 않습니다.'))
  }

  const replySchema = new Reply(replyForm)

  const session = await startSession()

  try {
    await session.withTransaction(async () => {
      const replyData = await replySchema.save({ session })
      await Feedback.getReply(req.params.feedbackId, replyData._id).session(session)
      const newerReplyData = await Reply.getByParentId(replyForm.parentId).session(session)
      console.log(`[INFO] 유저 ${res.locals.uid} 가 댓글 ${replyData._id} 를 작성했습니다.`)
      return res.status(201).json({
        result: 'ok',
        data: newerReplyData,
      })
    })
  } catch (e) {
    console.error(`[Error] ${e}`)
    return next(createError(500, '알 수 없는 에러가 발생했습니다.'))
  } finally {
    session.endSession()
  }
}

// 댓글 하위의 대댓글 뷰
export const getReplys = async (req, res, next) => {
  const feedbackId = req.params.feedbackId

  try {
    const replyData = await Reply.getByParentId(feedbackId)
    console.log(
      `[INFO] 유저 ${res.locals.uid} 가 피드백 ${feedbackId} 하위의 댓글(들)을 열람합니다.`
    )
    return res.status(200).json({
      result: 'ok',
      data: replyData,
    })
  } catch (e) {
    console.error(`[Error] ${e}`)
    return next(createError(500, '알 수 없는 에러가 발생했습니다.'))
  }
}

export const editReply = async (req, res, next) => {
  const newForm = {
    replyId: req.params.replyId,
    newReplyBody: req.body.newReplyBody,
  }

  const replyValidateSchema = Joi.object({
    newReplyBody: Joi.string().trim().required(),
  })

  try {
    await replyValidateSchema.validateAsync({
      newReplyBody: newForm.newReplyBody,
    })
  } catch (e) {
    console.log(
      `[INFO] 유저 ${res.locals.uid} 가 적절하지 않은 데이터로 댓글을 작성하려 했습니다. ${e}`
    )
    return next(createError(400, '입력값이 적절하지 않습니다.'))
  }

  const session = await startSession()

  try {
    await session.withTransaction(async () => {
      const patch = await Reply.update(newForm, session)

      if (patch.ok === 1) {
        const newerData = await Reply.getByParentId(req.params.feedbackId).session(session)
        console.log(`[INFO] 유저 ${res.locals.uid} 가 댓글 ${req.params.replyId} 을 수정했습니다.`)
        return res.status(200).json({
          result: 'ok',
          data: newerData,
        })
      } else {
        console.log(
          `[INFO] 유저 ${res.locals.uid}가 댓글 ${req.params.replyId} 의 수정을 시도했으나 실패했습니다.`
        )
        return next(createError(500, '알 수 없는 에러가 발생했습니다.'))
      }
    })
  } catch (e) {
    console.error(`[Error] ${e}`)
    return next(createError(500, '알 수 없는 에러가 발생했습니다.'))
  } finally {
    session.endSession()
  }
}

export const deleteReply = async (req, res, next) => {
  try {
    const deletion = await Reply.delete(req.params.replyId, { parentId: 1 })

    if (deletion.ok === 1) {
      const newerReplyData = await Reply.getByParentId(req.params.feedbackId)
      console.log(`[INFO] 유저 ${res.locals.uid} 가 댓글 ${req.params.replyId} 을 삭제했습니다.`)
      return res.status(200).json({
        result: 'ok',
        data: newerReplyData,
      })
    } else {
      console.error(
        `[Error] 데이터베이스 질의에 실패했습니다: ${req.params.replyId} 의 삭제를 시도했으나 존재하지 않습니다.`
      )
      return next(createError(500, '알 수 없는 에러가 발생했습니다.'))
    }
  } catch (e) {
    console.error(`[Error] ${e}`)
    return next(createError(500, '알 수 없는 에러가 발생했습니다.'))
  }
}
