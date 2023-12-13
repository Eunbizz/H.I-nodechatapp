/* 
- 채팅방(채널) 데이터를 관리하는 RESTFul 라우터 파일
- 해당 라우터파일 기본주소 경로: http://localhost:3000/api/channelAPI~
- 채팅방 생성 웹피이지, 목록 페이지, 수정 페이지에 대한 웹페이지 요청 및 응답 처리담당
*/
var express = require('express');
var router = express.Router();


// DB에 저장된 모든 채널목록 데이터를 제공하는 RESTAPI 라우팅 메소드
// http://localhost:3000/api/channel/all
router.get('/all', async(req, res, next)=> {

    // DB에서 채널목록 정보를 모두 조회해왔다고 가정한다.   
    var channelList = [
        {
            channelIdx: 1,
            title: "1번째 채팅방 입니다.",
            contents: "1번째 채팅방 내용입니다.",
            view_cnt: 100,
            display: "Y",
            ipaddress: "111.111.111.111",
            registDate: Date.now(),
            registMemberId: "robin",
        },
        {
            channelIdx: 2,
            title: "2번째 채팅방 입니다.",
            contents: "2번째 채팅방 내용입니다.",
            view_cnt: 200,
            display: "Y",
            ipaddress: "222,111,111,111",
            registDate: Date.now(),
            registMemberId: "robin",
        },
    ]

    // res.json(JSON데이터);
    res.json(channelList);
});



// 단일 채널정보를 조회하는 RESTAPI 라우팅 메소드 + 쿼리스트링방식
// http://localhost:3000/api/channel?cid=1
router.get('/', async(req, res, next)=> {

    // STEP1: URL에서 채널 고유번호를 추출한다.
    var channelId = req.query.cid;


    // SPEP2: 추출된 채널고유번호를 이용해 DB의 채널테이블에서 해당 번호와 동일한 단일건의 채널정보를 조회해온다.
    var channel = {
        channelIdx: 1,
        title: "1째 채팅방 입니다.",
        contents: "1번째 채팅방 내용입니다.",
        view_cnt: 200,
        display: "Y",
        ipaddress: "111.111.111.111",
        registDate: Date.now(),
        registMemberId: "robin",
    };

    // res.json(JSON데이터);
    res.json(channel);
});



// 채널정보를 신규 등록하는 RESTAPI 라우팅메소드
// http://localhost:3000/api/channel/create
router.post('/create', async(req, res)=> {

    var channelName = req.body.channel_name;
    var channelDescription = req.body.channel_desc;


    var channel = {
        channel_name:channelName,
        channel_desc:channelDescription
    }


    res.json(channel)
})




// 기존 채널정보 데이터 수정하는 RESTAPI 라우팅메소드
// http://localhost:3000/api/channel/modify
router.post('/modify', async(req, res)=> {

})



// 기존 채널정보 데이터 삭제하는 RESTAPI 라우팅메소드
// http://localhost:3000/api/channel/delete
router.post('/delete', async(req, res)=> {

})





// 단일 채널정보를 조회하는 RESTAPI 라우팅 메소드-파라메터방식-와일드카드정의방식
// 파라메터방식/와일드카드 방식으로 정의된 라우팅 메소드는 라우터파일의 최단에 배치

// http://localhost:3000/api/channel/1
router.get('/:id', async(req, res, next)=> {

    var channelId = req.params.id;


    var channel = {
        channel_id:1, 
        channel_name:"채널1"
    };

    // res.json(JSON데이터);
    res.json(channel);
});



module.exports = router;
