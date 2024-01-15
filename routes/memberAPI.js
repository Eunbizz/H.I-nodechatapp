// 회원 정보관리 RESTful API 전용 라우팅
// http://localhost:3000/api/member

var express = require('express');
var router = express.Router();
var byctrpt = require("bcryptjs");
var AES = require("mysql-aes");
var db = require("../models/index.js");
var jwt = require("jsonwebtoken");

var {tokenAuthChecking} = require("./apiMiddleware.js");

// Get all members
router.get('/all', async(req, res, next)=>{
    try {
        var members = await db.Member.findAll();
        res.json(members);
    }catch(error) {
        console.log(error);
        res.json({ message: "Member not find", error: error });
    }
});

router.post('/login', async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const user = await db.Member.findOne({ where: { email } });

        if (!user) {
            return res.json({ message: "이메일이나 비밀번호가 올바르지 않습니다." });
        }

        if (password === user.member_password) {
            // 로그인 성공
            res.json({ message: "로그인 성공", user });
        } else {
            // 비밀번호 불일치
            res.json({ message: "이메일이나 비밀번호가 올바르지 않습니다." });
        }

    } catch (error) {
        console.log(error);
        res.json({ message: "Member not Login", error });
    }
});

// Create a new member
router.post('/entry', async(req, res, next)=>{
    var apiResult = {
		code: 400,
		data: null,
		msg: "",
	};
    
    var memberData = {
        email: req.body.email,
        member_password: req.body.password,
        name: req.body.name,
        telephone: req.body.telephone,
        entry_type_code: 1,
        use_state_code: 1,
        profile_img_path: req.body.profileImgPath,
        birth_date: req.body.birthDate,
        reg_date: Date.now(),
        reg_member_id: 1,
        edit_date: Date.now()
    };

    try {
        // 이메일 중복체크
        var regEmail = await db.Member.findOne({ where: { email: memberData.email } });

        // 이메일 중복이 아닐 경우 회원가입 처리
        if(regEmail == null) {
            // 비밀번호, 전화번호 암호화
            var enc_pass = byctrpt.hashSync(memberData.member_password, 8);
            var enc_tel = AES.encrypt(memberData.telephone, process.env.MYSQL_AES_KEY);
            // 암호화된 비밀번호, 전화번호로 회원가입 처리
            memberData.member_password = enc_pass;
            memberData.telephone = enc_tel;
            var registeredMember = await db.Member.create(memberData);
            // 암호화된 비밀번호, 전화번호 복호화
            registeredMember.member_password = "";
            var dec_tel = AES.decrypt(enc_tel, process.env.MYSQL_AES_KEY);
            registeredMember.telephone = dec_tel;

            apiResult.code = 200;
            apiResult.data = registeredMember;
            apiResult.msg = "ok";
        } else {
            apiResult.code = 500;
			apiResult.data = null;
			apiResult.msg = "ExistDuplicatedEmail";
        }
    }catch(error) {
        console.log("서버에러발생-/api/member/entry", err.meesage);
		apiResult.code = 500;
		apiResult.data = null;
		apiResult.msg = err.message;
    }
    res.json(apiResult);
});

// find member
router.post('/find', async (req, res, next) => {
    const emailData = req.body.email;
    try {
        // trim: 문자열의 양 끝에 있는 공백(스페이스, 탭, 줄바꿈)을 제거하는 JavaScript의 문자열 메소드
        if (!emailData || emailData.trim() === "") {
            console.log('이메일을 입력해주세요');
            return res.status(400).json({ message: "이메일을 입력해주세요" });
        }

        const findEmail = await db.Member.findOne({ where: { email: emailData } });

        if (findEmail) {
            res.json({ message: "Member found", member: findEmail });
        } else {
            res.json({ message: "Member not found" });
        }

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Member not found", error: error });
    }
});

// Modify an existing member
router.post('/modify', tokenAuthChecking, async (req, res, next) => {
    var apiResult = {
		code: 400,
		data: null,
		msg: "",
	};
    try {
        var token = req.headers.authorization.split("Bearer ")[1];
        var decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        var loginMemberId = decoded.member_id;

        var member = await db.Member.findOne({ 
            where: { member_id: loginMemberId },
            attributes: ['member_id', 'email', 'name', 'profile_img_path', 'telephone', 'edit_date', 'edit_member_id']
        });
        member.profile_img_path = req.body.profileImgPath;
        member.name = req.body.name;
        member.email = req.body.email;
        member.telephone = AES.encrypt(req.body.telephone, process.env.MYSQL_AES_KEY);
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
router.post('/delete', async(req, res) =>{
    const memberId = req.body.member_id;
    try {
        var result = await db.Member.deleteOne({ member_id: memberId });
        res.json(result);
        console.log(result, "삭제완료");
        
    } catch(error) {
        console.log(error);
        res.status(500).json({ message: "Member not deleted", error: error });
    }
});

// 설정 페이지 암호 변경
router.post('/paaword/update', tokenAuthChecking, async(req, res) =>{
    var apiResult = {
		code: 400,
		data: null,
		msg: "",
	};

    try {
        var token = req.headers.authorization.split("Bearer ")[1];
        var decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        var loginMemberId = decoded.member_id;

        var member = await db.Member.findOne({ where: { member_id: loginMemberId } });
        if(!member) throw new Error("존재하지 않는 회원입니다.");

        // DB 비밀번호와 입력한 현재 비밀번호가 같은지 확인
        var cur_pwd = byctrpt.hashSync(req.body.cur_pwd, 12);
        var isPasswordMatch = await byctrpt.compare(cur_pwd, member.member_password);
        if (!isPasswordMatch) {
            apiResult.code = 500;
            apiResult.data = null;
            apiResult.msg = "비밀번호가 일치하지 않습니다.";
        }
        else{
            var new_pwd = byctrpt.hashSync(req.body.new_pwd, 12);
            var isPasswordMatch = await byctrpt.compare(new_pwd, member.member_password);
            // 비밀번호 변경 입력값과 이전 비밀번호가 일치하는지 확인
            if (isPasswordMatch) {
                apiResult.code = 500;
                apiResult.data = null;
                apiResult.msg = "비밀번호가 이전과 동일합니다.";
            }else{
                // 비밀번호 확인 입력값과 일치하는지 확인
                var confirm_pwd = byctrpt.hashSync(req.body.conform_pwd, 12);
                var isPasswordMatch = await byctrpt.compare(confirm_pwd, new_pwd);
                if (!isPasswordMatch) {
                    apiResult.code = 500;
                    apiResult.data = null;
                    apiResult.msg = "비밀번호가 일치하지 않습니다.";
                }else{
                    member.member_password = new_pwd;
                    await member.save();
                    apiResult.code = 200;
                    apiResult.data = member;
                    apiResult.msg = "ok";
                }
            }
        }
    } catch(error) {
        apiResult.code = 500;
        apiResult.data = null;
        apiResult.msg = error.message;
    }
    res.json(apiResult);
})

// Get a single member by ID
router.get('/:mid', async(req, res) =>{
    var memberId = parseInt(req.params.mid, 10); // 10진수 정수로 변환
    try{
        var members = await db.Member.findOne({ where: { member_id: memberId } });
        res.json({members});
    } catch(error) {
        console.log(error);
        res.status(500).json({ message: "Member not findOne", error: error });
    }
});

module.exports = router;