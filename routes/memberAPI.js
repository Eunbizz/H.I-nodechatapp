// 회원 정보관리 RESTful API 전용 라우팅
// http://localhost:3000/api/member

var express = require('express');
var router = express.Router();

// jsonwebtoken 참조
const jwt = require('jsonwebtoken');

var Member = require('../models/member');

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

    var apiResult = {
        code: 400,
        data: {},
        msg: "",
     };

    const { email, password } = req.body;

    try {
        const member = await db.Member.findOne({ where: { email } });

        if (!member) {
            apiResult.code = 400;
            apiResult.data = "notExistEmail";
            apiResult.msg = "동일한 메일주소가 존재하지 않습니다.";
            return res.json(apiResult);
        }

        if (password != user.member_password) {
            // 비밀번호 불일치
            apiResult.code = 400;
            apiResult.data = null;
            apiResult.msg = "이메일이나 비밀번호가 올바르지 않습니다.";

            res.json(apiResult.msg);
        }

        // 사용자 정보 중 중요 정보를 JWT 토큰으로 생성
        var tokenJsonData = {
            member_id:member.member_id,
            email:member.email,
            name:member.name,
            profile_img_path:member.profile_img_path,
            telephone:member.telephone
        };

        // 사용자 정보를 담고있는 JWT 사용자 인증토큰 생성
        const token = jwt.sign(tokenJsonData, process.env.JWT_SECRET,
            {expriresIn:'24h', issuer:'eunbi'});

        apiResult.code = 200;
        apiResult.data = token;
        apiResult.msg = "OK";

    } catch (error) {
        apiResult.code = 500;
        apiResult.data = null;
        apiResult.msg = "서버에러";
    }
    res.json(apiResult);
});

// 로그인 완료한 사용자 개인 프로필 정보 조회 API
// 반드시 로그인시 러버에서 발급해준 JWT 토큰값이 전달되어야 함
// localhost:3000/api/member/profile
router.get('/profile', async(req,res)=>{

    var apiResult = {
        code:"",
        data:{},
        msg:""
    };

    try{
        // 현재 profile api를 호출하는 사용자 요청 http header 영역에서
        // Authorization의 JWT 토큰값 존재여부 확인 및 추출
        const token = req.headers.authorization.split('Bearer ')[1];

        // JWT 토큰이 전달되지 않았을 경우
        if (token==undefined){
            apiResult.code = 400;
            apiResult.data = "notprovidetoken";
            apiResult.msg = "인증토큰이 제공되지 않았습니다.";

            return res.json(apiResult.msg); // 반환되며 에러 발생하지 않음 (프로세스 중단)
        }

        // 제공된 JWT 토큰에서 사용자 메일주소 추출
        var tokenMember = jwt.verify(token, process.env.JWT_SECRET);

        // 토큰에 저장된 메일주소로 db에서 사용자 정보 조회
        var member = await db.Member.findOne({where:{email:tokenMember.email}});

        // 중요 개인정보는 프론트엔드에 제공 시 초기화하여 전달 
        member.member_password = "";

        apiResult.code = 200;
        apiResult.data = member;
        apiResult.msg = "Ok";

    } catch(err){
        apiResult.code = 500;
        apiResult.data = null;
        apiResult.msg = "failed";
    }
    res.json(apiResult);
});

// Create a new member
router.post('/entry', async(req, res, next)=>{

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
        var regEmail = await db.Member.findOne({ where: { email: memberData.email } });

        if(!regEmail) {
            // 이미 가입된 이메일이 없으면 회원가입 진행
            await db.Member.create(memberData);
            console.log('회원가입완료');
            res.json({ message: "member created" });
        } else {
            console.log('이미 가입된 메일입니다.');
        }

    }catch(error) {
        console.log(error);
        res.json({ message: "Member not create", error: error });
    }
});

// find member
// nodemailer 사용해보기
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
router.post('/modify', async (req, res, next) => {

    const memberId = req.body.member_id;

    var memberData = {
        email: req.body.email,
        member_password: req.body.password,
        name: req.body.name,
        telephone: req.body.telephone,
        birth_date: req.body.birthDate,
        edit_date: Date.now(),
        edit_member_id: 1
    };

    // members.updateOne({ member_id: 4 }, { '$set': { edit_member_id: 1, edit_date: new Date("Mon, 08 Jan 2024 06:53:25 GMT"), telephone: '010-2222-3333', name: '이름수정하기', email: 'bbb1111@naver.com' }}, {})

    try {
        var result = await db.Member.updateOne({ member_id: memberId }, { '$set': memberData }, {});
        res.json(result);
        console.log(result, '수정완료');

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Member not updated", error: error });
    }
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