const jwt = require('jsonwebtoken');
require('dotenv').config();
const SECRET_KEY = process.env.SECRET_KEY;

const verifyToken = (req, res, next) => {
    try {
        const clientToken = req.cookies.user;
        const decoded = jwt.verify(clientToken, SECRET_KEY);
        if (decoded) {
//          if(decoded.isConfirmed){
            res.locals.uid = decoded.uid;
            next();
//          } else {
//            res.json({
//              result:'error',
//              reason:'이메일 인증이 완료되지 않았습니다!'
//            })
//          }
        } else {
            res.status(401).json({
              result:'error', 
              reason:'검증 실패'
            });
        }
    } catch (err) {
        res.status(401).json({
          result: 'error',
          reason:'token 유효기간 만료'
        });
    }
  };
exports.verifyToken = verifyToken;