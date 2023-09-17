DROP PROCEDURE IF EXISTS `LevelUpdation`;

DELIMITER &&  
CREATE PROCEDURE LevelUpdation (
    IN `var_current_datetime` datetime
)  
BEGIN  

	DECLARE i INT DEFAULT 0;
	DECLARE var_employees_count INT DEFAULT 0;
    DECLARE var_employee_profile_id INT;
    DECLARE var_employee_points INT;
    DECLARE var_employee_level_id INT;
    DECLARE var_level_id INT;
    DECLARE var_created_by INT;
	
    SELECT COUNT(1) INTO var_employees_count FROM employee_profile where status='Active' ;
    SELECT user_id into var_created_by from masterdb.user where email='admin@oneteam360.com';
   
    DROP TABLE IF EXISTS temp_employee_point_audit;
    CREATE TABLE temp_employee_point_audit LIKE employee_point_audit;

    SET i = 0;
	WHILE i < var_employees_count DO   
		SET var_employee_profile_id = 0;
        SET var_employee_points = 0;
        SET var_level_id = NULL;
		SELECT employee_profile_id INTO var_employee_profile_id FROM employee_profile where status='Active' LIMIT i, 1;
		SELECT points INTO var_employee_points FROM employee_profile where employee_profile_id = var_employee_profile_id ;
		SELECT level_id INTO var_employee_level_id FROM employee_profile where employee_profile_id = var_employee_profile_id ;

		## GET LEVEL START
        Select level_id into var_level_id  from level where var_employee_points Between point_range_from AND point_range_to AND status = 'Active' LIMIT 1;
        ## GET LEVEL END
        
        if var_level_id IS NULL then
			if  var_employee_points <= 0 then
				Select level_id into var_level_id from level where status = "Active" ORDER BY level ASC LIMIT 1;
			else
			   Select level_id into var_level_id from level where status = "Active" ORDER BY level DESC LIMIT 1;
		   end if;
		end if;
        
        if var_level_id != var_employee_level_id THEN
			## INSERT IN EMPLOYEE_AUDIT START
			INSERT INTO `temp_employee_point_audit`
				( `employee_profile_id`,
				`reason`,
				`interaction_score`,
				`note_score`,
				`training_score`,
				`total_weighted_score`,
				`points_earned`,
				`old_points`,
				`new_points`,
				`old_level_id`,
				`new_level_id`,
				`created_by`,
				`created_date`)
				VALUES
				( var_employee_profile_id,
				"Level recalibration by user",
				0,
				0,
				0,
				0, 
				0, 
				var_employee_points,
				var_employee_points,
				var_employee_level_id,
				var_level_id,
				var_created_by, 
				var_current_datetime);
			## INSERT IN EMPLOYEE_AUDIT END
		end if;

		SET i = i + 1;
	END WHILE;
    
    BEGIN

		DECLARE EXIT HANDLER FOR SQLEXCEPTION 
		BEGIN
			  ROLLBACK;
		END;

		START TRANSACTION;
			SET SQL_SAFE_UPDATES = 0;
			
            UPDATE employee_profile SET employee_profile.level_id = (SELECT new_level_id FROM temp_employee_point_audit WHERE temp_employee_point_audit.employee_profile_id = employee_profile.employee_profile_id ORDER BY temp_employee_point_audit.employee_profile_id DESC LIMIT 1) where employee_profile.status = 'Active' AND employee_profile.employee_profile_id IN (Select employee_profile_id from temp_employee_point_audit) ;
        
			INSERT INTO employee_point_audit (employee_profile_id, reason, interaction_score, note_score, training_score, total_weighted_score, points_earned, old_points, new_points, old_level_id, new_level_id, created_by, created_date) Select employee_profile_id, reason, interaction_score, note_score, training_score, total_weighted_score, points_earned, old_points, new_points, old_level_id, new_level_id, created_by, created_date from temp_employee_point_audit;
            SET SQL_SAFE_UPDATES = 1;

		COMMIT;    
	END;
    
	DROP TABLE IF EXISTS temp_employee_point_audit;
    
END &&  
DELIMITER ; 


CALL LevelUpdation(NOW());
