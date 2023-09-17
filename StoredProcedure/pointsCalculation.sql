DROP PROCEDURE IF EXISTS `PointsCalculation`;

DELIMITER &&  
CREATE PROCEDURE PointsCalculation(
	IN `deduct_points_for_negative_performance` BOOLEAN,
	IN `threshold_score_for_points_calculation` INT,
    IN `additional_points_for_points_calculation` INT,
    IN `var_current_datetime` DATETIME,
    IN `var_start_date` DATETIME,
    IN `var_end_date` DATETIME,
    IN `var_deduct_points` INT,
    IN `var_points_for_positive_performance` INT,
    IN `var_checkin_points_calculation` INT
)
BEGIN  
	DECLARE i INT DEFAULT 0;
	DECLARE var_employees_count INT DEFAULT 0;
    DECLARE var_total_score INT DEFAULT 0 ;
	DECLARE var_note_score INT DEFAULT 0 ;
	DECLARE var_training_score INT DEFAULT 0 ;
	DECLARE var_interaction_score INT DEFAULT 0;
	DECLARE var_checkin_score INT DEFAULT 0;
	DECLARE var_daily_report_submittion_score INT DEFAULT 0;
    DECLARE var_points INT DEFAULT 0;
    DECLARE var_threshold_points INT DEFAULT 0;
    DECLARE var_total_points INT DEFAULT 0;
    DECLARE var_employee_profile_id INT;
    DECLARE var_employee_points INT DEFAULT 0;
    DECLARE var_employee_level_id INT DEFAULT NULL;
	DECLARE var_new_level_id INT  DEFAULT NULL;
    DECLARE var_level_id INT DEFAULT NULL;
    DECLARE var_created_by INT ;
	
    SELECT COUNT(1) INTO var_employees_count FROM employee_profile WHERE STATUS='Active' ;
    SELECT user_id INTO var_created_by FROM masterdb.user WHERE email='admin@oneteam360.com';
    
    DROP TABLE IF EXISTS temp_employee_point_audit;
    CREATE TABLE temp_employee_point_audit LIKE employee_point_audit;
    
    SET i = 0;
	WHILE i < var_employees_count DO   
		SET var_note_score = NULL;
		SET var_training_score = NULL;
		SET var_interaction_score = NULL;
		SET var_checkin_score = NULL;
		SET var_daily_report_submittion_score = NULL;
		SET var_employee_level_id = NULL;
		SET var_total_score = 0;
		SET var_points = 0;
		SET var_employee_points = 0;
		SET var_employee_profile_id = 0;  
        SET var_total_points = 0;
		SET var_level_id = NULL;
		SET var_new_level_id = NULL;
      
		SELECT employee_profile_id INTO var_employee_profile_id FROM employee_profile WHERE STATUS='Active' LIMIT i, 1;
		SELECT points INTO var_employee_points FROM employee_profile WHERE employee_profile_id = var_employee_profile_id ;
		SELECT level_id INTO var_employee_level_id FROM employee_profile WHERE employee_profile_id = var_employee_profile_id ;
        
         ## NOTE SECTION START
		 SELECT SUM(note_calc_table.var_note_score) INTO var_note_score FROM 
			(
				SELECT 
					employee_note_table.note_type_id, impact_multiplier.score AS impact_multiplier_score, weighted_tier.score AS weighted_tier_score, 
					employee_note_table.note_counts,(weighted_tier.score*impact_multiplier.score*employee_note_table.note_counts) AS var_note_score
					FROM (
							SELECT employee_note.note_type_id, COUNT(note_type_id) AS note_counts   FROM employee_note 
								WHERE employee_note.status="Active" AND employee_note.employee_profile_id = var_employee_profile_id
									AND employee_note.created_date > var_start_date AND employee_note.created_date <= var_end_date 
								GROUP BY employee_note.note_type_id			
						) AS employee_note_table 
					INNER JOIN note_type 
						ON note_type.note_type_id = employee_note_table.note_type_id
					INNER JOIN masterdb.weighted_tier 
						ON note_type.weighted_tier_id = weighted_tier.weighted_tier_id
					INNER JOIN masterdb.impact_multiplier 
						ON note_type.impact_multiplier_id = impact_multiplier.impact_multiplier_id
			 ) AS note_calc_table; 
         ## NOTE SECTION END
         
         ## TRAINING SECTION START
		 SELECT SUM(training_score) INTO var_training_score FROM 
			(
					SELECT training_id,training_category_id, 
						SUM(internal_score) AS training_sum,
                        COUNT(training_id) AS training_count, 
                        (ROUND(SUM(internal_score) / COUNT(training_id),2)) AS training_score
						FROM 
						(
							SELECT 
							training_employee.training_id,training_category.training_category_id ,
							weighted_tier.score AS weighted_tier_score,
							grade.score AS grade_score,
							(weighted_tier.score*grade.score) AS internal_score
							FROM training_employee 
							INNER JOIN training
								ON training.training_id = training_employee.training_id
							INNER JOIN training_category 
								ON training_category.training_category_id = training.training_category_id
							INNER JOIN masterdb.weighted_tier 
								ON training_category.weighted_tier_id = weighted_tier.weighted_tier_id
							INNER JOIN masterdb.grade 
								ON training_employee.grade_id = grade.grade_id
							WHERE training_employee.status = 'Active' 
								AND training_employee.employee_profile_id = var_employee_profile_id
                                AND training_employee.created_date > var_start_date AND training_employee.created_date <= var_end_date 
						
						) AS training_calc_table GROUP BY training_id
				) AS training_calculation_table;
         ## TRAINING SECTION END
         
         ## INTERACTION SECTION START
		 SELECT SUM(interaction_score) INTO var_interaction_score FROM 
			(
				SELECT interaction_factor_id, 
					SUM(internal_score) AS training_sum,
					COUNT(interaction_factor_id) AS interaction_count, 
					(ROUND(SUM(internal_score) / COUNT(interaction_factor_id),2)) AS interaction_score
					FROM 
					(
						SELECT 
							employee_interaction_detail.interaction_factor_id,
							weighted_tier.score AS weighted_tier_score,
							grade.score AS grade_score,
							(weighted_tier.score*grade.score) AS internal_score
							FROM employee_interaction
								INNER JOIN employee_interaction_detail
									ON employee_interaction_detail.employee_interaction_id = employee_interaction.employee_interaction_id
								INNER JOIN interaction_factor
									ON employee_interaction_detail.interaction_factor_id = interaction_factor.interaction_factor_id
								INNER JOIN masterdb.weighted_tier 
									ON interaction_factor.weighted_tier_id = weighted_tier.weighted_tier_id
								INNER JOIN masterdb.grade 
									ON employee_interaction_detail.grade_id = grade.grade_id
							WHERE employee_interaction.employee_profile_id = var_employee_profile_id
								AND employee_interaction.created_date > var_start_date AND employee_interaction.created_date <= var_end_date 
					) AS interaction_calc_table GROUP BY interaction_factor_id
			) AS interaction_calculation_table;
         ## INTERACTION SECTION END
         
		 ## CHECKIN SECTION START
		 IF var_checkin_points_calculation > 0 THEN
			SELECT SUM(checkin_calc_table.var_checkin_score) INTO var_checkin_score FROM 
			(
			SELECT 
			employee_checkin_table.reviewer_status, employee_checkin_table.checkin_counts, impact_multiplier.score AS impact_multiplier_score, weighted_tier.score AS weighted_tier_score, 
			(weighted_tier.score*impact_multiplier.score*employee_checkin_table.checkin_counts) AS var_checkin_score
			FROM ( SELECT employee_checkin.reviewer_status, COUNT(employee_checkin_id) AS checkin_counts FROM employee_checkin 
			WHERE employee_checkin.employee_profile_id = var_employee_profile_id
			AND employee_checkin.checkin_datetime > var_start_date AND employee_checkin.checkin_datetime <= var_end_date
			AND reviewer_status IS NOT NULL 
			GROUP BY employee_checkin.reviewer_status
			) AS employee_checkin_table 
			INNER JOIN checkin_status 
				ON checkin_status.checkin_status = employee_checkin_table.reviewer_status
			INNER JOIN masterdb.weighted_tier 
				ON checkin_status.weighted_tier_id = weighted_tier.weighted_tier_id
			INNER JOIN masterdb.impact_multiplier 
				ON checkin_status.impact_multiplier_id = impact_multiplier.impact_multiplier_id
			) AS checkin_calc_table; 
		ELSE 
			SET var_checkin_score  = 0;
		END IF; 
         ## CHECKIN SECTION END
         
         ## DAILY REPORT SECTION START
		 SELECT SUM(report_submit_table.var_daily_report_submittion_score) INTO var_daily_report_submittion_score FROM 
				(
				SELECT 
				(weighted_tier.score*impact_multiplier.score*report_submission_table.report_submit_counts) AS var_daily_report_submittion_score
				FROM ( 
					SELECT `status` AS report_status, COUNT(report_submission_id) AS report_submit_counts 
					FROM report_submission 
					WHERE report_submission.employee_profile_id = var_employee_profile_id
					AND report_submission.reported_date > var_start_date 
					AND report_submission.reported_date <= var_end_date
					AND `status` = 'submitted'
					GROUP BY report_id, location_id
				) AS report_submission_table 
				INNER JOIN report_submission_point_calculation ON report_submission_point_calculation.report_submission_status = report_submission_table.report_status
				INNER JOIN masterdb.weighted_tier  ON report_submission_point_calculation.weighted_tier_id = weighted_tier.weighted_tier_id
				INNER JOIN masterdb.impact_multiplier ON report_submission_point_calculation.impact_multiplier_id = impact_multiplier.impact_multiplier_id
				) AS report_submit_table; 
         ## DAILY REPORT SECTION END
         
         ## TOTAL SCORE CALCULATION START
         IF var_note_score IS NULL THEN SET var_note_score = 0; END IF;
         IF var_training_score IS NULL THEN SET var_training_score = 0;  END IF;
         IF var_interaction_score IS NULL THEN SET var_interaction_score = 0;  END IF;
         IF var_checkin_score IS NULL THEN SET var_checkin_score = 0;  END IF;
         IF var_daily_report_submittion_score IS NULL THEN SET var_daily_report_submittion_score = 0;  END IF;
         
         SET var_total_score = var_note_score + var_training_score + var_interaction_score + var_checkin_score + var_daily_report_submittion_score;
		 ## TOTAL SCORE CALCULATION END
        
        
        ## POINTS CALCULATION START
        IF var_total_score > 0 THEN
			SET var_points = var_points_for_positive_performance;
		ELSEIF var_total_score = 0 THEN
			SET var_points = 0;
		ELSE
			IF deduct_points_for_negative_performance THEN
				IF var_employee_points > 0 THEN
					SET var_points = var_deduct_points * -1; ## Check if the customer configuration allows point deduction. If the deduction is allowed, award negative 1-point else award no var_points.
				ELSE
					SET var_points = 0;
				END IF;
			ELSE 
				SET var_points = 0; 
			END IF;
        END IF;
        
        SET var_total_points = var_employee_points + var_points;
		IF var_total_points < 0 THEN
			SET var_total_points = 0;
		END IF;
		## POINTS CALCULATION END
        
        #THRESHOLD CALCULATION START
        IF var_total_score > threshold_score_for_points_calculation THEN
			SET var_threshold_points  = additional_points_for_points_calculation;
		ELSE 
			SET var_threshold_points  = 0;
		END IF;
        #THRESHOLD CALCULATION END
        
		## GET LEVEL START
        SELECT level_id INTO var_level_id  FROM LEVEL WHERE var_total_points BETWEEN point_range_from AND point_range_to AND STATUS = 'Active' LIMIT 1;
        ## GET LEVEL END
        
        IF var_level_id IS NULL THEN
			IF var_total_points <= 0 THEN
				SELECT level_id INTO var_level_id FROM LEVEL WHERE STATUS = "Active" ORDER BY LEVEL ASC LIMIT 1;
			ELSE
               SELECT level_id INTO var_level_id FROM LEVEL WHERE STATUS = "Active" ORDER BY LEVEL DESC LIMIT 1;
		   END IF;
		END IF;
        
		## UPDATE EMPLOYEE PROFILE START
        ## if var_level_id IS NOT NULL then
		## 	UPDATE employee_profile SET points = var_total_points, level_id = var_level_id  WHERE employee_profile_id = var_employee_profile_id;
		## else
		## 	UPDATE employee_profile SET points = var_total_points  WHERE employee_profile_id = var_employee_profile_id;
		## end if;
        ## UPDATE EMPLOYEE PROFILE END
        
        ## INSERT IN EMPLOYEE_AUDIT START
        INSERT INTO `temp_employee_point_audit`
			( `employee_profile_id`,
			`reason`,
			`interaction_score`,
			`note_score`,
			`training_score`,
			`checkin_score`,
			`dailyreport_score`,
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
			"Daily Score",
			var_interaction_score,
			var_note_score,
			var_training_score,
			var_checkin_score,
			var_daily_report_submittion_score,
			var_total_score, 
			var_points, 
			var_employee_points,
			var_total_points,
			var_employee_level_id,
			var_level_id,
			var_created_by, 
			var_current_datetime);
        ## INSERT IN EMPLOYEE_AUDIT END
        
        IF var_threshold_points > 0 THEN
			SELECT level_id INTO var_new_level_id  FROM LEVEL WHERE (var_total_points + var_threshold_points) BETWEEN point_range_from AND point_range_to AND STATUS = 'Active' LIMIT 1;
				IF var_new_level_id IS NULL THEN
					IF (var_total_points + var_threshold_points) <= 0 THEN
						SELECT level_id INTO var_new_level_id FROM LEVEL WHERE STATUS = "Active" ORDER BY LEVEL ASC LIMIT 1;
					ELSE
					   SELECT level_id INTO var_new_level_id FROM LEVEL WHERE STATUS = "Active" ORDER BY LEVEL DESC LIMIT 1;
				   END IF;
				END IF;
			## INSERT IN EMPLOYEE_AUDIT START
			INSERT INTO `temp_employee_point_audit`
				( `employee_profile_id`,
				`reason`,
				`interaction_score`,
				`note_score`,
				`training_score`,
				`checkin_score`,
				`dailyreport_score`,
				`total_weighted_score`,
				`old_points`,
				`new_points`,
				`old_level_id`,
				`new_level_id`,
				`points_earned`,
				`created_by`,
				`created_date`)
				VALUES
				( var_employee_profile_id,
				"Automated Additional points rewarded",
				0,
				0,
				0,
				0,
				0,
				0, 
				var_total_points,
				var_total_points + var_threshold_points,
				var_level_id,
				var_new_level_id,
				var_threshold_points,
				var_created_by, 
				var_current_datetime);
			## INSERT IN EMPLOYEE_AUDIT END
		END IF;
		SET i = i + 1;
	END WHILE;
    
    BEGIN
		DECLARE EXIT HANDLER FOR SQLEXCEPTION 
		BEGIN
			  ROLLBACK;
		END;
		START TRANSACTION;
			SET SQL_SAFE_UPDATES = 0;
            UPDATE employee_profile SET 
			employee_profile.points = (SELECT new_points FROM temp_employee_point_audit WHERE temp_employee_point_audit.employee_profile_id = employee_profile.employee_profile_id ORDER BY temp_employee_point_audit.employee_profile_id DESC LIMIT 1),
			employee_profile.level_id = (SELECT new_level_id FROM temp_employee_point_audit WHERE temp_employee_point_audit.employee_profile_id = employee_profile.employee_profile_id ORDER BY temp_employee_point_audit.employee_profile_id DESC LIMIT 1) WHERE employee_profile.status = 'Active';
        
			INSERT INTO employee_point_audit (employee_profile_id, reason, interaction_score, note_score, training_score, checkin_score, dailyreport_score, total_weighted_score, points_earned, old_points, new_points, old_level_id, new_level_id, created_by, created_date) SELECT employee_profile_id, reason, interaction_score, note_score, training_score, checkin_score, dailyreport_score, total_weighted_score, points_earned, old_points, new_points, old_level_id, new_level_id, created_by, created_date FROM temp_employee_point_audit;
            SET SQL_SAFE_UPDATES = 1;
		COMMIT;    
	END;
    
	DROP TABLE IF EXISTS temp_employee_point_audit;
    
END &&  
DELIMITER ; 



#STORE PROCEDURE CALL
#CALL PointsCalculation(true,20,0,'2021-09-07 06:51:00','0000-00-00 00:00:00','2021-09-07 06:51:00');