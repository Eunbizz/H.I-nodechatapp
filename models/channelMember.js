module.exports = function(sequelize, DataTypes) {
    return sequelize.define('channelMember',{
        channel_id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            comment: '채널고유번호'},
        member_id:{
            type:DataTypes.INTEGER,
            primaryKey: true,
            allowNull:false,
            comment:'회원고유번호'},
        nick_name:{
            type:DataTypes.STRING(100),
            allowNull:false,
            comment:'대화명-닉네임'},
        member_type_code:{
            type:DataTypes.TINYINT,
            allowNull:false,
            comment:'회원유형 0:일반사용자 1:관리자(방장)'},
        active_state_code:{
            type:DataTypes.TINYINT,
            allowNull:false,
            comment:'현재 접속 여부 0:미접속 1:접속중'},
        last_contact_date:{
            type:DataTypes.DATE,
            allowNull:true,
            comment:'마지막 채널 접속일시'},
        last_out_date:{
            type:DataTypes.DATE,
            allowNull:true,
            comment:'최근 채널 퇴장 일시'},
        connection_id: {
            type: DataTypes.STRING(100),
            allowNull: false,
            comment: '웹소켓 고유연결 아이디',
            },
        ip_address: {
            type: DataTypes.STRING(50),
            allowNull: false,
            comment: '사용자 IP주소',
            },
        edit_date: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: '등록일시',
            },
        edit_member_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: '수정자고유번호',
            }},
        {
        sequelize,
        tableName:'channelMember',
        timestamps:false,
        comment:'채널멤버테이블',
        indexes: [
            {
                name:'PRIMARY',
                unique:true,
                using:'BTREE',
                fields: [{name:'channel_id'}, {name:'member_id'}]
            }
        ]
    }
    )
        }
