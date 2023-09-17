UPDATE `weighted_tier` SET `name` = 'Extremely Important' WHERE `weighted_tier`.`weighted_tier_id` = 1;
UPDATE `weighted_tier` SET `name` = 'Very Important' WHERE `weighted_tier`.`weighted_tier_id` = 2;
UPDATE `weighted_tier` SET `name` = 'Important', `score` = 20 WHERE `weighted_tier`.`weighted_tier_id` = 3;
UPDATE `weighted_tier` SET `name` = 'Slightly Important', `score` = 10 WHERE `weighted_tier`.`weighted_tier_id` = 4;
UPDATE `weighted_tier` SET `name` = 'Not Important', `score` = 0 WHERE `weighted_tier`.`weighted_tier_id` = 5;

DELETE FROM `weighted_tier` WHERE `weighted_tier`.`weighted_tier_id` = 6;