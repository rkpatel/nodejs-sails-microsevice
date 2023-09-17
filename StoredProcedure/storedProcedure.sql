

DROP PROCEDURE IF EXISTS `TaskListHistory`;
DELIMITER &&
CREATE PROCEDURE `TaskListHistory`(
   IN `id` INT(11),
   IN `assignee` INT(11),
   IN `countRows` INT(11),
   IN `skipRows` INT(11),
   IN `andCondition` TEXT
   ) BEGIN
   SET
   /*add select columns*/
	
	@query = CONCAT(
	'SELECT DISTINCT 
	task.task_id,
	task_type.name as task_type, 
	task.title, task.task_status, 
	IFNULL(task.description, "") AS description, 
	task.is_group_task,
	IFNULL(task.entity_type, "") AS entity_type,
	IFNULL(task.entity_id, 0) AS entity_id, 
	task.training_employee_id, 
	task.created_date, 
	task.last_updated_date, 
	IFNULL(location.name, "") AS location_name, 
	task.is_private, task.end_date,
	task.start_date,
   task.is_scheduled, task.scheduled_interval_in_days, task.scheduled_task_end_date_interval, task.scheduled_end_date, 
	user.profile_picture_url, 
	user.profile_picture_thumbnail_url,
	(CASE WHEN task.entity_type IS NOT NULL AND task.entity_type != "" AND task.entity_id IS NOT NULL AND task.entity_id != "" THEN 1 ELSE 0 END) AS automated_task,
	CONCAT(user.first_name, " ", user.last_name) AS created_by,
	IFNULL(CONCAT(last_updated_by.first_name, " ",last_updated_by.last_name), "") AS last_updated_by,
	GROUP_CONCAT( DISTINCT CONCAT( CONCAT( task_assignee_user.first_name, " ", task_assignee_user.last_name), "-" , task_assignee.task_status, "-" , task_assignee.assigned_to) ORDER BY (CASE WHEN task_assignee.assigned_to = ',id, ' THEN 0 ELSE 1 END)) AS task_assignee,
	IF(COUNT(task_image.task_image_id) > 0, "Yes","No") AS images');
	IF assignee = 1 THEN 
	SET 
	  @query = CONCAT(
	    @query, ', IFNULL(GROUP_CONCAT(DISTINCT NULLIF(CASE WHEN 1 = 1 AND task_assignee.assigned_to = ',id, ' THEN task_assignee.task_status ELSE "" END, "")),"") AS task_assignee_status'
	  );
	END IF;
	IF assignee = 3 THEN 
	SET 
	  @query = CONCAT(
	    @query, ', IFNULL(GROUP_CONCAT(DISTINCT NULLIF(CASE WHEN 1 = 1 AND task_assignee.assigned_to = ',id, ' THEN task_assignee.task_status ELSE "" END, "")),"") AS task_assignee_status'
	  );
	END IF;
	
	/*append joins*/
	
	SET 
	@query = CONCAT(
	@query, ' FROM task
	INNER JOIN task_type ON task.task_type_id = task_type.task_type_id
	INNER JOIN task_assignee ON task.task_id = task_assignee.task_id
	INNER JOIN employee_profile ON employee_profile.employee_profile_id = task_assignee.assigned_to
	INNER JOIN masterdb.user task_assignee_user ON employee_profile.user_id = task_assignee_user.user_id
	INNER JOIN masterdb.user ON task.created_by = user.user_id
	LEFT JOIN masterdb.user last_updated_by ON task.last_updated_by = last_updated_by.user_id
	LEFT JOIN location ON task.location_id = location.location_id
	LEFT JOIN job_type ON task.job_type_id = job_type.job_type_id
	LEFT JOIN task_image ON task_image.task_id = task.task_id WHERE task.status = "Active" AND task_assignee.status = "Active" '
	);
	
	/*append and condition*/
	IF andCondition IS NOT NULL THEN 
	SET 
	  @query = CONCAT(@query, ' ', andCondition);
	END IF;
	/*append group by clause*/	
	SET @query = CONCAT(@query, ' GROUP BY task.task_id ');
	  
	/*based on assignee, add where condition and order by clause*/ 
	IF assignee = 0 THEN 
	SET @query = CONCAT(@query, ' HAVING COUNT(CASE WHEN task.assigned_by = ', id , ' THEN 1 END) > 0 ');
	SET @query = CONCAT(@query, ' ORDER BY task.task_status ASC, ');
	END IF;
	
	IF assignee = 1 THEN 
	SET @query = CONCAT(@query, ' HAVING COUNT(CASE WHEN task_assignee.assigned_to = ', id , ' THEN 1 END) > 0 ');
	SET @query = CONCAT(@query, ' ORDER BY task_assignee.task_status ASC, ');
	END IF;
	
	IF assignee = 3 THEN 
	SET @query = CONCAT(@query, ' HAVING COUNT(CASE WHEN task_assignee.assigned_to = ', id , ' THEN 1 END) > 0 ');
	SET @query = CONCAT(@query, ' ORDER BY task.task_status ASC, task.last_updated_date DESC, ');
	END IF; 
	  
	IF assignee = 2 THEN 
	SET @query = CONCAT(@query, ' HAVING count(CASE WHEN task.assigned_by= ', 
	    id, ' OR task_assignee.assigned_to IN
		(select distinct ep.employee_profile_id from employee_profile as ep
		INNER JOIN employee_location el ON ep.employee_profile_id = el.employee_profile_id
		where el.location_id IN
		((select el.location_id
		FROM employee_location el
		INNER JOIN employee_profile as ep ON el.employee_profile_id = ep.employee_profile_id
		WHERE ep.employee_profile_id= ',id, ')) ) THEN 1 END) > 0 ');
		
	SET @query = CONCAT(@query, ' ORDER BY task.task_status ASC, task.last_updated_date DESC, ');
	END IF;
	SET 
	  @query = CONCAT(@query, ' task.end_date ASC limit ', countRows);
	SET 
	  @query = CONCAT(@query, ' offset ', skipRows);
  
	/*SELECT CONCAT('myvar is ', @query);*/
	  
	PREPARE stmt FROM @query;
	EXECUTE stmt;
	DEALLOCATE PREPARE stmt;
END$$
DELIMITER ;


CREATE DEFINER = `root` @`localhost` PROCEDURE `ExportTaskList`(
   IN `id` INT(11),
   IN `assignee` INT(11),
   IN `andCondition` TEXT
) BEGIN
SET
   @query = CONCAT(
      'SELECT DISTINCT task.task_id, task_type.name as task_type, task.task_status as taskStatus, task.title, t2.task_status , task.description, task.is_group_task, task.created_date, location.name as location_name, job_type.name as job_type_name, task.end_date, task.start_date, (select CONCAT(user.first_name, " ", user.last_name)  FROM masterdb.user user, employee_profile, task y WHERE y.task_id = task.task_id AND y.assigned_by = employee_profile.employee_profile_id AND employee_profile.user_id = user.user_id ) as created_by, t2.assignees, t2.completed_date, t2.completed_by, (select GROUP_CONCAT(task_image.task_image_id SEPARATOR ",") FROM task_image WHERE task_image.task_id=task.task_id ) as task_images FROM task INNER JOIN task_type ON task.task_type_id = task_type.task_type_id LEFT JOIN task_assignee ON task.task_id = task_assignee.task_id LEFT JOIN (SELECT assigned_to, task_id, task_assignee.last_updated_date as completed_date, (select CONCAT(x.first_name, " ", x.last_name) AS name FROM masterdb.user x WHERE x.user_id = task_assignee.last_updated_by) as completed_by, task_assignee.task_status as task_status, (CONCAT(user.first_name, " ", user.last_name)) AS assignees FROM task_assignee  LEFT JOIN employee_profile ON task_assignee.assigned_to = employee_profile.employee_profile_id  LEFT JOIN masterdb.user ON employee_profile.user_id = user.user_id WHERE task_assignee.status = "Active") t2 ON t2.task_id = task.task_id LEFT JOIN employee_profile ON task_assignee.assigned_to= employee_profile.employee_profile_id LEFT JOIN masterdb.user ON employee_profile.user_id = user.user_id LEFT JOIN location ON task.location_id = location.location_id LEFT JOIN job_type ON task.job_type_id = job_type.job_type_id WHERE task.status= "Active" AND task_assignee.status = "Active" AND'
   );

if assignee = 0 then
SET
   @query = CONCAT(@query, ' task.assigned_by = ', id);

end if;

if assignee = 1 then
SET
   @query = CONCAT(@query, ' task_assignee.assigned_to = ', id);

end if;
if assignee = 3 then
SET
   @query = CONCAT(@query, ' task_assignee.assigned_to = ', id);

end if;

if assignee = 2 THEN
SET
   @query = CONCAT(@query, ' (task.assigned_by = ', id);

SET
   @query = CONCAT(@query, ' OR task_assignee.assigned_to = ', id);

SET
   @query = CONCAT(@query, ')');

end if;

if andCondition IS NOT NULL THEN
SET
   @query = CONCAT(@query, ' ', andCondition);

end if;

SET
   @query = CONCAT(
      @query,
      ' ORDER BY task.task_status ASC, task.end_date ASC'
   );

PREPARE stmt
FROM
   @query;

EXECUTE stmt;

DEALLOCATE PREPARE stmt;

END;

;


CREATE DEFINER=`1team360`@`localhost` PROCEDURE `TaskListCount`(IN `id` INT(11),
   IN `assignee` INT(11),
   IN `andCondition` TEXT)
BEGIN
SET @query = CONCAT('SELECT COUNT(DISTINCT task.task_id) TaskCount FROM task INNER JOIN task_assignee ON task.task_id = task_assignee.task_id WHERE task.status = "Active" AND task_assignee.status="Active" AND');
IF assignee = 0 THEN
   SET @query = CONCAT(@query, ' task.assigned_by = ', id);
END IF;
IF assignee = 1 THEN
   SET @query = CONCAT(@query, ' task_assignee.assigned_to = ', id );
END IF;
IF assignee = 3 THEN
   SET @query = CONCAT(@query, ' task_assignee.assigned_to = ', id );
END IF;
IF assignee =2 THEN
   SET @query = CONCAT(@query, ' (task.assigned_by = ', id );
   SET @query = CONCAT(@query, ' OR task_assignee.assigned_to  IN
			(select distinct ep.employee_profile_id from employee_profile as ep 
			INNER JOIN employee_location el ON ep.employee_profile_id = el.employee_profile_id
			where el.location_id IN 
			((select el.location_id 
			FROM employee_location el 
			 INNER JOIN employee_profile as ep ON el.employee_profile_id = ep.employee_profile_id
			 WHERE  ep.employee_profile_id= ', id );
   SET @query = CONCAT(@query, ')) AND ep.status = "Active") )');
END IF;
IF andCondition IS NOT NULL THEN
   SET @query = CONCAT(@query, ' ', andCondition);
END IF;
    PREPARE stmt FROM @query;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END



DELIMITER ;;
CREATE PROCEDURE `GroupActivityList`(IN `countRows` INT, IN `skipRows` INT,  IN `andCondition` TEXT,IN `sortColumn` TEXT) NOT DETERMINISTIC NO SQL SQL SECURITY DEFINER BEGIN 
SET @query = CONCAT('SELECT DISTINCT GA.group_activity_id, GA.day, GA.scenario, (select GROUP_CONCAT(CONCAT(job_type.color,"|", job_type.name) SEPARATOR ",") FROM job_type JOIN group_activity_job_type ON   job_type.job_type_id=group_activity_job_type.job_type_id WHERE group_activity_job_type.group_activity_id = GA.group_activity_id  ) as job_type, (select GROUP_CONCAT(location.name SEPARATOR ",") FROM location JOIN group_activity_location ON   location.location_id=group_activity_location.location_id WHERE group_activity_location.group_activity_id = GA.group_activity_id  ) as location, (select GROUP_CONCAT(training.name SEPARATOR ",") FROM training JOIN group_activity_training ON training.training_id = group_activity_training.training_id WHERE group_activity_training.group_activity_id = GA.group_activity_id  ) as training, (select GROUP_CONCAT(employee_profile.employee_profile_id SEPARATOR ",") FROM employee_profile JOIN group_activity_employee ON employee_profile.employee_profile_id = group_activity_employee.employee_profile_id WHERE group_activity_employee.group_activity_id = GA.group_activity_id  ) as employee_profile, CONCAT(user.first_name, " ", user.last_name) AS created_by, GA.created_date, (SELECT Count(employee_profile.employee_profile_id) FROM employee_profile JOIN group_activity_employee ON employee_profile.employee_profile_id = group_activity_employee.employee_profile_id WHERE group_activity_employee.group_activity_id = GA.group_activity_id) as participants FROM group_activity as GA JOIN group_activity_training ON GA.group_activity_id = group_activity_training.group_activity_id LEFT JOIN group_activity_location ON GA.group_activity_id = group_activity_location.group_activity_id LEFT JOIN group_activity_job_type ON Ga.group_activity_id = group_activity_job_type.group_activity_id INNER JOIN group_activity_employee ON GA.group_activity_id = group_activity_employee.group_activity_id INNER JOIN masterdb.user ON GA.created_by = user.user_id WHERE GA.status = "Active" ');
if andCondition IS NOT NULL THEN
   SET @query = CONCAT(@query, ' ', andCondition);
end if;
SET @query = CONCAT(@query, ' ORDER BY ',sortColumn);
SET @query = CONCAT(@query, ' limit ', countRows);
SET @query = CONCAT(@query, ' offset ', skipRows);
    PREPARE stmt FROM @query;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END;;


DELIMITER ;;
CREATE PROCEDURE `GroupActivityCount`(IN `andCondition` TEXT) NOT DETERMINISTIC NO SQL SQL SECURITY DEFINER BEGIN 
SET @query = CONCAT('SELECT DISTINCT COUNT(DISTINCT GA.group_activity_id) AS group_activity_count FROM group_activity as GA JOIN group_activity_training ON GA.group_activity_id = group_activity_training.group_activity_id LEFT JOIN group_activity_location ON GA.group_activity_id = group_activity_location.group_activity_id LEFT JOIN group_activity_job_type ON Ga.group_activity_id = group_activity_job_type.group_activity_id INNER JOIN group_activity_employee ON GA.group_activity_id = group_activity_employee.group_activity_id INNER JOIN masterdb.user ON GA.created_by = user.user_id WHERE GA.status = "Active" ');
if andCondition IS NOT NULL THEN
   SET @query = CONCAT(@query, ' ', andCondition);
end if;
SET @query = CONCAT(@query, ' ORDER BY GA.created_date DESC');
    PREPARE stmt FROM @query;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END;;

DROP PROCEDURE IF EXISTS `TaskListCount`;
DELIMITER ;;
CREATE DEFINER=`synmysqladmin`@`%` PROCEDURE `TaskListCount`(IN `id` INT(11),
   IN `assignee` INT(11),
   IN `andCondition` TEXT)
BEGIN
SET @query = CONCAT('SELECT DISTINCT task.task_id FROM task INNER JOIN task_type ON task.task_type_id = task_type.task_type_id INNER JOIN task_assignee ON task.task_id = task_assignee.task_id LEFT JOIN  masterdb.user ON task.created_by = user.user_id LEFT JOIN location ON task.location_id = location.location_id LEFT JOIN job_type ON task.job_type_id = job_type.job_type_id WHERE task.status = "Active" AND task_assignee.status="Active" AND');
if assignee = 0 then
   SET @query = CONCAT(@query, ' task.assigned_by = ', id);
end if;
if assignee = 1 then
   SET @query = CONCAT(@query, ' task_assignee.assigned_to = ', id );
end if;
if assignee = 3 then
   SET @query = CONCAT(@query, ' task_assignee.assigned_to = ', id );
end if;
if assignee =2 THEN
   SET @query = CONCAT(@query, ' (task.assigned_by = ', id );
   SET @query = CONCAT(@query, ' OR task_assignee.assigned_to  IN
			(select distinct ep1.employee_profile_id from employee_profile as ep1 
			INNER JOIN employee_location el1 ON ep1.employee_profile_id = el1.employee_profile_id
			INNER JOIN location ON el1.location_id = location.location_id 
			where el1.location_id IN 
			((select y.location_id 
			FROM location y INNER JOIN  employee_location el ON y.location_id = el.location_id
			INNER JOIN employee_profile as ep ON el.employee_profile_id = ep.employee_profile_id
			 WHERE  ep.employee_profile_id= ', id );
   SET @query = CONCAT(@query, ')) AND ep1.status = "Active" AND location.status = "Active") )');
end if;
if andCondition IS NOT NULL THEN
   SET @query = CONCAT(@query, ' ', andCondition);
end if;
    PREPARE stmt FROM @query;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END;;

DROP PROCEDURE IF EXISTS `ExportTaskList`;
DELIMITER ;;
CREATE DEFINER=`synmysqladmin`@`%` PROCEDURE `ExportTaskList`(
   IN `id` INT(11),
   IN `assignee` INT(11),
   IN `andCondition` TEXT
)
BEGIN
SET
   @query = CONCAT(
      'SELECT DISTINCT task.task_id, task_type.name as task_type, task.task_status as taskStatus, task.title, t2.task_status , task.description, task.is_group_task, task.created_date, location.name as location_name, job_type.name as job_type_name, task.end_date, task.start_date, (select  CONCAT(user.first_name, " ", user.last_name)  FROM masterdb.user user, 
employee_profile, task y WHERE y.task_id = task.task_id AND y.assigned_by = 
employee_profile.employee_profile_id AND employee_profile.user_id = user.user_id) as created_by, t2.assignees, t2.completed_date, t2.completed_by, (select GROUP_CONCAT(task_image.task_image_id SEPARATOR ",") FROM task_image WHERE task_image.task_id=task.task_id ) as task_images FROM task INNER JOIN task_type ON task.task_type_id = task_type.task_type_id LEFT JOIN task_assignee ON task.task_id = task_assignee.task_id LEFT JOIN (SELECT assigned_to, task_id, task_assignee.last_updated_date as completed_date, (select CONCAT(x.first_name, " ", x.last_name) AS name FROM masterdb.user x WHERE x.user_id = task_assignee.last_updated_by) as completed_by, task_assignee.task_status as task_status, (CONCAT(user.first_name, " ", user.last_name)) AS assignees FROM task_assignee  LEFT JOIN employee_profile ON task_assignee.assigned_to = employee_profile.employee_profile_id  LEFT JOIN masterdb.user ON employee_profile.user_id = user.user_id WHERE task_assignee.status = "Active") t2 ON t2.task_id = task.task_id LEFT JOIN employee_profile ON task_assignee.assigned_to= employee_profile.employee_profile_id LEFT JOIN masterdb.user ON employee_profile.user_id = user.user_id LEFT JOIN location ON task.location_id = location.location_id LEFT JOIN job_type ON task.job_type_id = job_type.job_type_id WHERE task.status= "Active" AND task_assignee.status = "Active" AND'
   );

if assignee = 0 then
SET
   @query = CONCAT(@query, ' task.assigned_by = ', id);

end if;

if assignee = 1 then
SET
   @query = CONCAT(@query, ' task_assignee.assigned_to = ', id);

end if;

if assignee = 2 THEN
SET
   @query = CONCAT(@query, ' (task.assigned_by = ', id);

SET
   @query = CONCAT(@query, ' OR task_assignee.assigned_to  IN
			(select distinct ep1.employee_profile_id from employee_profile as ep1 
			INNER JOIN employee_location el1 ON ep1.employee_profile_id = el1.employee_profile_id
			INNER JOIN location ON el1.location_id = location.location_id 
			where el1.location_id IN 
			((select y.location_id 
			FROM location y INNER JOIN  employee_location el ON y.location_id = el.location_id
			INNER JOIN employee_profile as ep ON el.employee_profile_id = ep.employee_profile_id
			 WHERE  ep.employee_profile_id= ', id);

SET
   @query = CONCAT(@query, ')) AND ep1.status = "Active" AND location.status = "Active") )');

end if;

if andCondition IS NOT NULL THEN
SET
   @query = CONCAT(@query, ' ', andCondition);

end if;
SET
   @query = CONCAT(
      @query,
      ' ORDER BY task.task_status ASC, task.end_date ASC'
   );

PREPARE stmt
FROM
   @query;

EXECUTE stmt;

DEALLOCATE PREPARE stmt;

END;;