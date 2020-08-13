const express = require("express");
const router = express.Router();
const { verifyToken, checkWriter } = require("./authorization");
require("dotenv").config();
const Board = require("../models/board");
const Feedback = require("../models/feedback");
const User = require("../models/users");
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
        replyBody: reply.replyBody,
        writeDate: reply.writeDate,
        userInfo: {
          userId: userid,
          userNick: nickname,
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
    const deleteResult = await Board.delete(boardId);

    if (deleteResult.ok === 1) {
      if (
        deleteResult.n === 1 &&
        deleteResult.n === deleteResult.deletedCount
      ) {
        return res.sendStatus(200);
      } else if (
        deleteResult.ok === 1 &&
        deleteResult.n !== deleteResult.deletedCount
      ) {
        return res.status(200).json({
          message: "질의에 성공했으나 데이터가 삭제되지 않았습니다.",
        });
      } else if (deleteResult.n === 0) {
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
      const patchResult = await Board.update(updateData);

      if (patchResult.ok === 1) {
        if (patchResult.n === 1 && patchResult.n === patchResult.nModified) {
          return res.sendStatus(200);
        } else if (
          patchResult.n === 1 &&
          patchResult.n !== patchResult.nModified
        ) {
          return res.status(200).json({
            msg: "질의에 성공했으나 데이터가 수정되지 않았습니다.",
          });
        } else if (patchResult.n === 0) {
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

module.exports = router;
