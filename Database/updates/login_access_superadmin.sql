ALTER TABLE
    `masterdb_qa`.`user`
ADD
    COLUMN `portal_access` ENUM('admin_portal', 'customer_portal') NULL DEFAULT 'customer_portal'
AFTER
    `last_updated_date`;