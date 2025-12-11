const { EntitySchema } = require("typeorm");

module.exports = new EntitySchema({
  name: "List",
  tableName: "lists",

  columns: {
    todo_id: {
      primary: true,
      type: "int",
      generated: true, // SERIAL
    },

    username: {
      type: "varchar",
      length: 50,
      nullable: true,
    },

    content: {
      type: "varchar",
      length: 500,
      nullable: false,
    },

    date_created: {
      type: "timestamp",
      createDate: true,
      default: () => "CURRENT_TIMESTAMP",
    },

    date_completed: {
      type: "timestamp",
      nullable: true,
      default: null,
    },

    completed: {
      type: "boolean",
      default: false,
    },
  },

  relations: {
    user: {
      type: "many-to-one",
      target: "User",
      joinColumn: {
        name: "username",
        referencedColumnName: "username",
      },
      onDelete: "CASCADE",
    },
  },
  indices: [
    {
      name: "LISTS_USERNAME_INDEX",
      columns: ["username"],
    },
    {
    name: "USERNAME_COMPLETED_INDEX",
    columns: ["username", "completed"],
    },
    {
      name: "USERNAME_DATECREATED_INDEX",
      columns: ["username", "date_created"],
    }
  ],
});
