const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const router = express.Router();

const MEMBERS_FILE = path.join(__dirname, '../DB/members.json'); // Correct path

async function getMembersData() {
    const data = await fs.readFile(MEMBERS_FILE, 'utf8');
    return JSON.parse(data);
}

router.get('/all', async (req, res) => {
    try {
        const members = await getMembersData();
        res.json(members);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving members", error: error });
    }
});

router.post('/create', async(req, res)=>{
    var member_id = req.body.member_id;
    var email = req.body.email
    var name = req.body.name
    var profile_img_path = req.body.profile_img_path
    var telephone = req.body.telephone
    var entry_type_code = req.body.entry_type_code
    var use_state_code = req.body.use_state_code
    var birth_date = req.body.birth_date
    var reg_date = req.body.reg_date
    var edit_date = req.body.edit_date

    var member = {
        member_id,
        email,
        name,
        profile_img_path,
        telephone,
        entry_type_code,
        use_state_code,
        birth_date,
        reg_date,
        edit_date
    };

    try {
        const members = await getMembersData();
        members.push(member);
        await fs.writeFile(MEMBERS_FILE, JSON.stringify(members, null, 2), 'utf8');
        res.json({ message: "Member created successfully", member: member });
    } catch (error) {
        res.status(500).json({ message: "Error saving the member", error: error });
    }
});

router.post('/modify', async(req, res)=>{
    res.json({ message: "Member modified" });
});

router.post('/delete', async(req, res)=>{
    res.json({ message: "Member deleted" });
});

router.get('/:mid', async (req, res) => {
    try {
        const memberId = parseInt(req.params.mid, 10);
        const members = await getMembersData();
        const member = members.find(m => m.member_id === memberId); 

        if (member) {
            res.json(member);
        } else {
            res.status(404).json({ message: "Member not found" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error retrieving the member", error: error });
    }
});

module.exports = router;
