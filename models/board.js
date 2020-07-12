const mongoose = require('mongoose');
const ObjectId = mongoose.ObjectId;
const User = require('./users');
// const Reply = require('./reply').Schema;
// const React = require('./react').Schema;
mongoose.set('useCreateIndex', true);

const board = new mongoose.Schema({
    uid: {type: ObjectId, required: true},
    boardTitle: {type: String},
    boardImg: {type: [String], required: true},
    boardBody:{type:String},
    category: {type:String, required: true},
    pub: {type:String, required: true},
    writeDate: {type:Date, default: Date.now},
    originUid:{type:ObjectId},
    originBuId:{type:ObjectId},
    edited: { type: Boolean, default: false },
    // likeCount:{type:Number},
    // Reply와 React는 BoardId를 가지므로 Board Schema에는 넣지 않음.
    // reactList:{type: [React]},
    // replyList:{type: [Reply]},
})

board.statics.create = function (data) {
    const boardData = new this(data);

    return boardData.save();
}

/* 수정, 삭제, 댓글에 필요한 boardId GET (미검증) */
board.statics.getArticle = function ( boardId ) {
    return this.findOne({ "_id" : boardId });
}

/* 특정 유저의 글 GET (미검증) */ 
board.statics.getUserArticleList = function ( userId ) {
    return this.find({ uid: userId });
}

board.statics.isWriter = function (userId, boardId) {
  return this.findOne({ _id: boardId, uid: userId })
}

board.statics.updateArticle = function (articleData, cb) {
  this.updateOne(
    { _id: articleData.boardId },
    {
      boardTitle: articleData.boardTitle,
      boardBody: articleData.boardBody,
      boardImg: articleData.boardImg,
      category: articleData.category,
      pub: articleData.pub,
      language: articleData.language,
      edited: true,
    },
    function (err, data) {
      if (err) {
        console.log(err);
        return false
      }
      return true;
    }
  );
};

board.statics.removeArticle = function (buid, cb) {
    return this.deleteOne({ _id: buid }, cb)
}

/* 글 전체 조회 */
board.statics.findAll = function () {
  // uid를 이용해 유저 닉네임을 응답데이터에 넣어야하는데 어떻게 넣어야 효율적일지 고민이 필요
  return this.find(
    {},
    { _id: 1, boardTitle: 1, uid: 1, pub: 1, category: 1, boardImg: 1 }
  );
};

/* 좋아요 수는 DB에 쿼리를 날린 후 배열 사이즈로  */
// board.statics.like = function (boardId) {
//     return this.updateOne(
//         { _id: boardId },
//         {
//             $inc: {
//                 likeCount: 1
//             }
//         }
//     )
// }

// board.statics.unlike = function (boardId) {
//         return this.updateOne(
//         { _id: boardId },
//         {
//             $inc: {
//                 likeCount: - 1
//             }
//         }
//     )
// }



module.exports = mongoose.model('Board', board);