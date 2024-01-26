

$("#contacts-tab").click(function () {
    fnGetFriendList();
});

// 친구 연락처 추가
$("#addFriend").click(function () {
    console.log("친구 추가 버튼 클릭");
    var friendEmail = $("#emailToAdd").val();

    // if friend email is empty then return
    if (friendEmail == "") {
        return;
    }

    // if friend email is same as my email then return
    var myEmail = curUser.email;
    if (friendEmail == myEmail) {
        return;
    }

    var friend = null;
    $.ajax({
        type: "POST",
        url: "/api/member/find",
        headers: {
            Authorization: `Bearer ${userToken}`,
        },
        data: {
            email: friendEmail,
        },
        dataType: "json",
        success: function (result) {
            if (result.code == 200) {
                $("#emailToAdd").val("");
                friend = result.data;
                $.ajax({
                    type: "POST",
                    url: "/api/member/add-friend",
                    headers: {
                        Authorization: `Bearer ${userToken}`,
                    },
                    data: {
                        member_id: friend.member_id
                    },
                    dataType: "json",
                    success: function (result) {
                        if (result.code == 200) {
                            alert("친구 추가 성공!");
                            fnGetFriendList();
                        } else {
                            alert("친구 추가 실패!");
                        }
                    },
                    error: function (error) {
                        console.log("친구 추가 에러: ", error);
                    },
                });
            } else {
            }
        },
        error: function (error) {
            console.log("친구 추가 에러: ", error);
        },
    });
});

// 친구 리스트 가져오기 함수
function fnGetFriendList() {
    $(".contacts-list").html("");
	// 내 정보 호출
	$.ajax({
		type: "GET",
		url: "/api/member/profile",
		headers: {
			Authorization: `Bearer ${userToken}`,
		},
		dataType: "json",
		success: function (result) {
			if (result.code == 200) {
				var user = result.data;
                // 파라미터: member_id, name, channel_type, channel_limit
				var myTag = `<li onClick="fnChatEntry(${user.member_id}, '${user.name}', 1, 1)">
                <a href="#">
                    <div class="contacts-avatar">
                        <span class="status online"></span>
                        <img src="${user.profile_img_path}" alt="Avatar">
                    </div>
                    <div class="contacts-list-body">
                        <div class="contacts-msg">
                            <h6 class="text-truncate">${user.name}</h6>
                            <p class="text-truncate">${user.email}</p>
                        </div>
                    </div>
                    <div class="contacts-list-actions">
                        <div class="action-block">
                            <img src="img/dots.svg" alt="Actions">
                        </div>
                        <div class="action-list">
                            <span class="action-list-item">Chat User</span>
                            <span class="action-list-item">Remove User</span>
                        </div>
                    </div>
                </a>
            </li>`;
				$(".contacts-list").append(myTag);
			}
		},
		error: function (error) {
			console.log("내 정보 호출 에러: ", error);
		},
	});

	// 나를 제외한 모든 친구 리스트 호출
	$.ajax({
		type: "GET",
		url: "/api/member/contacts-list",
		headers: {
			Authorization: `Bearer ${userToken}`,
		},
		dataType: "json",
		success: function (result) {
			console.log("모든 사용자 정보 호출 결과: ", result);
			if (result.code == 200) {
				$.each(result.data, function (index, user) {
                    // user는 조회된 단일 친구 정보
                    // contact list에서 클릭된 경우에는 1대1 채팅방만을 생성
                    var channelData = {
                        channel_type: 1,
                        channel_limit: 2,
                    }
                    // 파라미터: member_id, name, channel_type, channel_limit
					var userTag = `<li onClick="fnChatEntry(${user.member_id}, '${user.name}', 1, 1)">
                    <a href="#">
                        <div class="contacts-avatar">
                            <span class="status ${user.use_state_code}"></span>
                            <img src="${user.profile_img_path}" alt="Avatar">
                        </div>
                        <div class="contacts-list-body">
                            <div class="contacts-msg">
                                <h6 class="text-truncate">${user.name}</h6>
                                <p class="text-truncate">${user.email}</p>
                            </div>
                        </div>
                        <div class="contacts-list-actions">
                            <div class="action-block">
                                <img src="img/dots.svg" alt="Actions">
                            </div>
                            <div class="action-list">
                                <span class="action-list-item">Chat User</span>
                                <span class="action-list-item">Remove User</span>
                            </div>
                        </div>
                    </a>
                </li>`;
					$(".contacts-list").append(userTag);
				});
			} else if (result.code == 400) {
				alert(result.msg);
			} else {
				alert("현재 사용자 정보 호출 실패: " + result.msg);
			}
		},
		error: function (err) {
			console.log("백엔드 API 호출 에러 발생: ", err);
		},
	});
}