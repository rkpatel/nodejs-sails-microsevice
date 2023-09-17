    SET FOREIGN_KEY_CHECKS=0;
    SET SQL_SAFE_UPDATES = 0;
    TRUNCATE `berzansky_macdonald`.`employee_certificate`;
    TRUNCATE `berzansky_macdonald`.`employee_certificate_history`;
    DELETE FROM task_assignee WHERE task_id IN (Select task_id from task where task_type_id IN (14,15));
    DELETE FROM task_image WHERE task_id IN (Select task_id from task where task_type_id IN (14,15));
    DELETE FROM task WHERE task_type_id IN (14,15);
    SET FOREIGN_KEY_CHECKS=1;
    SET SQL_SAFE_UPDATES = 1;
