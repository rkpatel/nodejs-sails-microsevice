DROP PROCEDURE IF EXISTS `CardLevelIncreasing`;

DELIMITER &&  
CREATE PROCEDURE `CardLevelIncreasing`( OUT var_output VARCHAR(8000))
BEGIN  

    DECLARE i INT DEFAULT 0;
    DECLARE var_employees_count INT DEFAULT 0;
    DECLARE var_output VARCHAR(8000);
    DECLARE var_employee_profile_id INT;
    DECLARE var_level INT;
    DECLARE var_emp_points INT;
    DECLARE var_emp_employee_profile_id INT;
    DECLARE var_total_score INT;
    DECLARE var_start_range_from INT;
    SET var_output = NULL;

    SELECT COUNT(1) INTO var_employees_count FROM employee_profile AS ep WHERE STATUS='Active';

    SET i = 0;
    WHILE i < var_employees_count DO   
        SET var_level = 0;
        SET var_emp_points = 0;
        SET var_employee_profile_id = 0;
        SET var_emp_employee_profile_id = 0;
         SELECT employee_profile_id INTO var_employee_profile_id 
         FROM employee_profile WHERE STATUS='Active' LIMIT i, 1;

        SELECT level.level, points INTO var_level, var_emp_points FROM employee_profile AS ep INNER JOIN LEVEL ON ep.level_id = level.level_id WHERE  employee_profile_id = var_employee_profile_id AND ep.status = 'Active';

        IF var_level IS NOT NULL THEN
           SELECT DISTINCT level.point_range_from INTO var_start_range_from 
           FROM LEVEL WHERE LEVEL =  (var_level + 1); 

           IF var_start_range_from IS NOT NULL THEN
              SET var_total_score = var_start_range_from - var_emp_points;

              IF var_total_score = 5 THEN 

                SET var_output = CONCAT_WS(',', var_output, var_employee_profile_id );

              END IF;
           END IF;
        END IF;
        SET i = i + 1;
    END WHILE;
    SELECT var_output;
END$$

DELIMITER ;


