const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "User",
  tableName: "users",

  columns: {
    id: {
      primary: true,
      type: "int",
      generated: true, // SERIAL
    },

    username: {
      type: "varchar",
      length: 50,
      unique: true,
      nullable: false,
    },

    password: {
      type: "varchar",
      length: 100,
      nullable: false,
    },
  },
  indices: [
    {
      name: "USERS_USERNAME_INDEX",
      columns: ["username"],
    },
  ],
});
