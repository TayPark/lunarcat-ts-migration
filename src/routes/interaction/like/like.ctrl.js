import { Like, React, Board, Feedback, Reply, User } from '../../../models'
import createError from 'http-errors'

/*
  This is like router
  base url: /interaction/like[?screenId=lunarcat123]
  OPTIONS: [GET / POST / DELETE]
*/

export const addLike = async (req, res, next) => {
  let likeData = { userId: res.locals.uid, targetInfo: req.body.targetInfo, targetType: req.body.targetType}

  const { targetInfo, targetType } = req.body

  try {
    const didLike = await Like.didLike(likeData)

    if (didLike) {
      console.warn(`[WARN] 유저 ${res.locals.uid} 가 이미 좋아요 한 ${likeData.targetType}:${targetInfo} 에 좋아요를 요청했습니다.`)
      return next(createError(400, '이미 처리된 데이터입니다.'))
    }

    await Like.like(likeData)

    console.log(`[INFO] 유저 ${res.locals.uid}가 ${targetType}: ${targetInfo}를 좋아합니다.`)

    let likeCount

    if (targetType === 'Board') {
      const reactData = {
        user: res.locals.uid,
        boardId: req.body.targetInfo,
        type: 'like',
      }

      await React.create(reactData)
      await Board.countHeart(targetInfo, 1)
      await Board.countReact(targetInfo, 1)
      likeCount = await Board.getHeartCount(targetInfo)
    } else if (targetType === 'Feedback') {
      await Feedback.countHeart(targetInfo, 1)
      likeCount = await Feedback.getHeartCount(targetInfo)
    } else if (targetType === 'Reply') {
      await Reply.countHeart(req.body.targetInfo, 1)
      likeCount = await Reply.getHeartCount(targetInfo)
    }

    return res.status(201).json({
      result: 'ok',
      data: likeCount,
    })
  } catch (e) {
    console.error(`[Error] ${e}`)
    return next(createError(500, '알 수 없는 에러가 발생했습니다.'))
  }
}

export const deleteLike = async (req, res, next) => {
  let likeData = { userId: res.locals.uid, targetInfo: req.body.targetInfo , targetType: req.body.targetType}

  const { targetInfo, targetType } = req.body

  try {
    const didLike = await Like.didLike(likeData)
    
    if (!didLike) {
      console.warn(`[WARN] 유저 ${res.locals.uid} 가 좋아요 하지 않은 ${targetType}:${targetInfo}에 대해 좋아요를 해제하려 했습니다.`)
      return next(createError(400, '이미 처리된 데이터입니다.'))
    }

    await Like.unlike(likeData)

    console.log(
      `[INFO] 유저 ${res.locals.uid}가 ${targetType}: ${targetInfo}의 좋아요를 해제했습니다.`
    )

    let likeCount

    if (targetType === 'Board') {
      await React.delete(likeData.userId, targetInfo)
      await Board.countHeart(req.body.targetInfo, 0)
      await Board.countReact(req.body.targetInfo, 0)
      likeCount = await Board.getHeartCount(targetInfo)
    } else if (targetType === 'Feedback') {
      await Feedback.countHeart(req.body.targetInfo, 0)
      likeCount = await Feedback.getHeartCount(targetInfo)
    } else if (targetType === 'Reply') {
      await Reply.countHeart(req.body.targetInfo, 0)
      likeCount = await Reply.getHeartCount(targetInfo)
    }

    return res.status(200).json({
      result: 'ok',
      data: likeCount,
    })
  } catch (e) {
    console.error(`[Error] ${e}`)
    return next(createError(500, '알 수 없는 에러가 발생했습니다.'))
  }
}

export const getLikeList = async (req, res, next) => {
  const screenId = req.query.screenId
  const targetType = req.query.targetType

  try {
    const userId = await User.getIdByScreenId(screenId)
    const likeObjectIdList = await Like.getByUserId(userId, targetType)

    console.log(`[INFO] 유저 ${res.locals.uid}가 유저 ${userId} 의 좋아요 리스트를 확인했습니다.`)
    return res.status(200).json({
      result: 'ok',
      data: likeObjectIdList,
    })
  } catch (e) {
    console.error(`[Error] ${e}`)
    return next(createError(500, '알 수 없는 에러가 발생했습니다.'))
  }
}
