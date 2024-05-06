
module.exports = Object.freeze({
    // 회원 테이블 사용상태 코드 - 사용중
    USE_STATE_CODE : {
        BUSY: 2,
        ONLINE : 1,
        OFFLINE : 0,
    },
    CHANNEL_TYPE_CODE : {
        GROUP : 2,
        ONE_ON_ONE : 1,
    },
    MEMBER_TYPE_CODE:{
        NORMAL : 0,
        ADMIN : 1,
    },
    ACTIVE_STATE_CODE:{
        ACTIVE : 1,
        INACTIVE : 0,
    },
    MSG_TYPE_CODE:{
        SYSTEM : 0,
        NORMAL : 1,
        FILE : 2,
    },
});