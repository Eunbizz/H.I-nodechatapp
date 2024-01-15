// 공통 페이지 제공(로그인, 회원가입, 암호찾기)

var express = require("express");
var router = express.Router();

var db = require("../models/index.js");
var bcrypt = require('bcryptjs');

// 로그인 웹페이지 요청 및 응답
router.get("/", async (req, res) => {
	res.render("login", { resultMsg: "", email: "", password: "", layout: "authLayout" });
});

// 로그인 처리 요청 및 응답, 로그인 완료 후 채팅 페이지 이동
router.post("/", async (req, res) => {
	try {
		// 사용자 입력 정보 추출
		var email = req.body.email;
		var member_password = req.body.password;

		// DB 조회
		var member = await db.Member.findOne({ where: { email: email } });

		var resultMsg = "";
		if (member == null) {
			resultMsg = "멤버 정보가 등록되지 않았습니다.";
		} else {
			if (member.member_password == member_password) {
				res.redirect("/chat");
			} else {
				resultMsg = "암호가 일치하지 않습니다.";
			}
		}

		if (resultMsg !== "") {
			res.render("login", { resultMsg, email, member_password, layout: "authLayout" });
		}
	} catch (err) {
		res.statusMessage(500).send("Internal Server Error");
	}
});

// 회원가입 웹페이지 요청 및 응답
router.get("/entry", async (req, res) => {
	res.render("entry.ejs", { resultMsg: "", email: "", password: "", layout: "authLayout" });
});

// 회원가입 처리 요청 및 응답, 회원가입 완료 후 로그인 페이지 이동
router.post("/entry", async (req, res) => {
	try {
		var email = req.body.email;
		var name = req.body.name;
		var member_password = req.body.member_password;
		var telephone = req.body.telephone;
		var birth_date = req.body.birth_date;
		var profile_img_path = req.body.profile_img_path;

		// 단방향 암호
		var bcryptedPassword = await bcrypt.hash(member_password, 12);

		var member = {
			email,
			name,
			member_password: bcryptedPassword,
			telephone,
			birth_date,
			profile_img_path,
			entry_type_code: 1,
			reg_member_id: 1,
			use_state_code: 1,
			reg_date: Date.now(),
		};

		await db.Member.create(member);
		res.redirect("/?registration=success");
	} catch (err) {
		res.status(500).send("Internal Server Error");
	}
});

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

// 암호 찾기 웹페이지 요청 및 응답
router.get("/find", async (req, res) => {
	res.render("find", { resultMsg: "", email: "", password: "", layout: "authLayout" });
});

// 암호찾기 처리 요청 및 응답,암호 찾기 완료 후 로그인 페이지 이동
router.post("/find", async (req, res) => {
	try {
		var email = req.body.email;

		var member = await db.Member.findOne({ where: { email: email } });
		var resultMsg = "";
		if (member.email == email) {
			res.render("reset_password", { layout: "authLayout", email, resultMsg });
		} else {
			resultMsg = "등록되지 않은 이메일입니다.";
			res.render("find", { resultMsg, email, layout: "authLayout" });
		}
	} catch (err) {
		res.status(500).send("Internal Server Error");
	}
});

router.post("/reset_password", async (req, res) => {
	var email = req.body.email;
	var member_password = req.body.member_password;
	var member = await db.Member.findOne({ where: { email: email } });
	var resultMsg = "";
	if (member.member_password == member_password) {
		resultMsg = "이전과 동일한 암호입니다.";
		res.render("reset_password", { layout: "authLayout", email, resultMsg });
	} else {
		member.member_password = member_password;
		await member.save();
		res.redirect("/");
	}
});

module.exports = router;
