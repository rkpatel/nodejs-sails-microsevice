ALTER TABLE `berzansky_macdonald`.`certificate_type` 
DROP FOREIGN KEY `updatedby_certificate`,
DROP FOREIGN KEY `updated_by_certificate`;
ALTER TABLE `berzansky_macdonald`.`certificate_type` 
DROP INDEX `updatedby_certificate_idx` ;
;
