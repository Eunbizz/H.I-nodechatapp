// 공통 페이지 제공(로그인, 회원가입, 암호찾기)

var express = require("express");
var router = express.Router();

var db = require("../models/index.js");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
var { tokenAuthCheck } = require("./apiMiddleware.js");
const path = require("path");
router.use(express.static(path.join(__dirname, "../public")));

router.get("/", async (req, res) => {
	res.sendFile("login.html", { root: path.join(__dirname, "../public") });
});

router.get("/main", async (req, res) => {
	res.sendFile("main.html", { root: path.join(__dirname, "../public") });
});

router.get("/signup", async (req, res) => {
	res.sendFile("signup.html", { root: path.join(__dirname, "../public") });
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

router.get("/forgot-password", async (req, res) => {
	res.sendFile("forgot-password.html", { root: path.join(__dirname, "../public") });
});

router.get("/password-init", async (req, res) => {
	var token = req.query.token;
	try {
		var tokenJsonData = await jwt.verify(token, process.env.JWT_SECRET);
	} catch (e) {
		token = "유효하지 않은 토큰입니다.";
		tokenJsonData = {
			userid: "",
			email: "",
			usertype: "",
			name: "",
			telephone: "",
		};
	}
	res.render("password-init", {
		token,
		tokenJsonData,
		layout: "authLayout",
		email: "",
		resultMsg: "",
	});
});

router.post("/password-init", tokenAuthCheck, async (req, res) => {
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
		var member_password = member.member_password;
		var new_password = req.body.member_password;

		var isPasswordMatch = await bcrypt.compare(new_password, member_password);
		if (isPasswordMatch) {
			apiResult.code = 400;
			apiResult.data = null;
			apiResult.msg = "기존 암호와 동일합니다.";
		} else {
			new_password = await bcrypt.hash(new_password, 12);
			member.member_password = new_password;
			await member.save();
			apiResult.code = 200;
			apiResult.data = null;
			apiResult.msg = "암호가 변경되었습니다.";
		}
	} catch (err) {
		res.status(500).send("Internal Server Error");
	}
	res.json(apiResult);
});

module.exports = router;
