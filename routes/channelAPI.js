// 채널/채팅 정보관리 RESTful API 전용 라우팅
// http://localhost:3001/api/channel

var express = require("express");
var router = express.Router();

var db = require("../models/index");
const jwt = require('jsonwebtoken');



router.get('/all', async(req, res, next) =>{
	apiResult = {
	   code: 400,
	   data: null,
	   msg: "",
	};
 
	try{
	   var channels = await db.Channel.findAll({
		  attributes: [
			 "channel_id",
			 "channel_name",
			 "channel_img_path",
		  ],
		  where: { channel_state_code: constants.USE_STATE_CODE_USED, category_code: 2},
	   });
	   apiResult.code = 200;
	   apiResult.data = channels;
	   apiResult.msg = "ok";
	}catch(error){
	   apiResult.code = 500;
	   apiResult.data = null;
	   apiResult.msg = error.message;
	}
	res.json(apiResult);
 });


router.post('/createGroup', async(req, res, next) =>{
	apiResult = {
	   code: 400,
	   data: null,
	   msg: "",
	};
 
	try{
		var token = req.headers.authorization.split("Bearer ")[1];
		var currentUser = jwt.verify(token, process.env.JWT_SECRET);

		// 웹브라우저에서 전달된 JWT토큰문자열에서 필요한 로그인 사용자 정보를 추출한다.
		var loginMemberId = currentUser.member_id;

		var channel_name = req.body.channelName;
		var channel_img_path = req.body.channelImgPath;

		var channels = {
			community_id: 1,
			category_code: 2,
			channel_name,
			user_limit: 10,
			channel_img_path,
			channel_state_code: 1,
			reg_date: Date.now(),
			reg_member_id: loginMemberId,
		};

		registedChannel = await db.Channel.create(channels);
		channelData = registedChannel;

		var currentMember = {
			channel_id:channelData.channel_id,
			member_id:loginMemberId,
			nick_name:currentUser.name,
			member_type_code:1,
			active_state_code:0,
			connection_id:"",
			ip_address:"",
			edit_date:Date.now(),
			edit_member_id:currentUser.member_id
		};
		await db.ChannelMember.create(currentMember);

		apiResult.code = 200;
		apiResult.data = registedChannel;
		apiResult.msg = "ok";

		}catch(error){
			apiResult.code = 500;
			apiResult.data = null;
			apiResult.msg = error.message;
	}
	res.json(apiResult);
});


router.post('/channelsByMember', async(req, res, next) =>{
	apiResult = {
		code: 400,
		data: null,
		msg: "",
	 };
	try{
		var token = req.headers.authorization.split("Bearer ")[1];
		var tokenJsonData = jwt.verify(token, process.env.JWT_SECRET);

		// 웹브라우저에서 전달된 JWT토큰문자열에서 필요한 로그인 사용자 정보를 추출한다.
		var loginMemberId = tokenJsonData.member_id;

		const channels = await db.sequelize.query(`
			SELECT * FROM channel 
			WHERE channel_id IN (
				SELECT channel_id FROM channel_member 
				WHERE member_id = ${loginMemberId})
			ORDER BY channel_id DESC;`);

		apiResult.code = 200;
		apiResult.data = channels;
		apiResult.msg = "ok";

	} catch(err){
		apiResult.code = 500;
		apiResult.data = null;
		apiResult.msg = err.message;
	};
	
})

// Create a new channel
router.post("/create", async (req, res) => {
	try {
		var categoryCode = req.body.categoryCode;
		var channelName = req.body.channelName;
		var channelDesc = req.body.channelDesc;
		var channelState = req.body.channelState;
		var regMemberId = req.body.regMemberId;

		var channel = {
			category_code: categoryCode,
			channel_name: channelName,
			channel_desc: channelDesc,
			channel_state: channelState,
			reg_member_id: regMemberId,
		};

		var channel = await db.Channel.create(channel);
		res.json(channel);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

// Modify an existing channel
router.post("/modify/:id", async (req, res) => {
	try {
		var channelId = req.params.id;

		var categoryCode = req.body.categoryCode;
		var channelName = req.body.channelName;
		var channelDesc = req.body.channelDesc;
		var channelState = req.body.channelState;
		var regMemberId = req.body.regMemberId;

		// 특정 필드를 업데이트 하도록 $set
		// 특정 필드를 업데이트하거나 새로운 필드 추가할 때 사용
		var updateFields = {
			$set: {
				category_code: categoryCode,
				channel_name: channelName,
				channel_desc: channelDesc,
				channel_state: channelState,
				reg_member_id: regMemberId,
			},
		};

		var updatedChannel = await db.Channel.updateOne({ channel_id: channelId }, updateFields);

		res.json({ updatedChannel });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

// Delete a channel
router.delete("/delete/:id", async (req, res) => {
	try {
		var channelId = req.params.id;

		// deleteOne을 사용하여 채널을 삭제
		var deletedChannel = await db.Channel.deleteOne({ channel_id: channelId });

		res.json({ deletedChannel });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

// Get a single channel by ID
router.get("/:cid", async (req, res) => {
	try {
		var channelId = parseInt(req.params.cid, 10); // 10진수 정수로 변환

		var channel = await db.Channel.findOne({ where: { channel_id: channelId } });
		res.json({ channel });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Internal Server Error" });
	}
});

module.exports = router;
