$("#contacts-tab").click(function() {
  var loginUserToken = localStorage.getItem("userauthtoken");

  console.log(loginUserToken);
  $.ajax({
    type: "GET",
    url: "/api/member/all",
    headers: {
      authorization: `Bearer ${loginUserToken}`,
    },
    dataType: "json",
    success: function(result) {
      console.log("모든 사용자 정보 호출결과:", result);

      if(result.code == 200) {
        // 초기화
        $(".contacts-list").html("");

        $.each(result.data, function(index, user) {
          var userTag = 
          `<li onclick="fnChatEntry(${user.member_id}, '${user.name}', 1);">
            <a href="#">
              <div class="contacts-avatar">
                <span class="status busy"></span>
                <img src="img/user3.png" alt="Avatar">
              </div>
              <div class="contacts-list-body">
                <div class="contacts-msg">
                  <h6 class="text-truncate">Aiden Chavez</h6>
                  <p class="text-truncate">IOS Developer</p>
                </div>
              </div>
              <div class="contacts-list-actions">
                <div class="action-block">
                  <img src="img/dots.svg" alt="Actions">
                </div>
                <div class="action-list">
                  <span class="action-list-item">Block User</span>
                  <span class="action-list-item">Remove User</span>
                </div>
              </div>
            </a>
          </li>`;

          $(".contacts-list").append(userTag);
        })
      }else {
        if (result.code == 400) {
          alert(result.code);
        }  
      }
    },
    error: function (err) {
      console.log("백엔드 API호출 에러발생:", err);
    },
  })
});

// 선택 사용자별 채팅방 입장처리
function fnChatEntry(memberId, nickName, channelType) {
  console.log("선택 사용자 정보:", memberId, nickName);

  // 입장처리
  var channel = {
    channelType,  // 채널타입(1:일대일, 2:그룹)
    channelId: 0, // 0:일대일, 0이상:그룹
    token: localStorage.getItem("userauthtoken"),
    targetMemberId: memberId,
    targetNickName: nickName
  };

  // entryChannel socket 채팅방 입장
  socket.emit("entryChannel", channel);

  // 채팅 화면 UI 표시하기
  $(".empty-chat-screen").addClass("d-none");
  $(".chat-content-wrapper").removeClass("d-none");
}

// 서버소켓으로 메시지 보내기
$("#btnSend").click(function() {
  // 현재 접속한 채널 고유번호 조회
  var channelId = currentChannel.channel_id;

  // 현재 접속자 대화명 조회
  var memberId = currentUser.member_id;
  var nickName = currentUser.name;
  var profile = currentUser.profile_img_path;

  // 입력 메시지 조회
  var message = $("#txtMessage").val();

  // 서버로 그룹 메시지 발송
  socket.emit("channelMsg", channelId, memberId, nickName, profile, message);
});

//서버에서 보내준 메시시 수신 처리하기
socket.on("receiveTest", function (nickName, msg, sendDate) {
  var msgTag =
    currentUser.name == nickName
      ? `<li class='chat-right'>
          <div class="chat-text-wrapper">
            <div class='chat-text'>
              <p>${msg}</p>
              <div class='chat-hour read'>${sendDate} <span>&#10003;</span></div>
            </div>
          </div>
          <div class='chat-avatar'>
            <img src="img/user24.png" alt="Quick Chat Admin" />
            <div class='chat-name'>${nickName}</div>
          </div>
        </li>`
      : `<li class='chat-left'>
          <div class='chat-avatar'>
            <img src="img/user21.png" alt="Quick Chat Admin" />
            <div class='chat-name'>${nickName}</div>
          </div>
          <div class="chat-text-wrapper">
            <div class='chat-text'>
              <p>${msg}</p>
              <div class='chat-hour read'>${sendDate} <span>&#10003;</span></div>
            </div>
          </div>
        </li>`;

  //채팅 메시지 템플릿 추가
  $("#chatHistory").append(msgTag);

  //채팅영역 맨 하단으로 스크롤 이동처리
  chatScrollToBottom();
});

//채팅방 입장완료 메시지 수신기 정의 기능구현
socket.on("entryok", function (msg, nickName, channelData) {
  console.log("현재 접속중인 채널 정보 수신:", channelData);
  //현재 접속한  채널정보  전역변수에 저장하기
  currentChannel = channelData;

  var msgTag = `<li class="divider">${msg}</li>`;

  //채팅 메시지 템플릿 추가
  $("#chatHistory").append(msgTag);

  //채팅영역 맨 하단으로 스크롤 이동처리
  chatScrollToBottom();
});

//채팅방 메시시 수신 처리하기
socket.on("receiveChannelMsg", function (nickName, profile, msg, sendDate) {
  var msgTag =
    currentUser.name == nickName
      ? `<li class='chat-right'>
									<div class="chat-text-wrapper">
										<div class='chat-text'>
											<p>${msg}</p>
											<div class='chat-hour read'>${sendDate} <span>&#10003;</span></div>
										</div>
									</div>
									<div class='chat-avatar'>
										<img src="${profile}" alt="Quick Chat Admin" />
										<div class='chat-name'>${nickName}</div>
									</div>
								</li>`
      : `<li class='chat-left'>
									<div class='chat-avatar'>
										<img src="${profile}" alt="Quick Chat Admin" />
										<div class='chat-name'>${nickName}</div>
									</div>
									<div class="chat-text-wrapper">
										<div class='chat-text'>
											<p>${msg}</p>
											<div class='chat-hour read'>${sendDate} <span>&#10003;</span></div>
										</div>
									</div>
								</li>`;

  //채팅 메시지 템플릿 추가
  $("#chatHistory").append(msgTag);

  //채팅영역 맨 하단으로 스크롤 이동처리
  chatScrollToBottom();
});

//채팅영역 스크롤 최하단 이동시키기
function chatScrollToBottom() {
  $("#chatScroll").scrollTop($("#chatScroll")[0].scrollHeight);
}

//환경설정 아이콘 클릭시 백엔드에서 프로필정보 조회 바인딩하기
$("#settings-tab").click(function () {
  // 웹브라우저 로컬 스토리지에 저장된 사용자 인증 JWT 토큰 정보 추출하기
  var loginUserToken = localStorage.getItem("userauthtoken");

  $.ajax({
    type: "GET",
    url: "/api/member/profile",
    headers: {
      Authorization: `Bearer ${loginUserToken}`
    },
    dataType: "json",
    success: function (result) {
      console.log("현재 사용자 정보 호출 결과: ", result);
      if (result.code == 200) {
        // 프로필 정보 바인딩
        $("#email").val(result.data.email);
        $("#member_name").val(result.data.name);
        $("#telephone").val(result.data.telephone);

        // profile page의 #memberName 추가
        $("#memberName").text(result.data.name);

        // profile page의 #profile_userImg 추가
        $("#profile_img").attr("src",result.data.profile_img_path);
        $("#profile_userImg").attr("src",result.data.profile_img_path);
        
        imgPath = result.data.profile_img_path;
      } else if (result.code == 400) {
        alert(result.msg)
      } else {
        alert("현재 사용자 정보 호출 실패: " + result.msg);
      }
    },
    error: function (err) {
      console.log("백엔드 API 호출 에러 발생: ", err);
    }
  })
});