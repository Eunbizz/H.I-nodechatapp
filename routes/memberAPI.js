// 회원 정보관리 RESTful API 전용 라우팅
// http://localhost:3000/api/member

var express = require("express");
var router = express.Router();
var bcrypt = require("bcryptjs");
var AES = require("mysql-aes");
var db = require("../models/index.js");
var jwt = require("jsonwebtoken");
var enums = require("../common/enums.js");
var moment = require("moment");

var { tokenAuthCheck } = require("./apiMiddleware.js");

// 로그인 api
router.post("/login", async (req, res, next) => {
	var apiResult = {
		code: 400,
		data: null,
		msg: "",
	};

	try {
		var { email, password } = req.body;

		// 이메일 찾기
		var member = await db.Member.findOne({ where: { email: email } });
		var resultMsg = "";

		// member 이메일이 null 값일때
		if (member == null) {
			resultMsg = "NotExistEmail";
			apiResult.code = 400;
			apiResult.data = null;
			apiResult.msg = resultMsg;
		} else {
			// 패스워드는 단방향 암호화라서 복호화 불가능. 동일암호 일치여부 체크
			var comparePassword = await bcrypt.compare(password, member.member_password);

			if (comparePassword) {
				resultMsg = "Ok";

				member.member_password = "";
				member.telephone = AES.decrypt(member.telephone, process.env.MYSQL_AES_KEY);

				var memberToken = {
					// 프라이머리키는 필수
					member_id: member.member_id,
					email: member.email,
					name: member.name,
					telephone: member.telephone,
				};

				var token = await jwt.sign(memberToken, process.env.JWT_SECRET, {
					expiresIn: "24h",
					issuer: "robin",
				});

				apiResult.code = 200;
				// 토큰데이터 넘기기
				apiResult.data = token;
				apiResult.msg = resultMsg;
			} else {
				resultMsg = "NotCorrectword";
				apiResult.code = 400;
				apiResult.data = null;
				apiResult.msg = resultMsg;
			}
		}
	} catch (error) {
		console.log("서버에러발생-/api/member/login", error.message); // 수정: error.meesage -> error.message
		apiResult.code = 500;
		apiResult.data = null;
		apiResult.msg = error.message;
	}
	res.json(apiResult);
});

// 회원가입
router.post('/entry', async(req, res, next)=>{

    var apiResult = {
        code: 400,
        data: null,
        msg: "",
    };

    try {
            var email = req.body.email
            var member_password = req.body.member_password
            var name = req.body.name
            var telephone = req.body.telephone

        // 중복체크
        var regEmail = await db.Member.findOne({ where: { email } });

        if(regEmail != null) {

            apiResult.code = 500;
            apiResult.data = null;
            apiResult.msg = "ExistDoubleEmail";

        } else {
            
            // 단방향 암호화
            var bcryptedPassword = await bcrypt.hash(member_password, 12);
            // 양방향 암호화
            var encryptTelephone = AES.encrypt(telephone, process.env.MYSQL_AES_KEY);

            var member = {
                email: email,
                member_password: bcryptedPassword,
                name: name,
                telephone: encryptTelephone,
                profile_img_path:"",
                entry_type_code: 1,
                use_state_code: 1,
                reg_date: Date.now(),
                reg_member_id: 1,
                edit_date: Date.now(),
                edit_member_id: 1
            };

            var regMember = await db.Member.create(member);

            regMember.member_password = "";
            var decryptTelephone = AES.decrypt(encryptTelephone, process.env.MYSQL_AES_KEY)
            regMember.telephone = decryptTelephone;

            apiResult.code = 200;
            apiResult.data = regMember;
            apiResult.msg = "ok";
        }
    }catch(error) {
        console.log("서버에러발생-/api/member/entry", error.message);
        apiResult.code = 500;
        apiResult.data = null;
        apiResult.msg = "Failed";
    }
    res.json(apiResult);
});

// 이메일 중복체크
router.post("/checkEmail", async (req, res) => {
	try {
		var email = req.body.email;
		var member = await db.Member.findOne({ where: { email: email } });

		var resultMsg = "";

		if (member == null && email != "") {
			resultMsg = "valid";
		} else {
			if (email == "") {
				resultMsg = "empty";
			} else if (member.email == email) {
				resultMsg = "exist";
			} else {
				resultMsg = "valid";
			}
		}
		res.json({ resultMsg });
	} catch (err) {
		res.status(500).send("Internal Server Error");
	}
});

// 사용자 정보조회
router.get("/profile", tokenAuthCheck, async (req, res, next) => {
	var apiResult = {
		code: 400,
		data: null,
		msg: "",
	};

	try {
		var token = req.headers.authorization.split("Bearer ")[1];
		var tokenJsonData = await jwt.verify(token, process.env.JWT_SECRET);

		// 웹브라우저에서 전달된 JWT토큰문자열에서 필요한 로그인 사용자 정보를 추출한다.
		var loginMemberId = tokenJsonData.member_id;
		// ㄴvar loginMemberEmail = tokenJsonData.email;

		var dbMember = await db.Member.findOne({
			where: { member_id: loginMemberId },
			// 토큰안에 정보가 없으면 db에서 가져온다.
			attributes: [
				"email",
				"name",
				"profile_img_path",
				"telephone",
				"member_password",
				"birth_date",
			],
		});

		// 복호화는 조회 한 후 해야함. 복호화하고 연락처 갱신
		dbMember.telephone = AES.decrypt(dbMember.telephone, process.env.MYSQL_AES_KEY);

		apiResult.code = 200;
		apiResult.data = dbMember;
		apiResult.msg = "OK";
	} catch (err) {
		apiResult.code = 500;
		apiResult.data = null;
		apiResult.msg = "Failed";
	}

	res.json(apiResult);
});

// 멤버 정보 조회
router.post("/find", async (req, res, next) => {
	apiResult = {
		code: 400,
		data: null,
		msg: "",
	};
	const emailData = req.body.email;
	try {
		if (!emailData || emailData.trim() === "") {
			console.log("이메일을 입력해주세요");
			return res.status(400).json({ message: "이메일을 입력해주세요" });
		}

		var member = await db.Member.findOne({ where: { email: emailData } });

		if (member) {
			if (member.use_state_code == enums.USE_STATE_CODE.ONLINE) {
				member.use_state_code = "online";
			} else if(member.use_state_code == enums.USE_STATE_CODE.OFFLINE) {
				member.use_state_code = "offline";
			} else if(member.use_state_code == enums.USE_STATE_CODE.BUSY) {
				member.use_state_code = "busy";
			}

			apiResult.code = 200;
			apiResult.data = member;
			apiResult.msg = "ok";
		} else {
			apiResult.code = 400;
			apiResult.data = null;
			apiResult.msg = "Not found";
		}
	} catch (error) {
		apiResult.code = 500;
		apiResult.data = null;
		apiResult.msg = error.message;
	}
	res.json(apiResult);
});

// Modify an existing member
router.post("/modify", tokenAuthCheck, async (req, res, next) => {
	var apiResult = {
		code: 400,
		data: null,
		msg: "",
	};
	try {
		var token = req.headers.authorization.split("Bearer ")[1];
		var decoded = jwt.verify(token, process.env.JWT_SECRET);
		var loginMemberId = decoded.member_id;

		var member = await db.Member.findOne({
			where: { member_id: loginMemberId },
			attributes: [
				"member_id",
				"email",
				"name",
				"profile_img_path",
				"telephone",
				"edit_date",
				"edit_member_id",
			],
		});
		member.profile_img_path = req.body.profile_img_path;
		member.name = req.body.name;
		member.email = req.body.email;
		member.telephone = AES.encrypt(req.body.telephone, process.env.MYSQL_AES_KEY);
		member.edit_date = Date.now();
		member.edit_member_id = 1;
		await member.save();

		member.telephone = AES.decrypt(member.telephone, process.env.MYSQL_AES_KEY);
		apiResult.code = 200;
		apiResult.data = member;
		apiResult.msg = "ok";
	} catch (error) {
		apiResult.code = 500;
		apiResult.data = null;
		apiResult.msg = error.message;
	}
	res.json(apiResult);
});

// Delete a member
router.post("/delete", async (req, res) => {
	const memberId = req.body.member_id;
	try {
		var result = await db.Member.deleteOne({ member_id: memberId });
		res.json(result);
		console.log(result, "삭제완료");
	} catch (error) {
		res.status(500).json({ message: "Member not deleted", error: error });
	}
});

// 설정 페이지 암호 변경
router.post("/password/update", tokenAuthCheck, async (req, res) => {
	var apiResult = {
		code: 400,
		data: null,
		msg: "",
	};

	try {
		var token = req.headers.authorization.split("Bearer ")[1];
		var decoded = jwt.verify(token, process.env.JWT_SECRET);
		var loginMemberId = decoded.member_id;

		var member = await db.Member.findOne({ where: { member_id: loginMemberId } });
		if (!member) throw new Error("존재하지 않는 회원입니다.");

		// DB 비밀번호와 입력한 현재 비밀번호가 같은지 확인
		var isPasswordMatch = await bcrypt.compare(req.body.cur_pwd, member.member_password);
		if (!isPasswordMatch) {
			apiResult.code = 500;
			apiResult.data = null;
			apiResult.msg = "비밀번호가 일치하지 않습니다.";
		} else {
			var isPasswordMatch = await bcrypt.compare(req.body.new_pwd, member.member_password);
			// 비밀번호 변경 입력값과 이전 비밀번호가 일치하는지 확인
			if (isPasswordMatch) {
				apiResult.code = 500;
				apiResult.data = null;
				apiResult.msg = "비밀번호가 이전과 동일합니다.";
			} else {
				// 비밀번호 확인 입력값과 일치하는지 확인
				var isPasswordMatch = (req.body.confirm_pwd === req.body.new_pwd);
				if (!isPasswordMatch) {
					apiResult.code = 500;
					apiResult.data = null;
					apiResult.msg = "비밀번호 확인이 일치하지 않습니다.";
				} else {
					new_pwd = await bcrypt.hash(req.body.new_pwd, 12);
					member.member_password = new_pwd;
					await member.save();
					apiResult.code = 200;
					apiResult.data = member;
					apiResult.msg = "ok";
				}
			}
		}
	} catch (error) {
		apiResult.code = 500;
		apiResult.data = null;
		apiResult.msg = error.message;
	}
	res.json(apiResult);
});

// 모든 친구 정보 조회
router.get('/contacts-list', async(req, res, next) =>{
	apiResult = {
		code: 400,
		data: null,
		msg: "",
	};

	try{
		var token = req.headers.authorization.split("Bearer ")[1];
		var tokenJsonData = await jwt.verify(token, process.env.JWT_SECRET);

		var friendships = await db.Friendship.findAll({
			where: {
				[db.Sequelize.Op.or]: [
					{ member_id_1: tokenJsonData.member_id },
					{ member_id_2: tokenJsonData.member_id },
				],
			},
		});

		if (friendships.length == 0) {
			apiResult.code = 200;
			apiResult.data = [];
			apiResult.msg = "ok";
			res.json(apiResult);
			return;
		}

		var memberIds = [];
		for (var friendship of friendships) {
			if (friendship.member_id_1 == tokenJsonData.member_id) {
				memberIds.push(friendship.member_id_2);
			} else {
				memberIds.push(friendship.member_id_1);
			}
		}

		var members = await db.Member.findAll({
			attributes: [
				"member_id",
				"email",
				"name",
				"use_state_code",
				"profile_img_path",
				"telephone",
			],
			// where member_id is memberIds
			where: {
				member_id: {
					[db.Sequelize.Op.in]: memberIds,
				},
			},
		});
		for (var member of members){
			if (member.use_state_code == enums.USE_STATE_CODE.ONLINE) {
				member.use_state_code = "online";
			} else if(member.use_state_code == enums.USE_STATE_CODE.OFFLINE) {
				member.use_state_code = "offline";
			} else if(member.use_state_code == enums.USE_STATE_CODE.BUSY) {
				member.use_state_code = "busy";
			}
		}

		apiResult.code = 200;
		apiResult.data = members;
		apiResult.msg = "ok";
	}catch(error){
		apiResult.code = 500;
		apiResult.data = null;
		apiResult.msg = "Failed";
	}
	res.json(apiResult);
});

// 친구 추가
router.post("/add-friend", tokenAuthCheck, async (req, res, next) => {
	apiResult = {
		code: 400,
		data: null,
		msg: "",
	};

	try{
		var token = req.headers.authorization.split("Bearer ")[1];
		var tokenJsonData = await jwt.verify(token, process.env.JWT_SECRET);

		var member_id_1 = parseInt(tokenJsonData.member_id);
		var member_id_2 = parseInt(req.body.member_id);

		if (member_id_2 < member_id_1) {
			var temp = member_id_1;
			member_id_1 = member_id_2;
			member_id_2 = temp;
		}

		var friendship = await db.Friendship.findOne({
			where: {
				member_id_1: member_id_1,
				member_id_2: member_id_2,
			},
		});

		if (friendship == null) {
			var friendship = await db.Friendship.create({
				member_id_1: member_id_1,
				member_id_2: member_id_2,
				status: 1,
				create_date: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
			});

			apiResult.code = 200;
			apiResult.data = friendship;
			apiResult.msg = "ok";
		} else {
			apiResult.code = 400;
			apiResult.data = null;
			apiResult.msg = "이미 친구 추가된 상태입니다.";
		}
	}catch(error){
		apiResult.code = 500;
		apiResult.data = null;
		apiResult.msg = "Failed";
	}
	res.json(apiResult);
});

module.exports = router;
