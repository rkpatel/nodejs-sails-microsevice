-- phpMyAdmin SQL Dump
-- version 5.1.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 21, 2021 at 09:22 AM
-- Server version: 10.4.18-MariaDB
-- PHP Version: 8.0.3

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `berzansky_macdonald`
--

-- --------------------------------------------------------

--
-- Table structure for table `activity_log`
--

CREATE TABLE `activity_log` (
  `activity_log_id` int(11) NOT NULL,
  `log_type_id` int(11) NOT NULL,
  `task_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `announcements`
--

CREATE TABLE `announcements` (
  `announce_id` int(11) NOT NULL,
  `location_id` int(11) NOT NULL,
  `text` varchar(255) NOT NULL,
  `dept_id` int(11) NOT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `createdby` int(11) NOT NULL,
  `created_date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `award_thresold`
--

CREATE TABLE `award_thresold` (
  `thrsold_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `status` int(11) NOT NULL,
  `value` int(11) NOT NULL,
  `createdby` int(11) NOT NULL,
  `created_date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `certificate_category`
--

CREATE TABLE `certificate_category` (
  `cert_cat_id` int(11) NOT NULL,
  `category_title` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `certificate_type`
--

CREATE TABLE `certificate_type` (
  `certificate_type_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `status` int(11) NOT NULL,
  `createdby` int(11) NOT NULL,
  `created_date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `competion_draft`
--

CREATE TABLE `competion_draft` (
  `note_type_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `status` int(11) NOT NULL,
  `createdby` int(11) NOT NULL,
  `created_date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `control`
--

CREATE TABLE `control` (
  `control_id` int(11) NOT NULL,
  `control_type` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `daily_report`
--

CREATE TABLE `daily_report` (
  `note_type_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `status` int(11) NOT NULL,
  `createdby` int(11) NOT NULL,
  `created_date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `department`
--

CREATE TABLE `department` (
  `dept_id` int(11) NOT NULL,
  `location_id` int(11) NOT NULL,
  `dept_name` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `location_name` varchar(255) NOT NULL,
  `status` int(11) NOT NULL,
  `createdby` int(11) NOT NULL,
  `created_date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `dynamic_data`
--

CREATE TABLE `dynamic_data` (
  `dynamic_id` int(11) NOT NULL,
  `module_id` int(11) NOT NULL,
  `dynamic_key` varchar(255) NOT NULL,
  `value` varchar(255) NOT NULL,
  `search_field` varchar(255) NOT NULL,
  `createdby` varchar(255) NOT NULL,
  `created_date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `employee_certification`
--

CREATE TABLE `employee_certification` (
  `emp_cert_id` int(11) NOT NULL,
  `skill_id` int(11) NOT NULL,
  `emp_profile_id` int(11) NOT NULL,
  `assignby` int(11) NOT NULL,
  `approval_status` int(11) NOT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `path` varchar(255) NOT NULL,
  `createdby` varchar(255) NOT NULL,
  `created_date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `employee_certification_history`
--

CREATE TABLE `employee_certification_history` (
  `emp_cert_hist_id` int(11) NOT NULL,
  `emp_cert_id` int(11) NOT NULL,
  `skill_id` int(11) NOT NULL,
  `emp_profile_id` int(11) NOT NULL,
  `assignby` int(11) NOT NULL,
  `approval_status` int(11) NOT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `note` int(11) NOT NULL,
  `path` int(11) NOT NULL,
  `createdby` int(11) NOT NULL,
  `created_date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `employee_profile`
--

CREATE TABLE `employee_profile` (
  `employee_profile_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `middle_name` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `date_of_birth` date DEFAULT NULL,
  `date_of_joining` date NOT NULL,
  `emergency_contact_name` varchar(255) NOT NULL,
  `emergency_contact_relation` varchar(255) NOT NULL,
  `emergency_number` varchar(255) NOT NULL,
  `emergency_address` varchar(255) NOT NULL,
  `profile_picture` binary(255) NOT NULL,
  `createdby` int(11) NOT NULL,
  `role_id` int(11) NOT NULL,
  `manager_id` int(11) NOT NULL,
  `department_id` int(11) NOT NULL,
  `points` double NOT NULL,
  `status` int(11) NOT NULL,
  `employee_type` int(11) NOT NULL,
  `level_id` int(11) NOT NULL,
  `created_date` datetime NOT NULL,
  `updatedby` int(11) NOT NULL,
  `updated_date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `employee_profile`
--

INSERT INTO `employee_profile` (`employee_profile_id`, `user_id`, `first_name`, `last_name`, `middle_name`, `address`, `email`, `date_of_birth`, `date_of_joining`, `emergency_contact_name`, `emergency_contact_relation`, `emergency_number`, `emergency_address`, `profile_picture`, `createdby`, `role_id`, `manager_id`, `department_id`, `points`, `status`, `employee_type`, `level_id`, `created_date`, `updatedby`, `updated_date`) VALUES
(9, 1, '', '', '', '', '', NULL, '2021-05-21', 'fgd', 'dfg', 'fgdf', 'gf', 0x89504e470d0a1a0a0000000d49484452000004270000015f0802000000f21e31f800000006624b474400ff00ff00ffa0bda7930000200049444154789cecdd795c13d7da07f0137612640bca2a022ed5d65d1145505450ac68ad5eac4051db7b6beb52b5d65e6d6dab166db5b850af1b88d6b28875afa245b1c5ad28d60daf5015947d131010042521f3fe31b7f39937992c404202fcbe7f259333e73ce7cc9279324b781445110000000000008dd1d376000000000000d0c121eb000000000000cd42d60100000000009a85ac030000000000340b590700000000006816b20e0000000000d02c641d0000000000a059c83a000000000040b3907500000000, 0, 1, 0, 0, 56, 1, 0, 1, '2021-06-08 11:10:03', 0, '0000-00-00 00:00:00'),
(10, 1, '', '', '', '', '', NULL, '2021-05-21', 'fgd', 'dfg', 'fgdf', 'gf', 0x89504e470d0a1a0a0000000d49484452000004270000015f0802000000f21e31f800000006624b474400ff00ff00ffa0bda7930000200049444154789cecdd795c13d7da07f0137612640bca2a022ed5d65d1145505450ac68ad5eac4051db7b6beb52b5d65e6d6dab166db5b850af1b88d6b28875afa245b1c5ad28d60daf5015947d131010042521f3fe31b7f39937992c404202fcbe7f259333e73ce7cc9279324b781445110000000000008dd1d376000000000000d0c121eb000000000000cd42d60100000000009a85ac030000000000340b590700000000006816b20e0000000000d02c641d0000000000a059c83a000000000040b3907500000000, 0, 1, 0, 0, 56, 1, 0, 1, '2021-06-08 12:11:29', 0, '0000-00-00 00:00:00'),
(11, 3, '', '', '', '', '', NULL, '2021-04-21', 'john', 'friend', '123456782', 'USA', 0xffd8ffe000104a46494600010100000100010000ffdb00430001010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101ffdb00430101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101010101ffc00011080625064003012200021101031101ffc4001f0001000203010101010101000000000000000708050609040a0302010bffc400831000010304010006010711110b0608011d05030406000102070811121314151654091794a4d3d4d618, 1, 1, 0, 0, 563, 1, 0, 1, '2021-06-09 17:32:16', 1, '2021-06-09 17:32:16'),
(12, 5, 'anjali', 'gupta', 'sanjay', 'ahmedabad gujarat', 'angupta12@synoptek.com', '1999-04-15', '2021-05-21', 'test', 'frd', '12354689', 'gujarat', 0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000, 3, 1, 0, 0, 56, 1, 0, 1, '2021-06-11 13:02:25', 0, '2021-06-11 13:02:25'),
(13, 6, 'anjali', 'gupta', 'sanjay', 'ahmedabad gujarat', 'angupta@synoptek.com', '1999-04-15', '2021-05-21', 'test', 'frd', '12354689', 'gujarat', 0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000, 3, 1, 0, 0, 56, 1, 0, 1, '2021-06-11 13:13:11', 0, '2021-06-11 13:13:11'),
(14, 7, 'jiana', 'trivedi', 'd', 'ahmedabad gujarat', 'jtrivedi@synoptek.com', '1998-04-15', '2021-05-21', 'test', 'frd', '12354689', 'gujarat', 0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000, 3, 1, 0, 0, 56, 1, 0, 1, '2021-06-14 17:04:00', 0, '2021-06-14 17:04:00'),
(15, 8, 'jiana', 'trivedi', 'd', 'ahmedabad gujarat', 'jtrivedi123@synoptek.com', '1998-04-15', '2021-05-21', 'test', 'frd', '12354689', 'gujarat', 0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000, 7, 1, 0, 0, 56, 1, 0, 1, '2021-06-17 11:50:05', 0, '2021-06-17 11:50:05'),
(16, 9, 'jiana', 'trivedi', 'd', 'ahmedabad gujarat', 'jtrivedi123456@synoptek.com', '1998-04-15', '2021-05-21', 'test', 'frd', '12354689', 'gujarat', 0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000, 7, 1, 0, 0, 56, 1, 0, 1, '2021-06-17 13:23:40', 0, '2021-06-17 13:23:40'),
(17, 10, 'jiana', 'trivedi', 'd', 'ahmedabad gujarat', 'jtrivedi123456s@synoptek.com', '1998-04-15', '2021-05-21', 'test', 'frd', '12354689', 'gujarat', 0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000, 7, 1, 0, 0, 56, 1, 0, 1, '2021-06-17 13:44:14', 0, '2021-06-17 13:44:14'),
(18, 11, 'jiana', 'trivedi', 'd', 'ahmedabad gujarat', 'jt@synoptek.com', '1998-04-15', '2021-05-21', 'test', 'frd', '12354689', 'gujarat', 0x000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000, 7, 1, 0, 0, 56, 1, 0, 1, '2021-06-17 20:43:32', 0, '2021-06-17 20:43:32');

-- --------------------------------------------------------

--
-- Table structure for table `employee_trn_dev_management`
--

CREATE TABLE `employee_trn_dev_management` (
  `emp_trn_dev_mgmt_id` int(11) NOT NULL,
  `trn_dev_id` int(11) NOT NULL,
  `emp_profile_id` int(11) NOT NULL,
  `rank_id` int(11) NOT NULL,
  `points` double NOT NULL,
  `notes` varchar(255) NOT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `status` varchar(255) NOT NULL,
  `createdby` varchar(255) NOT NULL,
  `created_date` datetime NOT NULL,
  `administrator` int(11) NOT NULL,
  `retest` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `emp_location`
--

CREATE TABLE `emp_location` (
  `emp_location_id` int(11) NOT NULL,
  `emp_profile_id` int(11) NOT NULL,
  `location_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `emp_location`
--

INSERT INTO `emp_location` (`emp_location_id`, `emp_profile_id`, `location_id`) VALUES
(3, 9, 1),
(4, 10, 1),
(6, 11, 1),
(7, 12, 1),
(8, 13, 1),
(9, 14, 1),
(10, 15, 1),
(11, 16, 1),
(12, 17, 1),
(13, 18, 1);

-- --------------------------------------------------------

--
-- Table structure for table `form_field`
--

CREATE TABLE `form_field` (
  `field_id` int(11) NOT NULL,
  `module_id` int(11) NOT NULL,
  `field_label` varchar(255) NOT NULL,
  `field_key` varchar(255) NOT NULL,
  `control_id` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `interaction`
--

CREATE TABLE `interaction` (
  `inter_id` int(11) NOT NULL,
  `emp_profile_id` int(11) NOT NULL,
  `inter_factor_id` int(11) NOT NULL,
  `notes` varchar(255) NOT NULL,
  `rank` int(11) NOT NULL,
  `createdby` int(11) NOT NULL,
  `created_date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `interaction_factor`
--

CREATE TABLE `interaction_factor` (
  `inter_cat_id` int(11) NOT NULL,
  `factor` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `interaction_history`
--

CREATE TABLE `interaction_history` (
  `inter_hist_id` int(11) NOT NULL,
  `inter_id` int(11) NOT NULL,
  `emp_profile_id` int(11) NOT NULL,
  `inter_category_id` int(11) NOT NULL,
  `notes` varchar(255) NOT NULL,
  `rank` int(11) NOT NULL,
  `createdby` int(11) NOT NULL,
  `created_date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `in_service`
--

CREATE TABLE `in_service` (
  `in_serv_id` int(11) NOT NULL,
  `in_serv_cat_id` int(11) NOT NULL,
  `skill_id` int(11) NOT NULL,
  `skill_name` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `weightage` int(11) NOT NULL,
  `description` varchar(255) NOT NULL,
  `status` int(11) NOT NULL,
  `createdby` int(11) NOT NULL,
  `created_date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `in_service_category`
--

CREATE TABLE `in_service_category` (
  `in_serv_cat_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `status` int(11) NOT NULL,
  `createdby` int(11) NOT NULL,
  `created_date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `level`
--

CREATE TABLE `level` (
  `level_id` int(11) NOT NULL,
  `level` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `status` int(11) NOT NULL,
  `point_range_from` int(11) NOT NULL,
  `point_range_to` int(11) NOT NULL,
  `description` varchar(255) NOT NULL,
  `createdby` int(11) NOT NULL,
  `created_date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `level`
--

INSERT INTO `level` (`level_id`, `level`, `name`, `status`, `point_range_from`, `point_range_to`, `description`, `createdby`, `created_date`) VALUES
(1, 1, 'high', 1, 1, 10, 'dsgfdgh', 1, '2021-06-04 00:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `location`
--

CREATE TABLE `location` (
  `location_id` int(11) NOT NULL,
  `parent_location` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `status` int(11) NOT NULL,
  `createdby` int(11) NOT NULL,
  `created_date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `location`
--

INSERT INTO `location` (`location_id`, `parent_location`, `name`, `description`, `status`, `createdby`, `created_date`) VALUES
(1, 'ahmedabad', 'ahmedabad', 'test test test ', 1, 1, '2021-06-08 00:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `log_type`
--

CREATE TABLE `log_type` (
  `log_id` int(11) NOT NULL,
  `log_name` varchar(255) NOT NULL,
  `log_description` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `modules`
--

CREATE TABLE `modules` (
  `module_id` int(11) NOT NULL,
  `modulke_name` varchar(255) NOT NULL,
  `code` int(11) NOT NULL,
  `status` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `notes`
--

CREATE TABLE `notes` (
  `note_id` int(11) NOT NULL,
  `emp_profile_id` int(11) NOT NULL,
  `type_id` int(11) NOT NULL,
  `note_details` varchar(255) NOT NULL,
  `location_id` int(11) NOT NULL,
  `department_id` int(11) NOT NULL,
  `shift_id` int(11) NOT NULL,
  `createdBy` varchar(255) NOT NULL,
  `created_date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `notes_history`
--

CREATE TABLE `notes_history` (
  `note_history_id` int(11) NOT NULL,
  `note_id` int(11) NOT NULL,
  `emp_profile_id` int(11) NOT NULL,
  `type_id` int(11) NOT NULL,
  `location_id` int(11) NOT NULL,
  `department_id` int(11) NOT NULL,
  `shift_id` int(11) NOT NULL,
  `createdBy` int(11) NOT NULL,
  `created_date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `notes_type`
--

CREATE TABLE `notes_type` (
  `notes_type_id` int(11) NOT NULL,
  `type_name` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `weighted_score` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `note_type`
--

CREATE TABLE `note_type` (
  `note_type_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `status` int(11) NOT NULL,
  `createdby` int(11) NOT NULL,
  `created_date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `notification`
--

CREATE TABLE `notification` (
  `notification_id` int(11) NOT NULL,
  `task_id` int(11) NOT NULL,
  `status` int(11) NOT NULL,
  `notify_by` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `app` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `option_box`
--

CREATE TABLE `option_box` (
  `option_control_id` int(11) NOT NULL,
  `field_id` int(11) NOT NULL,
  `control_type` varchar(255) NOT NULL,
  `control_key` int(255) NOT NULL,
  `value` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `permission`
--

CREATE TABLE `permission` (
  `permission_id` int(11) NOT NULL,
  `permission_module_id` int(11) NOT NULL,
  `parent_permission_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `is_active` int(11) NOT NULL,
  `sequence` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `permission`
--

INSERT INTO `permission` (`permission_id`, `permission_module_id`, `parent_permission_id`, `name`, `code`, `description`, `is_active`, `sequence`) VALUES
(1, 1, 0, 'Manage User Roles', 'ManageUserRoles', 'Manage User Roles', 1, 1),
(2, 2, 0, 'Manage Skills Master', 'ManageSkillsMaster', 'Manage Skills Master', 1, 1),
(3, 2, 0, 'Manage Location Master', 'ManageLocationMaster', 'Manage Location Master', 1, 2),
(4, 4, 0, 'View All Employee', 'ViewAllEmployee', 'View All Employee', 1, 1),
(5, 4, 4, 'Add New Employee', 'AddNewEmployee', 'Add New Employee', 1, 2),
(6, 4, 4, 'Bulk Import Employee', 'BulkImportEmployee', 'Bulk Import Employee', 1, 3),
(7, 4, 4, 'Inactivate User', 'InactivateUser', 'Inactivate User', 1, 4),
(8, 5, 0, 'Add New Certificate', 'AddNewCertificate', 'Add New Certificate', 1, 1),
(9, 5, 0, 'Edit Certificate', 'EditCertificate', 'Edit Certificate', 1, 2),
(10, 5, 0, 'Assign Certificate', 'AssignCertificate', 'Assign Certificate', 0, 3),
(11, 5, 0, 'Delete Certificate', 'DeleteCertificate', 'Delete Certificate', 4, 0),
(12, 5, 0, 'Approve/Reject Certificate', 'ApproveRejectCertificate', 'Approve/Reject Certificate', 5, 0);

-- --------------------------------------------------------

--
-- Table structure for table `permission_module`
--

CREATE TABLE `permission_module` (
  `permission_module_id` int(11) NOT NULL,
  `parent_permission_module_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `is_active` int(11) NOT NULL,
  `sequence` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `permission_module`
--

INSERT INTO `permission_module` (`permission_module_id`, `parent_permission_module_id`, `name`, `description`, `is_active`, `sequence`) VALUES
(1, 0, 'User Management', 'User Management', 1, 1),
(2, 0, 'Master Management', 'Master Management', 1, 2),
(3, 0, 'Employee Management', 'Employee Management', 1, 3),
(4, 3, 'Employee Profile', 'Employee Profile', 1, 1),
(5, 3, 'Certificate', 'Certificate', 1, 2);

-- --------------------------------------------------------

--
-- Table structure for table `points_metrix`
--

CREATE TABLE `points_metrix` (
  `metrix_id` int(11) NOT NULL,
  `category` varchar(255) NOT NULL,
  `sub_category` varchar(255) NOT NULL,
  `points` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `rank`
--

CREATE TABLE `rank` (
  `rank_id` int(11) NOT NULL,
  `rank_title` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `points` double NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `resources`
--

CREATE TABLE `resources` (
  `resource_id` int(11) NOT NULL,
  `title` int(11) NOT NULL,
  `skill_id` int(11) NOT NULL,
  `description` varchar(255) NOT NULL,
  `media_type` varchar(255) NOT NULL,
  `location_path` varchar(255) NOT NULL,
  `location_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `role`
--

CREATE TABLE `role` (
  `role_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `is_active` int(11) NOT NULL,
  `is_admin_role` int(11) NOT NULL,
  `createdby` int(11) NOT NULL,
  `created_date` datetime NOT NULL,
  `updatedby` int(11) NOT NULL,
  `updated_date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `role`
--

INSERT INTO `role` (`role_id`, `name`, `description`, `is_active`, `is_admin_role`, `createdby`, `created_date`, `updatedby`, `updated_date`) VALUES
(1, 'Admin', 'Admin Role', 1, 1, 1, '2021-06-14 07:07:42', 0, '2021-06-14 07:07:42'),
(2, 'Manager', 'Manager Role', 1, 1, 1, '2021-06-14 07:07:42', 0, '2021-06-14 07:07:42');

-- --------------------------------------------------------

--
-- Table structure for table `role_permission`
--

CREATE TABLE `role_permission` (
  `role_permission_id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL,
  `createdby` int(11) NOT NULL,
  `created_date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `role_permission`
--

INSERT INTO `role_permission` (`role_permission_id`, `role_id`, `permission_id`, `createdby`, `created_date`) VALUES
(1, 1, 4, 1, '2021-06-16 13:41:38'),
(2, 1, 5, 0, '2021-06-16 13:41:38');

-- --------------------------------------------------------

--
-- Table structure for table `shift_master`
--

CREATE TABLE `shift_master` (
  `shift_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `time_from` time NOT NULL,
  `time_to` time NOT NULL,
  `status` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `skill`
--

CREATE TABLE `skill` (
  `skill_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `status` int(11) NOT NULL,
  `dept_id` int(11) NOT NULL,
  `createdby` int(11) NOT NULL,
  `created_date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `skill_certificate_mapping`
--

CREATE TABLE `skill_certificate_mapping` (
  `skill_cert_id` int(11) NOT NULL,
  `skill_id` int(11) NOT NULL,
  `cert_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `status`
--

CREATE TABLE `status` (
  `user_id_number` int(11) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `tenant_id` varchar(255) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `createdby` varchar(255) NOT NULL,
  `created_date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `system_error`
--

CREATE TABLE `system_error` (
  `error_id` int(11) NOT NULL,
  `code` int(11) NOT NULL,
  `text` varchar(255) NOT NULL,
  `status` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `task_detail`
--

CREATE TABLE `task_detail` (
  `task_detail_id` int(11) NOT NULL,
  `task_type` varchar(255) NOT NULL,
  `task_details` varchar(255) NOT NULL,
  `assign_by` int(11) NOT NULL,
  `assign_to` int(11) NOT NULL,
  `location_id` int(11) NOT NULL,
  `create_log` tinyint(1) NOT NULL,
  `task_status` varchar(255) NOT NULL,
  `is_private_task` tinyint(1) NOT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `createdby` int(11) NOT NULL,
  `created_date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `task_type`
--

CREATE TABLE `task_type` (
  `task_type_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `status` int(11) NOT NULL,
  `createdby` int(11) NOT NULL,
  `created_date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `trainanddevelopment`
--

CREATE TABLE `trainanddevelopment` (
  `trn_dev_id` int(11) NOT NULL,
  `skill_id` int(11) NOT NULL,
  `scenario` varchar(255) NOT NULL,
  `day` int(255) NOT NULL,
  `location_id` int(11) NOT NULL,
  `dept_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `trainanddevelopment_history`
--

CREATE TABLE `trainanddevelopment_history` (
  `trn_dev_history_id` int(11) NOT NULL,
  `trn_dev_id` int(11) NOT NULL,
  `skills` varchar(255) NOT NULL,
  `scenario` varchar(255) NOT NULL,
  `day` varchar(255) NOT NULL,
  `location` varchar(255) NOT NULL,
  `department` varchar(255) NOT NULL,
  `number_of_employee` int(11) NOT NULL,
  `conductby` varchar(255) NOT NULL,
  `conduction` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `trainanddevelopment_skills`
--

CREATE TABLE `trainanddevelopment_skills` (
  `trn_skill_id` int(11) NOT NULL,
  `trn_dev_id` int(11) NOT NULL,
  `skill_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `training_resource`
--

CREATE TABLE `training_resource` (
  `trn_resource_id` int(11) NOT NULL,
  `trn_dev_id` int(11) NOT NULL,
  `skill_id` int(11) NOT NULL,
  `resource_location_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `validation`
--

CREATE TABLE `validation` (
  `validation_id` int(11) NOT NULL,
  `control_id` varchar(255) NOT NULL,
  `validation_category` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `writeup`
--

CREATE TABLE `writeup` (
  `writeup_id` int(11) NOT NULL,
  `emp_profile_id` int(11) NOT NULL,
  `write_cat_id` int(11) NOT NULL,
  `notes` varchar(255) NOT NULL,
  `rank` int(11) NOT NULL,
  `createdby` int(11) NOT NULL,
  `created_date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `writeup_category`
--

CREATE TABLE `writeup_category` (
  `write_cat_id` int(11) NOT NULL,
  `category_name` varchar(255) NOT NULL,
  `description` int(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `writeup_history`
--

CREATE TABLE `writeup_history` (
  `writeup_hist_id` int(11) NOT NULL,
  `writeup_id` int(11) NOT NULL,
  `emp_profile_id` int(11) NOT NULL,
  `write_cat_id` int(11) NOT NULL,
  `notes` varchar(255) NOT NULL,
  `rank` int(11) NOT NULL,
  `createdby` int(11) NOT NULL,
  `created_date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `activity_log`
--
ALTER TABLE `activity_log`
  ADD PRIMARY KEY (`activity_log_id`),
  ADD KEY `log_type` (`log_type_id`),
  ADD KEY `task_id` (`task_id`);

--
-- Indexes for table `announcements`
--
ALTER TABLE `announcements`
  ADD PRIMARY KEY (`announce_id`),
  ADD KEY `locations_id` (`location_id`),
  ADD KEY `department_id` (`dept_id`);

--
-- Indexes for table `award_thresold`
--
ALTER TABLE `award_thresold`
  ADD PRIMARY KEY (`thrsold_id`);

--
-- Indexes for table `certificate_category`
--
ALTER TABLE `certificate_category`
  ADD PRIMARY KEY (`cert_cat_id`);

--
-- Indexes for table `certificate_type`
--
ALTER TABLE `certificate_type`
  ADD PRIMARY KEY (`certificate_type_id`);

--
-- Indexes for table `competion_draft`
--
ALTER TABLE `competion_draft`
  ADD PRIMARY KEY (`note_type_id`);

--
-- Indexes for table `control`
--
ALTER TABLE `control`
  ADD PRIMARY KEY (`control_id`);

--
-- Indexes for table `daily_report`
--
ALTER TABLE `daily_report`
  ADD PRIMARY KEY (`note_type_id`);

--
-- Indexes for table `department`
--
ALTER TABLE `department`
  ADD PRIMARY KEY (`dept_id`),
  ADD KEY `locations` (`location_id`);

--
-- Indexes for table `dynamic_data`
--
ALTER TABLE `dynamic_data`
  ADD PRIMARY KEY (`dynamic_id`);

--
-- Indexes for table `employee_certification`
--
ALTER TABLE `employee_certification`
  ADD PRIMARY KEY (`emp_cert_id`),
  ADD KEY `skill_id` (`skill_id`);

--
-- Indexes for table `employee_certification_history`
--
ALTER TABLE `employee_certification_history`
  ADD PRIMARY KEY (`emp_cert_hist_id`),
  ADD KEY `emp_cert_id` (`emp_cert_id`);

--
-- Indexes for table `employee_profile`
--
ALTER TABLE `employee_profile`
  ADD PRIMARY KEY (`employee_profile_id`);

--
-- Indexes for table `employee_trn_dev_management`
--
ALTER TABLE `employee_trn_dev_management`
  ADD PRIMARY KEY (`emp_trn_dev_mgmt_id`),
  ADD KEY `trn_dev_id` (`trn_dev_id`);

--
-- Indexes for table `emp_location`
--
ALTER TABLE `emp_location`
  ADD PRIMARY KEY (`emp_location_id`),
  ADD KEY `emp_profile_id` (`emp_profile_id`),
  ADD KEY `location_id` (`location_id`);

--
-- Indexes for table `form_field`
--
ALTER TABLE `form_field`
  ADD PRIMARY KEY (`field_id`);

--
-- Indexes for table `interaction`
--
ALTER TABLE `interaction`
  ADD PRIMARY KEY (`inter_id`),
  ADD KEY `emp_profile` (`emp_profile_id`),
  ADD KEY `rank` (`rank`);

--
-- Indexes for table `interaction_factor`
--
ALTER TABLE `interaction_factor`
  ADD PRIMARY KEY (`inter_cat_id`);

--
-- Indexes for table `interaction_history`
--
ALTER TABLE `interaction_history`
  ADD PRIMARY KEY (`inter_hist_id`),
  ADD KEY `inter_id` (`inter_id`),
  ADD KEY `employee_profile` (`emp_profile_id`);

--
-- Indexes for table `in_service`
--
ALTER TABLE `in_service`
  ADD PRIMARY KEY (`in_serv_id`),
  ADD KEY `in_serv_cat_id` (`in_serv_cat_id`);

--
-- Indexes for table `in_service_category`
--
ALTER TABLE `in_service_category`
  ADD PRIMARY KEY (`in_serv_cat_id`);

--
-- Indexes for table `level`
--
ALTER TABLE `level`
  ADD PRIMARY KEY (`level_id`);

--
-- Indexes for table `location`
--
ALTER TABLE `location`
  ADD PRIMARY KEY (`location_id`);

--
-- Indexes for table `log_type`
--
ALTER TABLE `log_type`
  ADD PRIMARY KEY (`log_id`);

--
-- Indexes for table `modules`
--
ALTER TABLE `modules`
  ADD PRIMARY KEY (`module_id`);

--
-- Indexes for table `notes`
--
ALTER TABLE `notes`
  ADD PRIMARY KEY (`note_id`),
  ADD KEY `Foreign Key` (`emp_profile_id`),
  ADD KEY `Foreign` (`type_id`);

--
-- Indexes for table `notes_history`
--
ALTER TABLE `notes_history`
  ADD PRIMARY KEY (`note_history_id`);

--
-- Indexes for table `notes_type`
--
ALTER TABLE `notes_type`
  ADD PRIMARY KEY (`notes_type_id`);

--
-- Indexes for table `note_type`
--
ALTER TABLE `note_type`
  ADD PRIMARY KEY (`note_type_id`);

--
-- Indexes for table `notification`
--
ALTER TABLE `notification`
  ADD PRIMARY KEY (`notification_id`);

--
-- Indexes for table `option_box`
--
ALTER TABLE `option_box`
  ADD PRIMARY KEY (`option_control_id`),
  ADD KEY `field_id` (`field_id`);

--
-- Indexes for table `permission`
--
ALTER TABLE `permission`
  ADD PRIMARY KEY (`permission_id`);

--
-- Indexes for table `permission_module`
--
ALTER TABLE `permission_module`
  ADD PRIMARY KEY (`permission_module_id`);

--
-- Indexes for table `points_metrix`
--
ALTER TABLE `points_metrix`
  ADD PRIMARY KEY (`metrix_id`);

--
-- Indexes for table `rank`
--
ALTER TABLE `rank`
  ADD PRIMARY KEY (`rank_id`);

--
-- Indexes for table `resources`
--
ALTER TABLE `resources`
  ADD PRIMARY KEY (`resource_id`);

--
-- Indexes for table `role`
--
ALTER TABLE `role`
  ADD PRIMARY KEY (`role_id`);

--
-- Indexes for table `role_permission`
--
ALTER TABLE `role_permission`
  ADD PRIMARY KEY (`role_permission_id`);

--
-- Indexes for table `shift_master`
--
ALTER TABLE `shift_master`
  ADD PRIMARY KEY (`shift_id`);

--
-- Indexes for table `skill`
--
ALTER TABLE `skill`
  ADD PRIMARY KEY (`skill_id`),
  ADD KEY `depart_id` (`dept_id`);

--
-- Indexes for table `skill_certificate_mapping`
--
ALTER TABLE `skill_certificate_mapping`
  ADD PRIMARY KEY (`skill_cert_id`),
  ADD KEY `cert_id` (`cert_id`),
  ADD KEY `skills` (`skill_id`);

--
-- Indexes for table `status`
--
ALTER TABLE `status`
  ADD PRIMARY KEY (`user_id_number`);

--
-- Indexes for table `system_error`
--
ALTER TABLE `system_error`
  ADD PRIMARY KEY (`error_id`);

--
-- Indexes for table `task_detail`
--
ALTER TABLE `task_detail`
  ADD PRIMARY KEY (`task_detail_id`);

--
-- Indexes for table `task_type`
--
ALTER TABLE `task_type`
  ADD PRIMARY KEY (`task_type_id`);

--
-- Indexes for table `trainanddevelopment`
--
ALTER TABLE `trainanddevelopment`
  ADD PRIMARY KEY (`trn_dev_id`),
  ADD KEY `location` (`location_id`),
  ADD KEY `dept_id` (`dept_id`);

--
-- Indexes for table `trainanddevelopment_history`
--
ALTER TABLE `trainanddevelopment_history`
  ADD PRIMARY KEY (`trn_dev_history_id`);

--
-- Indexes for table `trainanddevelopment_skills`
--
ALTER TABLE `trainanddevelopment_skills`
  ADD PRIMARY KEY (`trn_skill_id`);

--
-- Indexes for table `training_resource`
--
ALTER TABLE `training_resource`
  ADD PRIMARY KEY (`trn_resource_id`);

--
-- Indexes for table `validation`
--
ALTER TABLE `validation`
  ADD PRIMARY KEY (`validation_id`);

--
-- Indexes for table `writeup`
--
ALTER TABLE `writeup`
  ADD PRIMARY KEY (`writeup_id`);

--
-- Indexes for table `writeup_category`
--
ALTER TABLE `writeup_category`
  ADD PRIMARY KEY (`write_cat_id`);

--
-- Indexes for table `writeup_history`
--
ALTER TABLE `writeup_history`
  ADD PRIMARY KEY (`writeup_hist_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `activity_log`
--
ALTER TABLE `activity_log`
  MODIFY `activity_log_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `announcements`
--
ALTER TABLE `announcements`
  MODIFY `announce_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `award_thresold`
--
ALTER TABLE `award_thresold`
  MODIFY `thrsold_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `certificate_category`
--
ALTER TABLE `certificate_category`
  MODIFY `cert_cat_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `certificate_type`
--
ALTER TABLE `certificate_type`
  MODIFY `certificate_type_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `competion_draft`
--
ALTER TABLE `competion_draft`
  MODIFY `note_type_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `control`
--
ALTER TABLE `control`
  MODIFY `control_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `daily_report`
--
ALTER TABLE `daily_report`
  MODIFY `note_type_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `department`
--
ALTER TABLE `department`
  MODIFY `dept_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `dynamic_data`
--
ALTER TABLE `dynamic_data`
  MODIFY `dynamic_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `employee_certification`
--
ALTER TABLE `employee_certification`
  MODIFY `emp_cert_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `employee_certification_history`
--
ALTER TABLE `employee_certification_history`
  MODIFY `emp_cert_hist_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `employee_profile`
--
ALTER TABLE `employee_profile`
  MODIFY `employee_profile_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `employee_trn_dev_management`
--
ALTER TABLE `employee_trn_dev_management`
  MODIFY `emp_trn_dev_mgmt_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `emp_location`
--
ALTER TABLE `emp_location`
  MODIFY `emp_location_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `form_field`
--
ALTER TABLE `form_field`
  MODIFY `field_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `interaction`
--
ALTER TABLE `interaction`
  MODIFY `inter_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `interaction_factor`
--
ALTER TABLE `interaction_factor`
  MODIFY `inter_cat_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `interaction_history`
--
ALTER TABLE `interaction_history`
  MODIFY `inter_hist_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `level`
--
ALTER TABLE `level`
  MODIFY `level_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `location`
--
ALTER TABLE `location`
  MODIFY `location_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `log_type`
--
ALTER TABLE `log_type`
  MODIFY `log_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `modules`
--
ALTER TABLE `modules`
  MODIFY `module_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notes`
--
ALTER TABLE `notes`
  MODIFY `note_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notes_history`
--
ALTER TABLE `notes_history`
  MODIFY `note_history_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notes_type`
--
ALTER TABLE `notes_type`
  MODIFY `notes_type_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `notification`
--
ALTER TABLE `notification`
  MODIFY `notification_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `option_box`
--
ALTER TABLE `option_box`
  MODIFY `option_control_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `permission`
--
ALTER TABLE `permission`
  MODIFY `permission_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `permission_module`
--
ALTER TABLE `permission_module`
  MODIFY `permission_module_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `points_metrix`
--
ALTER TABLE `points_metrix`
  MODIFY `metrix_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `rank`
--
ALTER TABLE `rank`
  MODIFY `rank_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `resources`
--
ALTER TABLE `resources`
  MODIFY `resource_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `role`
--
ALTER TABLE `role`
  MODIFY `role_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `role_permission`
--
ALTER TABLE `role_permission`
  MODIFY `role_permission_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `shift_master`
--
ALTER TABLE `shift_master`
  MODIFY `shift_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `skill_certificate_mapping`
--
ALTER TABLE `skill_certificate_mapping`
  MODIFY `skill_cert_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `task_detail`
--
ALTER TABLE `task_detail`
  MODIFY `task_detail_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `task_type`
--
ALTER TABLE `task_type`
  MODIFY `task_type_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `trainanddevelopment`
--
ALTER TABLE `trainanddevelopment`
  MODIFY `trn_dev_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `trainanddevelopment_history`
--
ALTER TABLE `trainanddevelopment_history`
  MODIFY `trn_dev_history_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `trainanddevelopment_skills`
--
ALTER TABLE `trainanddevelopment_skills`
  MODIFY `trn_skill_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `training_resource`
--
ALTER TABLE `training_resource`
  MODIFY `trn_resource_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `validation`
--
ALTER TABLE `validation`
  MODIFY `validation_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `writeup`
--
ALTER TABLE `writeup`
  MODIFY `writeup_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `writeup_category`
--
ALTER TABLE `writeup_category`
  MODIFY `write_cat_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `writeup_history`
--
ALTER TABLE `writeup_history`
  MODIFY `writeup_hist_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `activity_log`
--
ALTER TABLE `activity_log`
  ADD CONSTRAINT `log_type` FOREIGN KEY (`log_type_id`) REFERENCES `log_type` (`log_id`),
  ADD CONSTRAINT `task_id` FOREIGN KEY (`task_id`) REFERENCES `task_detail` (`task_detail_id`);

--
-- Constraints for table `announcements`
--
ALTER TABLE `announcements`
  ADD CONSTRAINT `department_id` FOREIGN KEY (`dept_id`) REFERENCES `department` (`dept_id`),
  ADD CONSTRAINT `locations_id` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`);

--
-- Constraints for table `department`
--
ALTER TABLE `department`
  ADD CONSTRAINT `locations` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`);

--
-- Constraints for table `employee_certification`
--
ALTER TABLE `employee_certification`
  ADD CONSTRAINT `skill_id` FOREIGN KEY (`skill_id`) REFERENCES `skill` (`skill_id`);

--
-- Constraints for table `employee_certification_history`
--
ALTER TABLE `employee_certification_history`
  ADD CONSTRAINT `emp_cert_id` FOREIGN KEY (`emp_cert_id`) REFERENCES `employee_certification` (`emp_cert_id`);

--
-- Constraints for table `employee_trn_dev_management`
--
ALTER TABLE `employee_trn_dev_management`
  ADD CONSTRAINT `trn_dev_id` FOREIGN KEY (`trn_dev_id`) REFERENCES `trainanddevelopment` (`trn_dev_id`);

--
-- Constraints for table `emp_location`
--
ALTER TABLE `emp_location`
  ADD CONSTRAINT `emp_profile_id` FOREIGN KEY (`emp_profile_id`) REFERENCES `employee_profile` (`employee_profile_id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `location_id` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `interaction`
--
ALTER TABLE `interaction`
  ADD CONSTRAINT `emp_profile` FOREIGN KEY (`emp_profile_id`) REFERENCES `employee_profile` (`employee_profile_id`),
  ADD CONSTRAINT `rank` FOREIGN KEY (`rank`) REFERENCES `rank` (`rank_id`);

--
-- Constraints for table `interaction_history`
--
ALTER TABLE `interaction_history`
  ADD CONSTRAINT `employee_profile` FOREIGN KEY (`emp_profile_id`) REFERENCES `employee_profile` (`employee_profile_id`),
  ADD CONSTRAINT `inter_id` FOREIGN KEY (`inter_id`) REFERENCES `interaction` (`inter_id`);

--
-- Constraints for table `in_service`
--
ALTER TABLE `in_service`
  ADD CONSTRAINT `in_serv_cat_id` FOREIGN KEY (`in_serv_cat_id`) REFERENCES `in_service_category` (`in_serv_cat_id`);

--
-- Constraints for table `notes`
--
ALTER TABLE `notes`
  ADD CONSTRAINT `Foreign` FOREIGN KEY (`type_id`) REFERENCES `notes_type` (`notes_type_id`),
  ADD CONSTRAINT `Foreign Key` FOREIGN KEY (`emp_profile_id`) REFERENCES `employee_profile` (`employee_profile_id`);

--
-- Constraints for table `option_box`
--
ALTER TABLE `option_box`
  ADD CONSTRAINT `field_id` FOREIGN KEY (`field_id`) REFERENCES `form_field` (`field_id`);

--
-- Constraints for table `skill`
--
ALTER TABLE `skill`
  ADD CONSTRAINT `depart_id` FOREIGN KEY (`dept_id`) REFERENCES `department` (`dept_id`);

--
-- Constraints for table `skill_certificate_mapping`
--
ALTER TABLE `skill_certificate_mapping`
  ADD CONSTRAINT `cert_id` FOREIGN KEY (`cert_id`) REFERENCES `certificate_type` (`certificate_type_id`),
  ADD CONSTRAINT `skills` FOREIGN KEY (`skill_id`) REFERENCES `skill` (`skill_id`);

--
-- Constraints for table `trainanddevelopment`
--
ALTER TABLE `trainanddevelopment`
  ADD CONSTRAINT `dept_id` FOREIGN KEY (`dept_id`) REFERENCES `department` (`dept_id`),
  ADD CONSTRAINT `location` FOREIGN KEY (`location_id`) REFERENCES `location` (`location_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
