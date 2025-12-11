/**
 * @typedef {import('typeorm').MigrationInterface} MigrationInterface
 * @typedef {import('typeorm').QueryRunner} QueryRunner
 */

/**
 * @class
 * @implements {MigrationInterface}
 */
module.exports = class AddListIndexes1765294366981 {
    name = 'AddListIndexes1765294366981'

    // npx typeorm migration:run -d config/new_db.js
    /**
     * @param {QueryRunner} queryRunner
     */
    async up(queryRunner) {
        await queryRunner.query(`CREATE INDEX "USERNAME_DATECREATED_INDEX" ON "lists" ("username", "date_created") `);
    }

    // npx typeorm migration:revert -d config/new_db.js
    /**
     * @param {QueryRunner} queryRunner
     */
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX "public"."USERNAME_DATECREATED_INDEX"`);
    }
}
