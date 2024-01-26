const SocketIO = require("socket.io");
const moment = require("moment");
const jwt = require("jsonwebtoken");
var db = require("./models/index");
var enums = require("./common/enums");

module.exports = (server) => {
    const io = SocketIO(server, {
        path: "/socket.io",
        cors:{
            origin: "*",
            methods:["GET", "POST"]
        },
    });

    io.on("connection", async (socket) => {
        const req = socket.request;
        const socketId = socket.id;
        const userIP = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    
        // 채팅방 입장 처리 이벤트
        socket.on("chatEntry", async (channel) => {
            try{
                var curUser = channel.token;
                // 조회된 입장하는 채팅방 정보 from DB
                var channelData = {};
                var isExistFlag = true;
                // 1:1 채팅방 입장 처리
                if (channel.channelType == enums.CHANNEL_TYPE_CODE.ONE_ON_ONE) { 
                    // 채팅방 이름 설정
                    var channelName = channel.memberId < curUser.member_id 
                    ? `${channel.memberId}-${curUser.member_id}` 
                    : `${curUser.member_id}-${channel.memberId}`;

                    // 1:1 채팅방 존재 여부 확인
                    channelData = await db.Channel.findOne({
                        where:{
                            channel_name: channelName,
                            category_code: channel.channelType,
                        },
                    })

                    // 채팅방이 존재하지 않으면 채팅방 생성
                    if (channelData == null){
                        isExistFlag = false;
                        var channelInfo = {
                            community_id: 1, // 이건 뭐지?
							category_code: channel.channelType,
							channel_name: channelName,
							channel_img_path: "",
							user_limit: channel.user_limit,
							channel_state_code: 1,
							reg_date: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
							reg_member_id: curUser.member_id,
                        }
                        var registedChannel = await db.Channel.create(channelInfo);
                        channelData = registedChannel;

                        var curMember = {
                            channel_id: registedChannel.channel_id,
                            member_id: channel.memberId,
                            nick_name: channel.memberNickname,
                            member_type_code: enums.MEMBER_TYPE_CODE.NORMAL,
                            active_state_code: enums.ACTIVE_STATE_CODE.ACTIVE,
                            connection_id: socketId,
                            ip_address: userIP,
                            edit_date: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                            edit_member_id: curUser.member_id,
                        }
                        await db.ChannelMember.create(curMember);

                        if (channel.memberId != curUser.member_id){
                            var targetMember = {
                                channel_id: registedChannel.channel_id,
                                member_id: curUser.member_id,
                                nick_name: curUser.name,
                                member_type_code: enums.MEMBER_TYPE_CODE.ADMIN,
                                active_state_code: enums.ACTIVE_STATE_CODE.ACTIVE,
                                connection_id: "",
                                ip_address: "",
                                edit_date: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                                edit_member_id: curUser.member_id,
                            }
                            await db.ChannelMember.create(targetMember);
                        }
                    }
                    
                }else{ // 그룹 채팅방 입장 처리
                    
                }

                // 현재 접속자의 접속 상태와 접속 일시 정보 업데이트 처리
                var updateMember = {
                    active_state_code: enums.ACTIVE_STATE_CODE.ACTIVE,
                    last_contact_date: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                    connection_id: socketId,
                    ip_address: userIP,
                    edit_date: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
                    edit_member_id: curUser.member_id,
                }
                await db.ChannelMember.update(updateMember, {
                    where:{
                        channel_id: channelData.channel_id,
                        member_id: curUser.member_id,
                    },
                });

                // 채팅방 입장 처리 이벤트 발생
                socket.join(channelData.channel_id);
                // 채팅방에 새로 입장하는 경우에만 입장 메세지 출력
                if (!isExistFlag){
                    socket.emit("entryok",
                    `${curUser.name} 대화명으로 입장했습니다.`,
                    channelData);
                    socket.to(channelData.channel_id).emit(
                        "entryok",
                        `${curUser.name}님이 입장했습니다.`,
                        channelData
                    );
                    
                    var msgLog = {
                        channel_id: channelData.channel_id,
                        member_id: curUser.member_id,
                        name: curUser.name,
                        msg_type_code: enums.MSG_TYPE_CODE.SYSTEM,
                        msg: `${curUser.name}님이 입장했습니다.`,
                        socketId: socketId,
                        userIP: userIP,
                    }
                    await ChattingMsgLogging(msgLog);
                }

                // 채팅방 메세지 데이터 로드
                var msgList = await db.ChannelMessage.findAll({
                    where:{
                        channel_id: channelData.channel_id,
                    },
                    attributes: [
                        "channel_id",
                        "member_id",
                        "nick_name",
                        "msg_type_code",
                        "message",
                        "msg_date",
                    ],
                    order: [["msg_date", "ASC"]],
                });

                // 채팅 상대방 정보 로드
                var member = await db.Member.findOne({
                    where:{
                        member_id: channel.memberId,
                    },
                    attributes: ["member_id", "name", "profile_img_path"],
                })
                socket.emit("loadChatHistory", member, msgList);


            }catch(err){
                console.log("채팅방 입장 처리 에러 발생: ", err);
            }
        });
    });

    async function ChattingMsgLogging(msgLog) {
        var msg = {
            channel_id: msgLog.channel_id,
            member_id: msgLog.member_id,
            nick_name: msgLog.name,
            msg_type_code: msgLog.msg_type_code,
            connection_id: msgLog.socketId,
            message: msgLog.msg,
            ip_address: msgLog.userIP,
            msg_date: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
            edit_date: moment(Date.now()).format("YYYY-MM-DD HH:mm:ss"),
        };
        await db.ChannelMessage.create(msg);
    }
}