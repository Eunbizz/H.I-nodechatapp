module.exports = function (sequelize, DataTypes) {
	return sequelize.define(
		"friendship",
		{
			friendship_id: {
				type: DataTypes.INTEGER,
				primaryKey: true,
				allowNull: false,
				autoIncrement: true,
				comment: "친구관계고유번호",
			},
			member_id_1: {
				type: DataTypes.INTEGER,
				allowNull: false,
				comment: "첫 번째 멤버 고유번호",
				references: {
					model: "member",
					key: "member_id",
				},
			},
			member_id_2: {
				type: DataTypes.INTEGER,
				allowNull: false,
				comment: "두 번째 멤버 고유번호",
				references: {
					model: "member",
					key: "member_id",
				},
			},
			status: {
				type: DataTypes.TINYINT,
				allowNull: false,
				comment: "친구 요청 상태코드 0:대기, 1:수락, 2:거절",
			},
			create_date: {
				type: DataTypes.DATE,
				allowNull: false,
				comment: "등록일시",
			},
		},
		{
			sequelize,
			timestamps: false,
			comment: "친구관계테이블",
			indexes: [
				{
					name: "PRIMARY",
					unique: true,
					using: "BTREE",
					fields: [{ name: "friendship_id" }],
				},
				{
					name: "FK_member_id_1",
					using: "BTREE",
					fields: [{ name: "member_id_1" }],
				},
				{
					name: "FK_member_id_2",
					using: "BTREE",
					fields: [{ name: "member_id_2" }],
				},
			],
		}
	);
};
