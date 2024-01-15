const jwt = require("jsonwebtoken");

// 각종 RESTful API 라우터, 라우팅 메소드에서 데이터 요청하는 측에서
// JWT 사용자 로그인 인증토큰이 있는지 없는지를 체크해서 추행작업을 제어하는 미들웨어 구현
// apiMiddleware.js 해당 호출 API를 해당 요청 사용자가 호출/사용가능한지에 대한 권한체크 미들웨어
exports.tokenAuthChecking = async(req, res, next)=>{
    // 발급된 토큰정보가 존재하지 않을 경우
    if(req.headers.authorization == undefined){
        var apiResult = {
            code: 401,
            data: null,
            msg: "NoToken",
        }
        return res.json(apiResult);
    }
    
    // 제공 토큰의 유효성을 체크해서 유효하지 않으면 (만료토큰) 401 에러 응답하고 유효하면 다음 미들웨어로 제어권을 넘김
    try{
        var token = req.headers.authorization.split("Bearer ")[1];
		var tokenJsonData = await jwt.verify(token, process.env.JWT_SECRET);

        if (tokenJsonData!=null){
            next();
        }
    }catch(err){
        var apiResult = {
            code: 401,
            data: null,
            msg: "ExpiredToken",
        }
        return res.json(apiResult);
    }
}