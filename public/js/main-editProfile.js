
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
                $("#profile_img").attr("src", result.data.profile_img_path);
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

$("#Profileimg").change(function () {
    var formData = new FormData();
    var fileInput = document.getElementById('Profileimg');
    if (fileInput.files[0]) {
        formData.append('file', fileInput.files[0]);
    }

    // 이미지 저장 밎 multer 라우터 호출, 이미지 경로 반환
    $.ajax({
        data: formData,
        type: "POST",
        url: "/api/common/upload",
        cache: false,
        processData: false,
        contentType: false,
        success: function (result) {
            if (result.code == 200) {
                $("#profile_img").attr("src", result.data);
                imgPath = result.data;
                console.log(result.data);
            } else if (result.code == 400) {
                console.log(result.msg)
            } else {
                console.log("이미지 업로드 실패: " + result.msg);
            }
        },
        error: function (err) {
            console.log("이미지 업로드 에러 발생: ", err);
        }
    })
});

// 사용자 정보 수정
$("#saveChanges").click(function () {
    var loginUserToken = localStorage.getItem("userauthtoken");
    // 이미지 저장 밎 multer 라우터 호출, 이미지 경로 반환
    $.ajax({
        type: "POST",
        url: "/api/member/modify",
        headers: {
            Authorization: `Bearer ${loginUserToken}`
        },
        dataType: "json",
        data: {
            profile_img_path: imgPath,
            name: $("#member_name").val(),
            email: $("#email").val(),
            telephone: $("#telephone").val()
        },
        success: function (result) {
            if (result.code == 200) {
                console.log("사용자 정보 수정 성공: ", result);
                alert("사용자 정보 수정 성공");
                location.href = "/main.html";
            } else if (result.code == 400) {
                console.log(result.msg)
            } else {
                console.log("사용자 정보 수정 실패: " + result.msg);
            }
        },
        error: function (err) {
            console.log("백엔드 API 호출 에러 발생: ", err);
        }
    })
});

// 비밀번호 수정
$("#change_pwd").click(function () {
    var loginUserToken = localStorage.getItem("userauthtoken");

    $.ajax({
        type: "POST",
        url: "/api/member/password/update",
        headers: {
            Authorization: `Bearer ${loginUserToken}`
        },
        dataType: "json",
        data: {
            cur_pwd: $("#cur_pwd").val(),
            new_pwd: $("#new_pwd").val(),
            confirm_pwd: $("#confirm_pwd").val()
        },
        success: function (result) {
            if (result.code == 200) {
                console.log("비밀번호 수정 성공: ", result);
                alert("비밀번호가 수정되었습니다.");
                location.href = "/main.html";
            } else if (result.code == 400) {
                console.log(result.msg)
            } else {
                console.log("비밀번호 수정 실패: " + result.msg);
                alert(result.msg);
            }
        }
    })
});
