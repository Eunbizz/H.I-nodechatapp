// 회원 정보관리 RESTful API 전용 라우팅
// http://localhost:3000/api/member

var express = require('express');
var router = express.Router();

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