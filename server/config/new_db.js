const { DataSource } = require("typeorm");
const User = require("../entities/Users.js");
const List = require("../entities/Lists.js");

const AppDataSource = new DataSource({
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "me",
  password: "password",
  database: "api",
  synchronize: false,
  logging: true,
  entities: [User, List],
  migrations: ["migrations/*.js"],
  subscribers: [],
});

module.exports = AppDataSource;
