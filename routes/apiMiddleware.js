const jwt = require("jsonwebtoken");

exports.tokenAuthCheck = async (req, res, next) => {
	// STEP1: 발급된 토큰정보가 존재하지 않을경우
	if (req.headers.authorization == undefined) {
		var apiResult = {
			code: 400,
			data: null,
			msg: "사용자 인증토큰이 제공되지 않았습니다.",
		};
		return res.json(apiResult);
	}

	// 제공토큰의 유효성을 체크해서 유효하지 않으면 (만료토큰) 튕기고 정상적인 토큰이면 다음 콜백함수로 흘려보내기
	try {
		var token = req.headers.authorization.split("Bearer ")[1];
		var tokenJsonData = await jwt.verify(token, process.env.JWT_SECRET);

		if (tokenJsonData != null) {
			next();
		}
	} catch (err) {
		var apiResult = {
			code: 400,
			data: null,
			msg: "유효하지 않은 사용자 인증토큰입니다.",
		};
		return res.json(apiResult);
	}
};
