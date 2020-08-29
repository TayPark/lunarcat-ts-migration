const express = require("express");
const router = express.Router();
const { verifyToken, checkWriter } = require("./authorization");
require("dotenv").config();
const Board = require("../models/board");
const Feedback = require("../models/feedback");
const User = require("../models/users");
const Reply = require('../models/reply')
const upload = require("./multer");

router.get("/health", (req, res) => {
  res.status(200).json({
    result: "ok",
    message: "Server is on work",
  });
});

router.post("/", verifyToken, upload.any(), async function (req, res, next) {
  const uid = res.locals.uid;
  const boardTitle = req.body.boardTitle;
  const boardBody = req.body.boardBody;
  let boardImg = [];
  for (let i = 0; i < req.files.length; i++) {
    boardImg.push(req.files[i].location);
  }
  const category = req.body.category;
  const pub = req.body.pub;
  const language = req.body.language;

  try {
    const result = await Board.create({
      uid,
      boardTitle,
      boardBody,
      boardImg,
      category,
      pub,
      language,
      likeCount: 0,
    });
    return res.status(201).json({
      result: "ok",
      data: result,
    });
  } catch (e) {
    console.error(`[Error!] ${e}`);
    return res.status(500).json({
      result: "error",
      message: e.message,
    });
  }
});

// 글 뷰
router.get("/:boardId", verifyToken, async (req, res, next) => {
  const boardId = req.params.boardId;

  try {
    const boardData = await Board.getById(boardId);
    const writerData = await User.getUserInfo(res.locals.uid, {
      nickname: 1,
      userid: 1,
    });
    const feedbackWithoutUserInfo = await Feedback.getByBoardId(boardId);
    const feedbackData = [];

    for (const reply of feedbackWithoutUserInfo) {
      let { nickname, userid } = await User.getUserInfo(reply.userId);

      feedbackData.push({
        _id: reply._id,
        buid: reply.buid,
        edited: reply.edited,
        feedbackBody: reply.feedbackBody,
        writeDate: reply.writeDate,
        userInfo: {
          userid,
          nickname,
        },
      });
    }
    return res.status(200).json({
      result: "ok",
      data: {
        writer: writerData,
        board: boardData,
        feedback: feedbackData,
      },
    });
  } catch (e) {
    console.error(`[Error!] ${e}`);
    return res.status(500).json({
      result: "error",
      message: e.message,
    });
  }
});

// 삭제
router.delete("/:boardId", verifyToken, checkWriter, async function (
  req,
  res,
  next
) {
  const boardId = req.params.boardId;

  try {
    const deletion = await Board.delete(boardId);

    if (deletion.ok === 1) {
      if (deletion.n === 1 && deletion.n === deletion.deletedCount) {
        return res.sendStatus(200);
      } else if (deletion.ok === 1 && deletion.n !== deletion.deletedCount) {
        return res.status(200).json({
          message: "질의에 성공했으나 데이터가 삭제되지 않았습니다.",
        });
      } else if (deletion.n === 0) {
        return res.status(404).json({
          message: "존재하지 않는 데이터에 접근했습니다.",
        });
      }
    } else {
      return res.status(500).json({
        message: "데이터베이스 질의 실패",
      });
    }
  } catch (e) {
    console.error(`[Error!] ${e}`);
    return res.status(500).json({
      result: "error",
      message: e.message,
    });
  }
});

// 수정 전 이전 데이터 불러오기
router.get("/:boardId/edit", verifyToken, checkWriter, async function (
  req,
  res,
  next
) {
  const boardId = req.params.boardId;

  try {
    const result = await Board.getArticle(boardId);
    return res.status(200).json({
      result: "ok",
      data: result,
    });
  } catch (e) {
    console.error(`[Error!] ${e}`);
    return res.status(500).json({
      result: "error",
      message: e.message,
    });
  }
});

// 수정
router.patch(
  "/:boardId/edit",
  verifyToken,
  checkWriter,
  upload.any(),
  async function (req, res, next) {
    let boardImg = [];
    for (let i = 0; i < req.files.length; i++) {
      boardImg.push(req.files[i].location);
    }
    const updateData = {
      boardId: req.params.boardId,
      boardTitle: req.body.boardTitle,
      boardBody: req.body.boardBody,
      boardImg: boardImg,
      category: req.body.category,
      pub: req.body.pub,
      language: req.body.language,
    };

    try {
      const patch = await Board.update(updateData);

      if (patch.ok === 1) {
        if (patch.n === 1 && patch.n === patch.nModified) {
          return res.sendStatus(200);
        } else if (
          patch.n === 1 &&
          patch.n !== patch.nModified
        ) {
          return res.status(200).json({
            msg: "질의에 성공했으나 데이터가 수정되지 않았습니다.",
          });
        } else if (patch.n === 0) {
          return res.status(404).json({
            msg: "존재하지 않는 데이터에 접근했습니다.",
          });
        }
      }
    } catch (e) {
      console.error(`[Error!] ${e}`);
      return res.status(500).json({
        result: "ok",
        message: e.message,
      });
    }
  }
);

/* 유저마다 다르게 받아야 함 */
router.get("/", verifyToken, async (req, res, next) => {
  const result = new Array();

  try {
    const boardList = await Board.findAll();

    for (const data of boardList) {
      let userInfo = await User.getUserInfo(data.uid);

      result.push({
        boardUid: data._id,
        boardTitle: data.boardTitle,
        thumbPath: data.boardImg[0],
        userNick: userInfo.nickname,
        pub: data.pub,
        category: data.category,
      });
    }

    return res.status(200).json({
      result: "ok",
      data: result,
    });
  } catch (e) {
    console.error(`[Error!] ${e}`);
    return res.status(500).json({
      result: "error",
      message: e.message,
    });
  }
});

router.post("/:boardId/feedback", verifyToken, async (req, res, next) => {
  const feedbackData = {
    userId: res.locals.uid,
    boardId: req.params.boardId,
    feedbackBody: req.body.feedbackBody,
  };

  const newerData = []

  try {
    await Feedback.create(feedbackData);
    await Board.countFeedback(req.params.boardId, 1)
    const newerFeedbackData = await Feedback.getByBoardId(req.params.boardId);
    for (let data of newerFeedbackData) {
      let userData = await User.getUserInfo(data.userId, { _id: 0, nickname: 1, userid: 1, profile: 1 })
      let feedbackData = {
        _id: data._id,
        boardId: data.boardId,
        childCount: data.childCount,
        edited: data.edited,
        feedbackBody: data.feedbackBody,
        likeCount: data.likeCount,
        writeDate: data.writeDate,
        userInfo: userData
      }
      newerData.push(feedbackData)
    }
    console.log(`[INFO] 유저 ${res.locals.uid}가 ${req.params.boardId}에 피드백을 작성했습니다.`)
    return res.status(201).json({
      result: "ok",
      data: newerData
    });
  } catch (e) {
    console.error(`[Error] ${e}`);
    return res.status(500).json({
      result: "error",
      message: e.message,
    });
  }
});

router.patch(
  "/:boardId/feedback/:feedbackId",
  verifyToken,
  checkWriter,
  async (req, res, next) => {
    const newForm = {
      feedbackId: req.params.feedbackId,
      newFeedbackBody: req.body.newFeedbackBody,
    };
    const boardId = req.params.boardId;
    const newerData = [];
    try {
      const patch = await Feedback.update(newForm);

      if (patch.ok === 1) {
        const newerFeedbackData = await Feedback.getByBoardId(boardId);
        for (let data of newerFeedbackData) {
          let userData = await User.getUserInfo(data.userId, { _id: 0, nickname: 1, userid: 1, profile: 1 })
          let feedbackData = {
            _id: data._id,
            boardId: data.boardId,
            childCount: data.childCount,
            edited: data.edited,
            feedbackBody: data.feedbackBody,
            likeCount: data.likeCount,
            writeDate: data.writeDate,
            userInfo: userData
          }
          newerData.push(feedbackData)
        }
        console.log(`[INFO] 유저 ${res.locals.uid}가 피드백 ${req.params.feedbackId}을 수정했습니다.`)
        return res.status(200).json({
          result: "ok",
          data: newerData,
        });
      } else {
        return res.status(500).json({
          result: "error",
          message: `데이터베이스 질의 실패; ${patch.ok}`,
        });
      }
    } catch (e) {
      console.error(`[Error] ${e}`);
      return res.status(500).json({
        result: "error",
        message: e.message,
      });
    }
  });

router.delete(
  "/:boardId/feedback/:feedbackId",
  verifyToken,
  checkWriter,
  async (req, res, next) => {
    const feedbackId = req.params.feedbackId;
    const newerData = [];

    try {
      const deletion = await Feedback.delete(feedbackId);
      await Board.countFeedback(req.params.boardId, 0)
      const boardId = req.params.boardId;

      if (deletion.ok === 1) {
        console.log(`[INFO] 유저 ${res.locals.uid}가 피드백 ${req.params.feedbackId}을 삭제했습니다.`)
      } else if (deletion.ok === 0) {
        console.warn(`[ERROR] 유저 ${res.locals.uid}가 피드백 ${req.params.feedbackId}의 삭제를 시도했지만 실패했습니다.`)
      }
      const newerFeedbackData = await Feedback.getByBoardId(boardId);
      for (let data of newerFeedbackData) {
        let userData = await User.getUserInfo(data.userId, { _id: 0, nickname: 1, userid: 1, profile: 1 })
        let feedbackData = {
          _id: data._id,
          boardId: data.boardId,
          childCount: data.childCount,
          edited: data.edited,
          feedbackBody: data.feedbackBody,
          likeCount: data.likeCount,
          writeDate: data.writeDate,
          userInfo: userData
        }
        newerData.push(feedbackData)
      }
      return res.status(200).json({
        result: "ok",
        data: newerData
      })
    } catch (e) {
      console.error(`[Error] ${e}`);
      return res.status(500).json({
        result: "error",
        message: e.message,
      });
    }
  }
);

router.post("/:boardId/feedback/:feedbackId/reply", verifyToken, async (req, res, next) => {
  const replyForm = {
    userId: res.locals.uid,
    boardId: req.params.boardId,
    parentId: req.body.parentId,
    replyBody: req.body.replyBody,
  };

  const newerData = []

  try {
    await Reply.create(replyForm);
    await Feedback.countReply(replyForm.parentId, 1)
    const newerReplyData = await Reply.getByParentId(replyForm.parentId);
    for (let data of newerReplyData) {
      let userData = await User.getUserInfo(data.userId, { _id: 0, nickname: 1, userid: 1, profile: 1 })
      console.log(data)
      let feedbackData = {
        _id: data._id,
        boardId: data.boardId,
        parentId: data.parentId,
        replyBody: data.replyBody,
        edited: data.edited,
        heartCount: data.heartCount,
        writeDate: data.writeDate,
        userInfo: userData
      }
      newerData.push(feedbackData)
    }
    console.log(`[INFO] 유저 ${res.locals.uid}가 피드백 ${req.params.feedbackId}에 대댓글을 달았습니다.`)
    return res.status(200).json({
      result: "ok",
      data: newerData,
    });
  } catch (e) {
    console.error(`[Error] ${e}`);
    return res.status(500).json({
      result: "error",
      message: e.message,
    });
  }
});

// 댓글 하위의 대댓글 뷰
router.get("/:boardId/feedback/:feedbackId/reply", verifyToken, async (req, res, next) => {
  const parentId = req.params.feedbackId;
  const resultDataSet = []

  try {
    const replyData = await Reply.getByParentId(parentId);
    for (let data of replyData) {
      let userData = await User.getUserInfo(data.userId, { _id: 0, nickname: 1, userid: 1, profile: 1 })
      console.log(data)
      let resultData = {
        _id: data._id,
        boardId: data.boardId,
        parentId: data.parentId,
        replyBody: data.replyBody,
        edited: data.edited,
        heartCount: data.heartCount,
        writeDate: data.writeDate,
        userInfo: userData
      }
      resultDataSet.push(resultData)
    }
    return res.status(200).json({
      result: "ok",
      data: resultDataSet,
    });
  } catch (e) {
    console.error(`[Error] ${e}`);
    return res.status(500).json({
      result: "error",
      message: e.message,
    });
  }
});

router.patch("/:boardId/feedback/:feedbackId/reply/:replyId", verifyToken, checkWriter, async (req, res, next) => {
  const newForm = {
    replyId: req.params.replyId,
    newReplyBody: req.body.newReplyBody,
  };
  
  const newerData = [];

  try {
    const patch = await Reply.update(newForm);
    const parentId = await Reply.getParentId(req.params.replyId);

    if (patch.ok === 1) {
      const newerReplyData = await Reply.getByParentId(parentId);
      
    } else {
      
    }
  } catch (e) {
    console.error(`[Error] ${e}`);
    return res.status(500).json({
      result: "error",
      message: e.message,
    });
  }
});

router.delete("/:boardId/feedback/:feedbackId/reply/:replyId", verifyToken, checkWriter, async (req, res, next) => {
  const replyId = req.params.replyId;

  try {
    const parentId = await Reply.getById(replyId);
    await Feedback.countReply(replyForm.parentId, 0)
    const deletion = await Reply.delete(replyId, { parentId: 1 });
    if (deletion.ok === 1) {
      const newerReplyData = await Reply.getByParentId(parentId);

      if (
        deletion.n === 1 &&
        deletion.n === deletion.deletedCount
      ) {
        return res.send(200).json({
          result: "ok",
          data: newerReplyData,
        });
      } else if (
        deletion.ok === 1 &&
        deletion.n !== deletion.deletedCount
      ) {
        return res.status(200).json({
          result: "ok",
          message: "질의에 성공했으나 데이터가 삭제되지 않았습니다.",
        });
      } else if (deletion.n === 0) {
        return res.status(404).json({
          result: "error",
          message: "존재하지 않는 데이터에 접근했습니다.",
        });
      }
    } else {
      return res.status(500).json({
        result: "error",
        message: "데이터베이스 질의 실패",
      });
    }
  } catch (e) {
    console.error(`[Error] ${e}`);
    return res.status(500).json({
      result: "error",
      message: e.message,
    });
  }
});

module.exports = router;
