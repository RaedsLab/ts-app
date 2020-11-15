const baseOptions = {
  cli: {
    migrationsDir: `src/node/database/migrations`,
  },
  entities: [`${__dirname}/src/node/database/entities/**/*.ts`],
  host: "localhost",
  logging: false,
  migrations: [`${__dirname}/src/node/database/migrations/*.ts`],
  password: "admin",
  port: 5432,
  type: "postgres",
  username: "postgres",
  autoLoadEntities: true,
};

module.exports = [
  Object.assign({}, baseOptions, { name: "saas", database: "saas" }),
  Object.assign({}, baseOptions, {
    name: "saas_test",
    database: "saas_test",
    synchronize: true,
    logging: process.env.LOG === "1",
  }),
];
