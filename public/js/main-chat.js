$("btnSend").click(function () {
	var channelId = currentChannel.channel_id;
});

// 채팅방 입장 완료 수신기 정의 기능
socket.on("entryok", function (msg, channelData) {
	currentChannel = channelData;
	var msgTag = `<li class="divider">${msg}</li>`;
	$("#chatHistory").append(msgTag);
	chatScrollToBottom();
});

// 채팅방 입장 처리 이벤트
socket.on("chatEntry", function (nickname) {
	var msg = `<li class="divider">${nickname}님이 입장했습니다.</li>`;
	$("#chatHistory").append(msg);
	chatScrollToBottom();
});

// 로드된 채팅방 기록 출력
socket.on("loadChatHistory", function (userInfo, msg) {
	// userInfo는 상대 사용자 정보
	$("#memberName").text(userInfo.name);
	$("#chatHistory").html("");
	$.each(msg, function (index, item) {
		// 메세지가 시스템 메세지인 경우
		if (item.msg_type_code == 0) {
			var msgTag = `<li class="divider">${item.message}</li>`;
			$("#chatHistory").append(msgTag);
		} else if (item.msg_type_code == 2) {
			// 메세지가 파일인 경우
		} else {
			// 메세지가 일반 메세지인 경우
			// 메세지가 상대방이 보낸 메세지인 경우
			if (item.member_id == userInfo.member_id) {
				var msgTag = `<li class='chat-left'>
                            <div class='chat-avatar'>
                                <img src="${userInfo.profile_img_path}" alt="Quick Chat Admin" />
                                <div class='chat-name'>${userInfo.name}</div>
                            </div>
                            <div class="chat-text-wrapper">
                                <div class='chat-text'>
                                    <p>${item.message}</p>
                                    <div class='chat-hour read'>${item.msg_date}<span>&#10003;</span></div>
                                </div>
                            </div>
                        </li>`;
				$("#chatHistory").append(msgTag);
			} else {
				// 내가 보낸 메세지인 경우
				var msgTag = `<li class='chat-right'>
                            <div class="chat-text-wrapper">
                                <div class='chat-text'>
                                    <p>${item.message}</p>
                                    <div class='chat-hour read'>${item.msg_date}<span>&#10003;</span></div>
                                </div>
                            </div>
                            <div class='chat-avatar'>
                                <img src="${curUser.profile_img_path}" alt="Quick Chat Admin" />
                                <div class='chat-name'>${curUser.name}</div>
                            </div>
                        </li>`;
				$("#chatHistory").append(msgTag);
			}
		}
	});
	chatScrollToBottom();
});

// 채팅창 스크롤 최 하단 이동
function chatScrollToBottom() {
	$("#chatScroll").scrollTop($("#chatScroll")[0].scrollHeight);
}

// 기존 채팅방 클릭시 입장 처리 이벤트 실행 함수
function fnChatEntry(member_id, name, channel_type, channel_limit) {
	channel = {
		// member는 상대 사용자 정보
		channelType: channel_type, // 1: 1:1 채팅, 2: 그룹 채팅
		channelLimit: channel_limit,
		token: curUser,
		memberId: member_id,
		memberNickname: name,
	};
	socket.emit("chatEntry", channel);
	$(".empty-chat-screen").addClass("d-none");
	$(".chat-content-wrapper").removeClass("d-none");
}
