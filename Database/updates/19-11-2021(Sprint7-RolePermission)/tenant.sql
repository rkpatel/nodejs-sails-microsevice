ALTER TABLE
    `permission_module` DROP COLUMN `module_id`;

ALTER TABLE
    `notification_template` DROP FOREIGN KEY `permissionId`;

ALTER TABLE
    `notification_template` DROP COLUMN `permission_id`,
    DROP INDEX `permissionId`;

ALTER TABLE
    `permission`
ADD
    COLUMN `status` ENUM('Active', 'Inactive') NULL DEFAULT 'Active'
AFTER
    `sequence`,
ADD
    COLUMN `created_by` INT NULL
AFTER
    `status`,
ADD
    COLUMN `created_date` DATETIME NULL
AFTER
    `created_by`;

ALTER TABLE
    `role_permission`
ADD
    COLUMN `status` ENUM('Active', 'Inactive') NOT NULL
AFTER
    `created_date`,
ADD
    COLUMN `last_updated_by` INT NULL DEFAULT NULL
AFTER
    `status`,
ADD
    COLUMN `last_updated_date` DATETIME NULL DEFAULT NULL
AFTER
    `last_updated_by`;

ALTER TABLE
    `role`
ADD
    COLUMN `dashboard` ENUM('Employee', 'Manager') NULL
AFTER
    `status`;

TRUNCATE TABLE `role_permission`;

TRUNCATE TABLE `permission_module`;

TRUNCATE TABLE `permission`;

INSERT INTO
    `permission_module` (
        `parent_permission_module_id`,
        `name`,
        `code`,
        `description`,
        `sequence`,
        `status`,
        `created_by`,
        `created_date`
    )
VALUES
    (
        '0',
        'Employee List',
        'Employee_List',
        'Employee List',
        '1',
        'Active',
        '1',
        '2021-09-07 10:13:36'
    );

INSERT INTO
    `permission_module` (
        `parent_permission_module_id`,
        `name`,
        `code`,
        `description`,
        `sequence`,
        `status`,
        `created_by`,
        `created_date`
    )
VALUES
    (
        '0',
        'Employee Profile',
        'Employee_Profile',
        'Employee Profile',
        '2',
        'Active',
        '1',
        '2021-09-07 10:13:36'
    );

INSERT INTO
    `permission_module` (
        `parent_permission_module_id`,
        `name`,
        `code`,
        `description`,
        `sequence`,
        `status`,
        `created_by`,
        `created_date`
    )
VALUES
    (
        '0',
        'Training & Development',
        'Training_&_Development',
        'Training & Development',
        '3',
        'Active',
        '1',
        '2021-09-07 10:13:36'
    );

INSERT INTO
    `permission_module` (
        `parent_permission_module_id`,
        `name`,
        `code`,
        `description`,
        `sequence`,
        `status`,
        `created_by`,
        `created_date`
    )
VALUES
    (
        '0',
        'Tasks',
        'Tasks',
        'Tasks',
        '4',
        'Active',
        '1',
        '2021-09-07 10:13:36'
    );

INSERT INTO
    `permission_module` (
        `parent_permission_module_id`,
        `name`,
        `code`,
        `description`,
        `sequence`,
        `status`,
        `created_by`,
        `created_date`
    )
VALUES
    (
        '0',
        'Competitions',
        'Competitions',
        'Competitions',
        '5',
        'Active',
        '1',
        '2021-09-07 10:13:36'
    );

INSERT INTO
    `permission_module` (
        `parent_permission_module_id`,
        `name`,
        `code`,
        `description`,
        `sequence`,
        `status`,
        `created_by`,
        `created_date`
    )
VALUES
    (
        '0',
        'Role Management',
        'Role_Management',
        'Role Management',
        '6',
        'Active',
        '1',
        '2021-09-07 10:13:36'
    );

INSERT INTO
    `permission_module` (
        `parent_permission_module_id`,
        `name`,
        `code`,
        `description`,
        `sequence`,
        `status`,
        `created_by`,
        `created_date`
    )
VALUES
    (
        '0',
        'Master Management',
        'Master_Management',
        'Master Management',
        '7',
        'Active',
        '1',
        '2021-09-07 10:13:36'
    );

INSERT INTO
    `permission_module` (
        `parent_permission_module_id`,
        `name`,
        `code`,
        `description`,
        `sequence`,
        `status`,
        `created_by`,
        `created_date`
    )
VALUES
    (
        '0',
        'Daily Report Configuration',
        'Daily_Report_Configuration',
        'Daily Report Configuration',
        '8',
        'Active',
        '1',
        '2021-09-07 10:13:36'
    );

INSERT INTO
    `permission_module` (
        `parent_permission_module_id`,
        `name`,
        `code`,
        `description`,
        `sequence`,
        `status`,
        `created_by`,
        `created_date`
    )
VALUES
    (
        '0',
        'Daily Report',
        'Daily_Report',
        'Daily Report',
        '9',
        'Active',
        '1',
        '2021-09-07 10:13:36'
    );

INSERT INTO
    `permission_module` (
        `parent_permission_module_id`,
        `name`,
        `code`,
        `description`,
        `sequence`,
        `status`,
        `created_by`,
        `created_date`
    )
VALUES
    (
        '0',
        'Training Report',
        'Training_Report',
        'Training Report',
        '10',
        'Active',
        '1',
        '2021-09-07 10:13:36'
    );

INSERT INTO
    `permission_module` (
        `parent_permission_module_id`,
        `name`,
        `code`,
        `description`,
        `sequence`,
        `status`,
        `created_by`,
        `created_date`
    )
VALUES
    (
        '0',
        'Point History',
        'Point_History',
        'Point History',
        '11',
        'Active',
        '1',
        '2021-09-07 10:13:36'
    );

INSERT INTO
    `permission` (
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`
    )
VALUES
    (
        '1',
        '0',
        'View Employees',
        'View_Employees',
        'Allows user to view all the employees added within the system for the locations to which logged in user is associated with.',
        '1'
    );

INSERT INTO
    `permission` (
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`
    )
VALUES
    (
        '1',
        '0',
        'View All employees - All locations',
        'View_All_employees -_All_locations',
        'Allows user to view all the employees added within the system.',
        '2'
    );

INSERT INTO
    `permission` (
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`
    )
VALUES
    (
        '1',
        '0',
        'Add Employee',
        'Add_Employee',
        'Allows user to add new employee if he has view all employees permission.',
        '3'
    );

INSERT INTO
    `permission` (
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`
    )
VALUES
    (
        '1',
        '0',
        'Bulk Import Employees',
        'Bulk_Import_Employees',
        'Allows user to add employees using bulk import feature if s/he has view all employees permission.',
        '4'
    );

INSERT INTO
    `permission` (
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`
    )
VALUES
    (
        '1',
        '0',
        'Inactivate Employee',
        'Inactivate_Employee',
        'Allows user to inactive an employee if he has view all employees permission.',
        '5'
    );

INSERT INTO
    `permission` (
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`
    )
VALUES
    (
        '1',
        '0',
        'Edit Employee',
        'Edit_Employee',
        'Allows user to edit the employee details if he has view all employees permission.',
        '6'
    );

INSERT INTO
    `permission` (
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`
    )
VALUES
    (
        '2',
        '0',
        'Edit Date of Hire',
        'Edit_Date_of_Hire',
        'Allows user to edit date of hire if s/he has edit employee permission',
        '1'
    );

INSERT INTO
    `permission` (
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`
    )
VALUES
    (
        '1',
        '0',
        'Edit Email ID',
        'Edit_Email_ID',
        'Allows user to edit email ID if s/he has edit employee permission.',
        '7'
    );

INSERT INTO
    `permission` (
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`
    )
VALUES
    (
        '1',
        '0',
        'View Employee Profile',
        'View_Employee_Profile',
        'Allows user to view employee profile if s/he has view all employees permission.',
        '8'
    );

INSERT INTO
    `permission` (
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`
    )
VALUES
    (
        '2',
        '0',
        'Add Task',
        'Add_Employee_Task',
        'Allow user to add new task on employee profile.',
        '2'
    );

INSERT INTO
    `permission` (
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`
    )
VALUES
    (
        '2',
        '0',
        'Edit Task',
        'Edit_Employee_Task',
        'Allow user to edit task on employee profile.',
        '3'
    );

INSERT INTO
    `permission` (
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`
    )
VALUES
    (
        '2',
        '0',
        'Delete Task',
        'Delete_Employee_Task',
        'Allow user to delete task on employee profile.',
        '4'
    );

INSERT INTO
    `permission` (
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`
    )
VALUES
    (
        '2',
        '0',
        'Complete Task',
        'Complete_Employee_Task',
        'Allow user to complete task on employee profile.',
        '5'
    );

INSERT INTO
    `permission` (
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`
    )
VALUES
    (
        '2',
        '0',
        'View Private Tasks',
        'View_Employee_Private_Tasks',
        'Allow user to view private task on employee profile.',
        '6'
    );

INSERT INTO
    `permission` (
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`
    )
VALUES
    (
        '2',
        '0',
        'Rate Interaction',
        'Rate_Interaction',
        'Allow user to rate interaction on employee profile.',
        '7'
    );

INSERT INTO
    `permission` (
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`
    )
VALUES
    (
        '2',
        '0',
        'View Points History',
        'View_Points_History',
        'Allow user to view points history of employee.',
        '8'
    );

INSERT INTO
    `permission` (
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`
    )
VALUES
    (
        '2',
        '0',
        'Adjust Point',
        'Adjust_Point',
        'Allow user to adjust points on employee profile.',
        '9'
    );

INSERT INTO
    `permission` (
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`
    )
VALUES
    (
        '2',
        '0',
        'View Private Notes',
        'View_Private_Notes',
        'Allow user to view private notes on employee profile.',
        '10'
    );

INSERT INTO
    `permission` (
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`
    )
VALUES
    (
        '2',
        '0',
        'Add Note',
        'Add_Note',
        'Allow user to add new note on employee profile.',
        '11'
    );

INSERT INTO
    `permission` (
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`
    )
VALUES
    (
        '2',
        '0',
        'Remove Note',
        'Remove_Note',
        'Allow user to remove note from employee profile.',
        '12'
    );

INSERT INTO
    `permission` (
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`
    )
VALUES
    (
        '2',
        '0',
        'Add Certificate',
        'Add_Certificate',
        'Allow user to add certificate on employee profile.',
        '13'
    );

INSERT INTO
    `permission` (
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`
    )
VALUES
    (
        '2',
        '0',
        'Assign Certificate',
        'Assign_Certificate',
        'Allow user to assign certificate on employee profile.',
        '14'
    );

INSERT INTO
    `permission` (
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`
    )
VALUES
    (
        '2',
        '0',
        'Review Certificate',
        'Review_Certificate',
        'Allow user to review certificate on employee profile.',
        '15'
    );

INSERT INTO
    `permission` (
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`
    )
VALUES
    (
        '2',
        '0',
        'Edit Certificate',
        'Edit_Certificate',
        'Allow user to edit certificate on employee profile.',
        '16'
    );

INSERT INTO
    `permission` (
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`
    )
VALUES
    (
        '2',
        '0',
        'Delete Certificate',
        'Delete_Certificate',
        'Allow user to delete certificate on employee profile.',
        '17'
    );

INSERT INTO
    `permission` (
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`
    )
VALUES
    (
        '2',
        '0',
        'Edit Assigned Certificate',
        'Edit_Assigned_Certificate',
        'Allow user to edit assigned certificate on employee profile if s/he has assign certificate permission.',
        '18'
    );

INSERT INTO
    `permission` (
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`
    )
VALUES
    (
        '2',
        '0',
        'Add Training',
        'Add_Training',
        'Allow user to add training on employee profile.',
        '19'
    );

INSERT INTO
    `permission` (
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`
    )
VALUES
    (
        '2',
        '0',
        'Retest Training',
        'Retest_Training',
        'Allow user to retest training on employee profile.',
        '20'
    );

INSERT INTO
    `permission` (
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`
    )
VALUES
    (
        '2',
        '0',
        'Delete Training',
        'Delete_Training',
        'Allow user to delete training on employee profile.',
        '21'
    );

INSERT INTO
    `permission` (
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`
    )
VALUES
    (
        '3',
        '0',
        'View Training & Developments History',
        'View_Training&Developments_History',
        'Allows user to view training & development history within the system.',
        '1'
    );

INSERT INTO
    `permission` (
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`
    )
VALUES
    (
        '3',
        '0',
        'Conduct Group Activity',
        'Conduct_Group_Activity',
        'Allows user to conduct group activity if s/he has permission to view training & development history.',
        '2'
    );

INSERT INTO
    `permission` (
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`
    )
VALUES
    (
        '3',
        '0',
        'Delete Group Activity',
        'Delete_Group_Activity',
        'Allows user to delete group activity if s/he has permission to view training & development history.',
        '3'
    );

INSERT INTO
    `permission` (
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`
    )
VALUES
    (
        '3',
        '0',
        'Save Scenario',
        'Save_Scenario',
        'Allow user to save scenario while conducting group activity.',
        '4'
    );

INSERT INTO
    `permission` (
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`
    )
VALUES
    (
        '4',
        '0',
        'Access Task History',
        'Access_Task_History',
        'Allows user to view Tasks menu item if s/he has access task history permission.',
        '1'
    );

INSERT INTO
    `permission` (
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`
    )
VALUES
    (
        '4',
        '0',
        'View All Tasks',
        'View_All_Tasks',
        'Allows user to view all tasks if s/he has access task history permission.',
        '2'
    );

INSERT INTO
    `permission` (
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`
    )
VALUES
    (
        '4',
        '0',
        'Add Tasks',
        'Add_Task',
        'Allows user to add task if s/he has access task history permission.',
        '3'
    );

INSERT INTO
    `permission` (
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`
    )
VALUES
    (
        '4',
        '0',
        'Edit Task',
        'Edit_Task',
        'Allows user to edit task if s/he has access task history permission.',
        '4'
    );

INSERT INTO
    `permission` (
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`
    )
VALUES
    (
        '4',
        '0',
        'Delete Task ',
        'Delete_Task ',
        'Allows user to delete task if s/he has access task history permission.',
        '5'
    );

INSERT INTO
    `permission` (
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`
    )
VALUES
    (
        '4',
        '0',
        'Complete Task',
        'Complete_Task',
        'Allows user to complete task if s/he has access task history permission.',
        '6'
    );

INSERT INTO
    `permission` (
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`
    )
VALUES
    (
        '4',
        '0',
        'View Task Image',
        'View_Task_Image',
        'Allows user to view task image if s/he has access task history permission.',
        '7'
    );

INSERT INTO
    `permission` (
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`
    )
VALUES
    (
        '4',
        '0',
        'View Private Tasks',
        'View_Private_Tasks',
        'Allows user to view private task if s/he has access task history permission.',
        '8'
    );

INSERT INTO
    `permission` (
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`
    )
VALUES
    (
        '4',
        '0',
        'Export Excel Task',
        'Export_Excel_Task',
        'Allows user to export task excel if s/he has access task history permission.',
        '9'
    );

INSERT INTO
    `permission` (
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`
    )
VALUES
    (
        '5',
        '0',
        'View Competition History',
        'View_Competition_History',
        'Allows user to view competition history.',
        '2'
    );

INSERT INTO
    `permission` (
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`
    )
VALUES
    (
        '5',
        '0',
        'Create Competition',
        'Create_Competition',
        'Allows user to create competition if s/he has view competition history permission.',
        '3'
    );

INSERT INTO
    `permission` (
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`
    )
VALUES
    (
        '5',
        '0',
        'Edit Competition',
        'Edit_Competition',
        'Allows user to edit competition if s/he has view competition history permission.',
        '4'
    );

INSERT INTO
    `permission` (
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`
    )
VALUES
    (
        '5',
        '0',
        'Delete Competition',
        'Delete_Competition',
        'Allows user to delete competition if s/he has view competition history permission.',
        '5'
    );

INSERT INTO
    `permission` (
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`
    )
VALUES
    (
        '6',
        '0',
        'View All Roles',
        'View_All_Roles',
        'Allows user to view all the roles created within the system.',
        '1'
    );

INSERT INTO
    `permission` (
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`
    )
VALUES
    (
        '6',
        '0',
        'Add Role',
        'Add_Role',
        'Allows user to add new role if s/he has view all roles permission.',
        '2'
    );

INSERT INTO
    `permission` (
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`
    )
VALUES
    (
        '6',
        '0',
        'Edit Role',
        'Edit_Role',
        'Allows user to edit the role if s/he has view all roles permission.',
        '3'
    );

INSERT INTO
    `permission` (
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`
    )
VALUES
    (
        '6',
        '0',
        'Inactivate Role',
        'Inactivate_Role',
        'Allows user to inactivate the role if s/he has view all roles permission.',
        '4'
    );

INSERT INTO
    `permission` (
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`
    )
VALUES
    (
        '7',
        '0',
        'View System Management',
        'View_System_Management',
        'Allows user to view system management option within the system.',
        '1'
    );

INSERT INTO
    `permission` (
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`
    )
VALUES
    (
        '7',
        '0',
        'Job types Management',
        'Job_types_Management',
        'Allows user to operate job type management if s/he has view system management permission.',
        '2'
    );

INSERT INTO
    `permission` (
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`
    )
VALUES
    (
        '7',
        '0',
        'Location Management',
        'Location_Management',
        'Allows user to operate location management if s/he has view system management permission.',
        '3'
    );

INSERT INTO
    `permission` (
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`
    )
VALUES
    (
        '7',
        '0',
        'Level Management',
        'Level_Management',
        'Allows user to operate level management if s/he has view system management permission.',
        '4'
    );

INSERT INTO
    `permission` (
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`
    )
VALUES
    (
        '7',
        '0',
        'Task Type Management',
        'Task_Type_Management',
        'Allows user to operate task type management if s/he has view system management permission.',
        '5'
    );

INSERT INTO
    `permission` (
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`
    )
VALUES
    (
        '7',
        '0',
        'Certificate Type Management',
        'Certificate_Type_Management',
        'Allows user to operate certificate type management if s/he has view system management permission.',
        '6'
    );

INSERT INTO
    `permission` (
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`
    )
VALUES
    (
        '7',
        '0',
        'Note Type Management',
        'Note_Type_Management',
        'Allows user to operate note type management if s/he has view system management permission.',
        '7'
    );

INSERT INTO
    `permission` (
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`
    )
VALUES
    (
        '7',
        '0',
        'Training Management',
        'Training_Management',
        'Allows user to operate training management if s/he has view system management permission.',
        '8'
    );

INSERT INTO
    `permission` (
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`
    )
VALUES
    (
        '7',
        '0',
        'Training Category Management',
        'Training_Category_Management',
        'Allows user to operate training category management if s/he has view system management permission.',
        '9'
    );

INSERT INTO
    `permission` (
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`
    )
VALUES
    (
        '7',
        '0',
        'Interaction Factor Management',
        'Interaction_Factor_Management',
        'Allows user to operate interaction factor management if s/he has view system management permission.',
        '10'
    );

INSERT INTO
    `permission` (
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`
    )
VALUES
    (
        '8',
        '0',
        'View Configured Report List',
        'View_Configured_Report_List',
        'Allows user to view Daily report configuration menu option.',
        '1'
    );

INSERT INTO
    `permission` (
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`
    )
VALUES
    (
        '8',
        '0',
        'Create Report',
        'Create_Report',
        'Allows user to create report if s/he has view configured report list permission.',
        '2'
    );

INSERT INTO
    `permission` (
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`
    )
VALUES
    (
        '8',
        '0',
        'Edit Report',
        'Edit_Report',
        'Allows user to edit report if s/he has view configured report list permission.',
        '3'
    );

INSERT INTO
    `permission` (
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`
    )
VALUES
    (
        '8',
        '0',
        'Inactivate Report',
        'Inactivate_Report',
        'Allows user to inactivate report if s/he has view configured report list permission.',
        '4'
    );

INSERT INTO
    `permission` (
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`
    )
VALUES
    (
        '8',
        '0',
        'Clone Report',
        'Clone_Report',
        'Allows user to clone report if s/he has view configured report list permission.',
        '5'
    );

INSERT INTO
    `permission` (
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`
    )
VALUES
    (
        '9',
        '0',
        'Receive Daily Report Digest',
        'Receive_Daily_Report_Digest',
        'Allows user to receive daily report digest over email.',
        '1'
    );

INSERT INTO
    `permission` (
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`
    )
VALUES
    (
        '9',
        '0',
        'View Assigned Reports',
        'View_Assigned_Reports',
        'Allows user to view assigned report for the location.',
        '2'
    );

INSERT INTO
    `permission` (
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`
    )
VALUES
    (
        '9',
        '0',
        'Submit Daily Report',
        'Submit_Daily_Report',
        'Allows user to submit report if s/he has view assigned reports permission.',
        '3'
    );

INSERT INTO
    `permission` (
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`
    )
VALUES
    (
        '9',
        '0',
        'View Report History',
        'View_Report_History',
        'Allows user to view reports that are submitted.',
        '4'
    );

INSERT INTO
    `permission` (
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`
    )
VALUES
    (
        '10',
        '0',
        'Training List',
        'Training_List',
        'Allows user to view training report menu option within the system.',
        '1'
    );

INSERT INTO
    `permission` (
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`
    )
VALUES
    (
        '10',
        '0',
        'Export Excel Training',
        'Export_Excel_Training',
        'Allows user to export excel if s/he has Training Report permission.',
        '2'
    );

INSERT INTO
    `permission` (
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`
    )
VALUES
    (
        '11',
        '0',
        'View Points History - All Employee',
        'View_Points_History-All_Employee',
        'Allows user to view points history menu option within the system.',
        '1'
    );

INSERT INTO
    `permission` (
        `permission_module_id`,
        `parent_permission_id`,
        `name`,
        `code`,
        `description`,
        `sequence`
    )
VALUES
    (
        '5',
        '0',
        'View Competition Dashboard',
        'View_Competition_Dashboard',
        'Allows user to view competition history on Dashboard.',
        '1'
    );
INSERT INTO `permission` (`permission_id`, `permission_module_id`, `parent_permission_id`, `name`, `code`, `description`, `sequence`, `status`) VALUES ('74', '7', '51', 'Manage Company Account', 'Manage_company_account', 'Allow user to view the company account page and make required changes. ', '11', 'Active');
INSERT INTO `permission` (`permission_id`, `permission_module_id`, `parent_permission_id`, `name`, `code`, `description`, `sequence`, `status`) VALUES ('75', '7', '51', 'Manage Configurations', 'Manage_configurations', 'Allow user to view the configurations menu item within the main menu and make required changes.', '12', 'Active');





UPDATE
    `permission`
SET
    `parent_permission_id` = '70'
WHERE
    (`permission_id` = '71');

UPDATE
    `permission`
SET
    `parent_permission_id` = '67'
WHERE
    (`permission_id` = '68');

UPDATE
    `permission`
SET
    `parent_permission_id` = '61'
WHERE
    (`permission_id` = '62');

UPDATE
    `permission`
SET
    `parent_permission_id` = '61'
WHERE
    (`permission_id` = '63');

UPDATE
    `permission`
SET
    `parent_permission_id` = '61'
WHERE
    (`permission_id` = '64');

UPDATE
    `permission`
SET
    `parent_permission_id` = '61'
WHERE
    (`permission_id` = '65');

UPDATE
    `permission`
SET
    `parent_permission_id` = '51'
WHERE
    (`permission_id` = '52');

UPDATE
    `permission`
SET
    `parent_permission_id` = '51'
WHERE
    (`permission_id` = '53');

UPDATE
    `permission`
SET
    `parent_permission_id` = '51'
WHERE
    (`permission_id` = '54');

UPDATE
    `permission`
SET
    `parent_permission_id` = '51'
WHERE
    (`permission_id` = '55');

UPDATE
    `permission`
SET
    `parent_permission_id` = '51'
WHERE
    (`permission_id` = '56');

UPDATE
    `permission`
SET
    `parent_permission_id` = '51'
WHERE
    (`permission_id` = '57');

UPDATE
    `permission`
SET
    `parent_permission_id` = '51'
WHERE
    (`permission_id` = '58');

UPDATE
    `permission`
SET
    `parent_permission_id` = '51'
WHERE
    (`permission_id` = '59');

UPDATE
    `permission`
SET
    `parent_permission_id` = '51'
WHERE
    (`permission_id` = '60');

UPDATE
    `permission`
SET
    `parent_permission_id` = '47'
WHERE
    (`permission_id` = '48');

UPDATE
    `permission`
SET
    `parent_permission_id` = '47'
WHERE
    (`permission_id` = '49');

UPDATE
    `permission`
SET
    `parent_permission_id` = '47'
WHERE
    (`permission_id` = '50');

UPDATE
    `permission`
SET
    `parent_permission_id` = '43'
WHERE
    (`permission_id` = '44');

UPDATE
    `permission`
SET
    `parent_permission_id` = '43'
WHERE
    (`permission_id` = '45');

UPDATE
    `permission`
SET
    `parent_permission_id` = '34'
WHERE
    (`permission_id` = '36');

UPDATE
    `permission`
SET
    `parent_permission_id` = '34'
WHERE
    (`permission_id` = '37');

UPDATE
    `permission`
SET
    `parent_permission_id` = '34'
WHERE
    (`permission_id` = '38');

UPDATE
    `permission`
SET
    `parent_permission_id` = '34'
WHERE
    (`permission_id` = '39');

UPDATE
    `permission`
SET
    `parent_permission_id` = '34'
WHERE
    (`permission_id` = '40');

UPDATE
    `permission`
SET
    `parent_permission_id` = '34'
WHERE
    (`permission_id` = '41');

UPDATE
    `permission`
SET
    `parent_permission_id` = '34'
WHERE
    (`permission_id` = '42');

UPDATE
    `permission`
SET
    `parent_permission_id` = '31'
WHERE
    (`permission_id` = '33');

UPDATE
    `permission`
SET
    `parent_permission_id` = '30'
WHERE
    (`permission_id` = '31');

UPDATE
    `permission`
SET
    `parent_permission_id` = '30'
WHERE
    (`permission_id` = '32');

UPDATE
    `permission`
SET
    `parent_permission_id` = '22'
WHERE
    (`permission_id` = '26');

UPDATE
    `permission`
SET
    `parent_permission_id` = '1'
WHERE
    (`permission_id` = '9');

UPDATE
    `permission`
SET
    `parent_permission_id` = '6'
WHERE
    (`permission_id` = '7');

UPDATE
    `permission`
SET
    `parent_permission_id` = '6'
WHERE
    (`permission_id` = '8');

UPDATE
    `permission`
SET
    `parent_permission_id` = '1'
WHERE
    (`permission_id` = '2');

UPDATE
    `permission`
SET
    `parent_permission_id` = '1'
WHERE
    (`permission_id` = '3');

UPDATE
    `permission`
SET
    `parent_permission_id` = '1'
WHERE
    (`permission_id` = '4');

UPDATE
    `permission`
SET
    `parent_permission_id` = '1'
WHERE
    (`permission_id` = '5');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('1', '1', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('1', '2', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('1', '3', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('1', '4', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('1', '5', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('1', '6', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('1', '7', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('1', '8', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('1', '9', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('1', '10', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('1', '11', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('1', '12', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('1', '13', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('1', '14', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('1', '15', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('1', '16', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('1', '17', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('1', '18', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('1', '19', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('1', '20', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('1', '21', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('1', '22', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('1', '23', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('1', '24', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('1', '25', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('1', '26', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('1', '27', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('1', '28', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('1', '29', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('1', '30', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('1', '31', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('1', '32', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('1', '33', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('1', '34', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('1', '35', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('1', '36', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('1', '37', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('1', '38', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('1', '39', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('1', '40', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('1', '41', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('1', '42', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('1', '43', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('1', '44', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('1', '45', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('1', '46', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('1', '47', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('1', '48', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('1', '49', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('1', '50', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('1', '51', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('1', '52', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('1', '53', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('1', '54', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('1', '55', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('1', '56', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('1', '57', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('1', '58', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('1', '59', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('1', '60', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('1', '61', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('1', '62', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('1', '63', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('1', '64', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('1', '65', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('1', '66', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('1', '67', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('1', '68', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('1', '69', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('1', '70', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('1', '71', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('1', '72', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('1', '73', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('2', '1', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('2', '2', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('2', '3', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('2', '4', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('2', '5', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('2', '6', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('2', '7', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('2', '8', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('2', '9', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('2', '10', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('2', '11', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('2', '12', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('2', '13', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('2', '14', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('2', '15', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('2', '16', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('2', '17', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('2', '18', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('2', '19', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('2', '20', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('2', '21', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('2', '22', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('2', '23', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('2', '24', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('2', '25', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('2', '26', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('2', '27', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('2', '28', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('2', '29', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('2', '30', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('2', '31', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('2', '32', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('2', '33', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('2', '34', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('2', '35', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('2', '36', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('2', '37', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('2', '38', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('2', '39', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('2', '40', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('2', '41', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('2', '42', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('2', '43', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('2', '44', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('2', '45', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('2', '46', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('2', '47', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('2', '48', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('2', '49', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('2', '50', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('2', '51', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('2', '52', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('2', '53', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('2', '54', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('2', '55', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('2', '56', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('2', '57', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('2', '58', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('2', '59', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('2', '60', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('2', '61', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('2', '62', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('2', '63', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('2', '64', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('2', '65', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('2', '66', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('2', '67', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('2', '68', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('2', '69', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('2', '70', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('2', '71', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('2', '72', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('2', '73', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('3', '1', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('3', '2', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('3', '3', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('3', '4', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('3', '5', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('3', '6', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('3', '7', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('3', '8', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('3', '9', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('3', '10', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('3', '11', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('3', '12', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('3', '13', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('3', '14', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('3', '15', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('3', '16', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('3', '17', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('3', '18', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('3', '19', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('3', '20', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('3', '21', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('3', '22', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('3', '23', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('3', '24', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('3', '25', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('3', '26', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('3', '27', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('3', '28', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('3', '29', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('3', '30', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('3', '31', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('3', '32', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('3', '33', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('3', '34', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('3', '35', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('3', '36', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('3', '37', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('3', '38', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('3', '39', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('3', '40', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('3', '41', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('3', '42', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('3', '43', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('3', '44', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('3', '45', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('3', '46', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('3', '47', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('3', '48', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('3', '49', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('3', '50', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('3', '51', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('3', '52', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('3', '53', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('3', '54', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('3', '55', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('3', '56', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('3', '57', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('3', '58', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('3', '59', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('3', '60', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('3', '61', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('3', '62', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('3', '63', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('3', '64', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('3', '65', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('3', '66', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('3', '67', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('3', '68', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('3', '69', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('3', '70', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('3', '71', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('3', '72', '1', '2021-06-14 07:07:42', 'Active');

INSERT INTO
    `role_permission` (
        `role_id`,
        `permission_id`,
        `created_by`,
        `created_date`,
        `status`
    )
VALUES
    ('3', '73', '1', '2021-06-14 07:07:42', 'Active');

    
INSERT INTO `permission_module` (`permission_module_id`, `parent_permission_module_id`, `name`, `code`, `description`, `sequence`, `status`, `created_by`, `created_date`) VALUES ('12', '0', 'Company Account', 'Company_Account', 'Company Account', '12', 'Active', '7', '2021-09-07 10:13:36');
UPDATE `permission` SET `permission_module_id` = '12', `parent_permission_id` = '0' WHERE (`permission_id` = '74');
UPDATE `permission` SET `permission_module_id` = '12', `parent_permission_id` = '0' WHERE (`permission_id` = '75');
