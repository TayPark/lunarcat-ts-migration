import Board from "../../models/board";
import Feedback from "../../models/feedback";
import User from "../../models/users"

export const postBoard = async (req, res, next) => {
  let _boardImg = [];
  for (let i = 0; i < req.files.length; i++) {
    _boardImg.push(req.files[i].location);
  }

  const boardData = {
    writer: res.locals.uid,
    boardTitle: req.body.boardTitle,
    boardBody: req.body.boardBody,
    category: req.body.category,
    pub: req.body.pub,
    lanuage: req.body.lanuage,
    boardImg: _boardImg
  }

  try {
    const result = await Board.create(boardData);
    console.log(`[INFO] user ${boardData.writer}가 글 ${result._id}를 작성했습니다.`)
    return res.status(201).json({
      result: "ok",
      data: result,
    });
  } catch (e) {
    console.error(`[ERROR] ${e}`);
    return res.status(500).json({
      result: "error",
      message: e.message,
    });
  }
};

// 글 뷰
export const viewBoard = async (req, res, next) => {
  const boardId = req.params.boardId;
  try {
    const boardData = await Board.getById(boardId);
    console.log(`[INFO] 유저 ${res.locals.uid}가 글 ${boardId}를 접근했습니다.`)
    return res.status(200).json({
      result: "ok",
      data: boardData
    });
  } catch (e) {
    console.error(`[ERROR] ${e}`);
    return res.status(500).json({
      result: "error",
      message: e.message,
    });
  }
};

// 삭제
export const deleteBoard = async (req, res, next) => {
  const boardId = req.params.boardId;
  
  try {
    const deletion = await Board.delete(boardId);

    if (deletion.ok === 1) {
      console.log(`[INFO] 글 ${boardId}가 삭제되었습니다.`)
      return res.status(200).json({
        result: 'ok'
      })
    } else {
      console.warn(`[ERROR] 글 ${boardId}의 삭제가 실패하였습니다.`)
      return res.status(400).json({
      
      })
    }
  } catch (e) {
    console.error(`[ERROR] ${e}`);
    return res.status(500).json({
      result: "error",
      message: e.message,
    });
  }
};

// 수정 전 이전 데이터 불러오기
export const getEditInfo = async (req, res, next) => {
  const boardId = req.params.boardId;

  try {
    const previousData = await Board.getById(boardId);
    
    console.log(`[INFO] 유저 ${res.locals.uid}가 글 ${boardId}을 수정을 위해 데이터를 요청했습니다.`)
    
    return res.status(200).json({
      result: "ok",
      data: previousData,
    });
  } catch (e) {
    console.error(`[ERROR] ${e}`);
    return res.status(500).json({
      result: "error",
      message: e.message,
    });
  }
};

// 수정
export const postEditInfo = async function (req, res, next) {
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
        console.log(`[INFO] 유저 ${res.locals.uid}가 글 ${req.params.boardId}을 수정했습니다.`)
        if (patch.n === 1 && patch.n === patch.nModified) {
          return res.sendStatus(200);
        } else if (patch.n === 1 && patch.n !== patch.nModified) {
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
      console.error(`[ERROR] ${e}`);
      return res.status(500).json({
        result: "ok",
        message: e.message,
      });
    }
  };

/* 유저마다 다르게 받아야 함 */
export const getBoards = async (req, res, next) => {
  const result = [];

  try {
    const boardList = await Board.findAll();
    for (const data of boardList) {
      const dataSlot = {
        boardId: data._id,
        boardTitle: data.boardTitle,
        boardBody: data.boardBody,
        thumbPath: data.boardImg[0],
        userNick: data.writer.nickname,
        userNick: data.writer.nickname,
        pub: data.pub,
        category: data.category,
        heartCount: data.heartCount
      }
      result.push(dataSlot);
    }

    return res.status(200).json({
      result: "ok",
      data: result,
    });
  } catch (e) {
    console.error(`[ERROR] ${e}`);
    return res.status(500).json({
      result: "error",
      message: e.message,
    });
  }
};