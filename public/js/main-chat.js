
$("btnSend").click(function(){
    var channelId = currentChannel.channel_id;
})

// 채팅방 입장 처리 이벤트
socket.on("chatEntry", function(nickname){
    var msg = `<li class="divider">${nickname}님이 입장했습니다.</li>`;
    $("#chatHistory").append(msg);
    chatScrollToBottom();
})

// 채팅창 스크롤 최 하단 이동
function chatScrollToBottom(){
    $("#chatScroll").scrollTop($("#chatScroll")[0].scrollHeight);
}

// 기존 채팅방 클릭시 입장 처리 이벤트 실행 함수
function startChat(userInfo, channelData){
    
}