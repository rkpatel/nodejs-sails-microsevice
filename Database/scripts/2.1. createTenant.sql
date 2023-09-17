USE masterdb;

SET @account_name = 'Synoptek';
SET @account_address = '2145 Del Dew Drive';
SET @account_email = 'customersupport@synoptek.com';
SET @ot360_admin_email = 'admin@oneteam360.com';
SET @account_configuration_code = 'System';
SET @created_by = (SELECT user_id FROM user where email = @ot360_admin_email limit 1);
SET @tenant_db_connection_string = 'mysql://synmysqladmin@ot360uat:oT360UAtsQL@2021!@ot360uat.mysql.database.azure.com/tenant_synoptek';
SET @time_zone = 'America/Los_Angeles';
SET @date_time_format = 'MM/DD/YYYY hh:mm:ss A';
SET @training_master_photos_count = '10';
SET @training_master_video_count = '10';
SET @user_email = 'synoptek.admin@mailinator.com';
SET @user_fname = 'Synoptek';
SET @user_lname = 'Admin';
SET @user_dob = '1984-09-01';
SET @user_phone = '3018915176';

--
-- Dumping data for table `account`
--

INSERT INTO `account`
(`account_guid`,
`name`,
`address`,
`onboard_status`,
`status`,
`created_by`,
`created_date`,
`email`)
VALUES
((Select uuid()),
@account_name,
@account_address,
'Completed',
'Active',
@created_by,
'2021-06-10 14:14:48',
@account_email);

--
-- Dumping data for table `account_configuration`
--
SET @account_id = (SELECT account_id FROM account WHERE name=@account_name LIMIT 1);
INSERT INTO `account_configuration`
(
`account_id`,
`name`,
`code`,
`description`,
`sequence`,
`status`,
`created_by`,
`created_date`)
VALUES
(
@account_id,
'System',
'System',
'System Configuration',
1,
'Active',
@created_by,
'2021-07-09 05:36:57');

--
-- Dumping data for table `account_configuration_detail`
--

SET @account_configuration_id = (SELECT account_configuration_id 
FROM account_configuration 
INNER JOIN account on account_configuration.account_id = account.account_id
WHERE CODE = @account_configuration_code AND account.name = @account_name LIMIT 1);

INSERT INTO `account_configuration_detail`
(`account_configuration_id`,
`name`,
`code`,
`value`,
`default_value`,
`description`,
`is_encrypted`,
`is_editable`,
`sequence`,
`status`,
`created_by`,
`created_date`)
VALUES
(
@account_configuration_id,
'DB Connection String',
'tenant_db_connection_string',
@tenant_db_connection_string,
@tenant_db_connection_string,
'String',
0,
0,
0,
'Active',
@created_by,
'2021-07-09 05:39:12');

INSERT INTO `account_configuration_detail`
(`account_configuration_id`,
`name`,
`code`,
`value`,
`default_value`,
`description`,
`is_encrypted`,
`is_editable`,
`sequence`,
`status`,
`created_by`,
`created_date`)
VALUES
(
@account_configuration_id,
'System Timezone',
'time_zone',
@time_zone,
@time_zone,
'String',
0,
0,
0,
'Active',
@created_by,
'2021-07-09 05:39:12');


INSERT INTO `account_configuration_detail`
(`account_configuration_id`,
`name`,
`code`,
`value`,
`default_value`,
`description`,
`is_encrypted`,
`is_editable`,
`sequence`,
`status`,
`created_by`,
`created_date`)
VALUES
(
@account_configuration_id,
'System Datetime format',
'date_time_format',
@date_time_format,
@date_time_format,
'String',
0,
0,
0,
'Active',
@created_by,
'2021-07-09 05:39:12');


INSERT INTO `account_configuration_detail`
(`account_configuration_id`,
`name`,
`code`,
`value`,
`default_value`,
`description`,
`is_encrypted`,
`is_editable`,
`sequence`,
`status`,
`created_by`,
`created_date`)
VALUES
(
@account_configuration_id,
'Training master max allowed photo count',
'training_master_photos_count',
@training_master_photos_count,
@training_master_photos_count,
'String',
0,
0,
0,
'Active',
@created_by,
'2021-07-09 05:39:12');


INSERT INTO `account_configuration_detail`
(`account_configuration_id`,
`name`,
`code`,
`value`,
`default_value`,
`description`,
`is_encrypted`,
`is_editable`,
`sequence`,
`status`,
`created_by`,
`created_date`)
VALUES
(
@account_configuration_id,
'Training master max allowed video count',
'training_master_video_count',
@training_master_video_count,
@training_master_video_count,
'String',
0,
0,
0,
'Active',
@created_by,
'2021-07-09 05:39:12');

--
-- Dumping data for table `account_subscription`
--

SET @subscription_plan_tier_id = (select subscription_plan_tier.subscription_plan_tier_id 
from subscription_plan_tier 
inner join subscription_plan on subscription_plan.subscription_plan_id = subscription_plan_tier.subscription_plan_id
where name = 'Platinum' limit 1);

INSERT INTO `account_subscription`
(
`subscription_plan_tier_id`,
`account_id`,
`seats_used`,
`next_payment_date`,
`stripe_account_id`,
`amount`,
`last_payment_status`,
`expiry_date`,
`status`)
VALUES
(
 @subscription_plan_tier_id,
@account_id ,
0,
'2030-04-01',
' ',
0,
'Success',
'2021-11-30 17:29:24',
'Active');

--
-- Dumping data for table `user`
--

INSERT INTO `user`
(
`email`,
`first_name`,
`last_name`,
`phone`,
`date_of_birth`,
`profile_picture_url`,
`profile_picture_thumbnail_url`,
`status`,
`created_by`,
`created_date`)
VALUES
(
@user_email,
@user_fname,
@user_lname,
@user_phone,
@user_dob,
'',
'',
'Active',
@created_by,
'2021-08-08 00:00:00');

--
-- Dumping data for table `account_user`
--

SET @user_id = (Select user_id from user where email=@user_email LIMIT 1);
INSERT INTO `account_user`
(
`account_id`,
`user_id`,
`account_owner`,
`status`,
`created_by`,
`created_date`,
`last_updated_by`,
`last_updated_date`)
VALUES
(
@account_id,
@user_id,
1,
'Active',
@created_by,
'2021-07-09 05:43:00',
@created_by,
'2021-07-09 05:43:00');
