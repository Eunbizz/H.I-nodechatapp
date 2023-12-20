// 회원 정보관리 RESTful API 전용 라우팅
// http://localhost:3000/api/member

var express = require('express');
var router = express.Router();


// Get all members
router.get('/all', async(req, res)=>{

    var members = 
    [
        {
            "member_id": 1,
            "email": "user1@example.com",
            "member_password": "1020",
            "name": "User one",
            "profile_img_path": "/images/profile1.png",
            "telephone": "010-7640-7278",
            "entry_type_code": 1,
            "use_state_code": 1,
            "birth_date": "1990-01-01",
            "reg_date": "2022-01-02",
            "reg_member_id": 1,
            "edit_date": "2022-01-02",
            "edit_member_id": 1
        },
        {
            "member_id": 2,
            "email": "user1@example.com",
            "member_password": "1020",
            "name": "User two",
            "profile_img_path": "/images/profile2.png",
            "telephone": "010-7640-7278",
            "entry_type_code": 2,
            "use_state_code": 2,
            "birth_date": "1990-01-01",
            "reg_date": "2022-01-02",
            "reg_member_id": 2,
            "edit_date": "2022-01-02",
            "edit_member_id": 2
        }
    ]
    res.json(members);
});

// Create a new member
router.post('/create', async(req, res)=>{
    // Logic to create a new member
    var email = req.body.email;
    var member_password = req.body.member_password;
    var name = req.body.name;

    var member = {
        email,
        member_password,
        name
    }
    res.json({member});
});

// Modify an existing member
router.post('/modify', async(req, res) =>{
    // Logic to modify an existing member
    res.json({ message: "member modified" });
});

// Delete a member
router.post('/delete', async(req, res) =>{
    // Logic to delete a member
    res.json({ message: "member deleted" });
});

// Get a single member by ID
router.get('/:mid', async(req, res) =>{
    var memberId = req.params.mid

    var member = {
        email:"user1@example.com",
        member_password:"1020",
        name:"eunbi"
    }
    

    res.json({ member});
});

module.exports = router;
