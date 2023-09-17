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
-- Database: `masterdb`
--

-- --------------------------------------------------------

--
-- Table structure for table `account`
--

CREATE TABLE `account` (
  `account_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `onboard_status` int(11) NOT NULL,
  `createdby` int(11) NOT NULL,
  `created_date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `account`
--

INSERT INTO `account` (`account_id`, `name`, `address`, `onboard_status`, `createdby`, `created_date`) VALUES
(1, 'anjali', 'vastral', 1, 1, '0000-00-00 00:00:00'),
(5, 'anjali', 'vastral', 1, 1, '2021-06-07 19:02:43'),
(6, 'anjali', 'vastral', 1, 1, '2021-06-07 19:04:08'),
(7, 'jaina', 'ahmedabad', 1, 1, '2021-06-10 14:07:29'),
(8, 'jaina', 'ahmedabad', 1, 1, '2021-06-10 14:10:44'),
(9, 'jaina', 'ahmedabad', 1, 1, '2021-06-10 14:11:37'),
(10, 'jaina', 'ahmedabad', 1, 1, '2021-06-10 14:14:53'),
(11, 'jaina', 'ahmedabad', 1, 1, '2021-06-14 15:06:29');

-- --------------------------------------------------------

--
-- Table structure for table `account_configuration`
--

CREATE TABLE `account_configuration` (
  `account_config_id` int(11) NOT NULL,
  `account_id` int(11) NOT NULL,
  `document_storage_path` varchar(255) NOT NULL,
  `tenant_db_connection_string` varchar(255) NOT NULL,
  `logo_img` blob NOT NULL,
  `account_theme` varchar(255) NOT NULL,
  `acc_email` varchar(255) NOT NULL,
  `createdby` int(11) NOT NULL,
  `created_date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `account_configuration`
--

INSERT INTO `account_configuration` (`account_config_id`, `account_id`, `document_storage_path`, `tenant_db_connection_string`, `logo_img`, `account_theme`, `acc_email`, `createdby`, `created_date`) VALUES
(3, 5, '', 'mysql://root@localhost/berzansky_macdonald', '', '', 'anjali@gmail.com', 1, '2021-06-07 18:26:19'),
(4, 6, '', 'mysql://root@localhost/berzansky_ymca', '', '', 'anjali@gmail.com', 1, '2021-06-07 19:04:08'),
(5, 9, '', 'mysql://root@localhost/berzanskydatabase1', '', '', 'jiana@gmail.com', 1, '2021-06-10 14:11:37'),
(6, 11, '', 'mysql://root@localhost/t1/GnZZlAQxa1/+r8ia7sg==', '', '', 'jiana@gmail.com', 1, '2021-06-14 15:06:29');

-- --------------------------------------------------------

--
-- Table structure for table `account_onboard`
--

CREATE TABLE `account_onboard` (
  `client_ob_id` int(11) NOT NULL,
  `step_id` int(11) NOT NULL,
  `acc_id` int(11) NOT NULL,
  `status` int(11) NOT NULL,
  `action_date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `account_onboard_status`
--

CREATE TABLE `account_onboard_status` (
  `step_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `code` int(11) NOT NULL,
  `status` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `account_subscription`
--

CREATE TABLE `account_subscription` (
  `sub_id` int(11) NOT NULL,
  `sub_plan_id` int(11) NOT NULL,
  `acc_id` int(11) NOT NULL,
  `seats` int(11) NOT NULL,
  `account_key` varchar(255) NOT NULL,
  `next_payment_date` date NOT NULL,
  `sub_status` varchar(255) NOT NULL,
  `stripe_payment_id` varchar(255) NOT NULL,
  `amount` varchar(255) NOT NULL,
  `payment_status` int(11) NOT NULL,
  `expiry_date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `account_subscription_history`
--

CREATE TABLE `account_subscription_history` (
  `sub_hist_id` int(11) NOT NULL,
  `sub_id` int(11) NOT NULL,
  `sub_plan_id` int(11) NOT NULL,
  `acc_key` varchar(255) NOT NULL,
  `acc_id` int(11) NOT NULL,
  `stripe_payment_id` int(11) NOT NULL,
  `amount` double NOT NULL,
  `payment_date` datetime NOT NULL,
  `expiry_date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `account_user_mapping`
--

CREATE TABLE `account_user_mapping` (
  `account_user_id` int(11) NOT NULL,
  `account_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `isMainContent` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `account_user_mapping`
--

INSERT INTO `account_user_mapping` (`account_user_id`, `account_id`, `user_id`, `isMainContent`) VALUES
(1, 5, 3, 0),
(3, 5, 7, 0),
(4, 5, 8, 0),
(5, 5, 9, 0),
(6, 5, 10, 0),
(7, 5, 11, 0);

-- --------------------------------------------------------

--
-- Table structure for table `subscription_plan`
--

CREATE TABLE `subscription_plan` (
  `sub_plan_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) NOT NULL,
  `bill_interval` int(11) NOT NULL,
  `cost` double NOT NULL,
  `seats` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `system_log`
--

CREATE TABLE `system_log` (
  `system_log_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `account_id` int(11) NOT NULL,
  `url` varchar(255) NOT NULL,
  `ip_address` varchar(255) NOT NULL,
  `error_code` varchar(255) NOT NULL,
  `error_message` varchar(255) NOT NULL,
  `useragent` varchar(255) NOT NULL,
  `datetime` datetime NOT NULL,
  `stack_trace` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `system_log`
--

INSERT INTO `system_log` (`system_log_id`, `user_id`, `account_id`, `url`, `ip_address`, `error_code`, `error_message`, `useragent`, `datetime`, `stack_trace`) VALUES
(15, 0, 0, 'http://localhost:8080/login', '127.0.0.1', '400', 'Validation Error', '', '2021-06-18 19:20:29', '{\"password\":{\"message\":\"password is a required field\",\"context\":\"password\",\"type\":\"any.required\"}}'),
(16, 0, 0, 'http://localhost:8080/login', '127.0.0.1', '400', 'Validation Error', '', '2021-06-18 19:29:23', '{\"password\":{\"message\":\"password is a required field\",\"context\":\"password\",\"type\":\"any.required\"}}'),
(17, 0, 0, 'http://localhost:8080/login', '127.0.0.1', '400', 'incorrect username or password', '', '2021-06-18 19:29:32', ''),
(18, 3, 5, 'http://localhost:8080/', '127.0.0.1', '404', 'User with this email is already exists', '', '2021-06-18 19:31:42', ''),
(19, 0, 0, '/ert', '127.0.0.1', '404', '', '', '2021-06-18 19:31:56', '');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `first_name` varchar(255) NOT NULL,
  `middle_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `address` varchar(255) NOT NULL,
  `date_of_birth` date NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `createdby` int(11) NOT NULL,
  `created_date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `username`, `password`, `email`, `first_name`, `middle_name`, `last_name`, `address`, `date_of_birth`, `is_active`, `createdby`, `created_date`) VALUES
(1, 'test', '$2b$10$wwQ7UzzXP4db3HdLn7oiveDeD7da3gxx/h4/tfUMBOuhq8R3hTg.S', 'anjali@gmail.com', '', '', '', '', '0000-00-00', 1, 1, '2021-06-04 00:00:00'),
(2, 'test12', '$2b$10$wwQ7UzzXP4db3HdLn7oiveDeD7da3gxx/h4/tfUMBOuhq8R3hTg.S', 'test1911@synoptek.com', '', '', '', '', '0000-00-00', 1, 1, '2021-06-08 13:29:43'),
(3, 'jainat', '$2b$10$wwQ7UzzXP4db3HdLn7oiveDeD7da3gxx/h4/tfUMBOuhq8R3hTg.S', 'jaina@gmail.com', 'jaina', 'sanjay', 'trivedi', 'ahmedabad gujarat', '1999-04-15', 1, 1, '2021-06-08 13:54:46'),
(4, 'test12334', '$2b$10$Ue3dl9mZyyqNwBtP4zGPZ.GdmbTMkQHsbaOycb3emk9BBp4hFEL2S', 'test195@synoptek.com', '', '', '', '', '0000-00-00', 1, 1, '2021-06-08 18:56:41'),
(5, 'anjali', '$2b$10$TGAYNMJLMVuy3w9aQ.Hia.vIkq/B.rZHW7iz3CmvGCWyBjkGnF5Na', 'angupta12@synoptek.com', 'anjali', 'sanjay', 'gupta', 'ahmedabad gujarat', '1999-04-15', 1, 3, '2021-06-11 13:00:47'),
(6, 'anjali', '$2b$10$O0C1cLFTfQvaDWFc/YXJt.5IUbHNAXyVh4vPL1ekcCo/O3l/rqaNa', 'angupta@synoptek.com', 'anjali', 'sanjay', 'gupta', 'ahmedabad gujarat', '1999-04-15', 1, 3, '2021-06-11 13:13:10'),
(7, 'jianat', '$2b$10$pKhHlpiM2srl/6NVxvMlJ.H4qgjx3JCdX8rXxgw7qhzMH4NFTLqO6', 'jtrivedi@synoptek.com', 'jiana', 'd', 'trivedi', 'ahmedabad gujarat', '1998-04-15', 1, 3, '2021-06-14 17:04:00'),
(8, 'jianat', '$2b$10$NQyXA3p9Sv16pIxIWbzu8.9I8E.V45LngblsSMPtRQS5zKVoPrLOK', 'jtrivedi123@synoptek.com', 'jiana', 'd', 'trivedi', 'ahmedabad gujarat', '1998-04-15', 1, 7, '2021-06-17 11:50:05'),
(9, 'jianat', '$2b$10$TVMWH3dQ1o7clbcg.oAOguuemqA/1gtk52zYbdrViAKwioLQvKCL6', 'jtrivedi123456@synoptek.com', 'jiana', 'd', 'trivedi', 'ahmedabad gujarat', '1998-04-15', 1, 7, '2021-06-17 13:23:40'),
(10, 'jianat', '$2b$10$NFs3WtYEpNdNN2xUPGi7aOxyLrlcaNPs4MIXBplXLbgU4uX/5r/5e', 'jtrivedi123456s@synoptek.com', 'jiana', 'd', 'trivedi', 'ahmedabad gujarat', '1998-04-15', 1, 7, '2021-06-17 13:44:14'),
(11, 'jianat', '$2b$10$Bx/kJCbT0r6PSqxycFpXI.LGuWeFSVJjRYI2x6kA7mGde2YD/Ike.', 'jt@synoptek.com', 'jiana', 'd', 'trivedi', 'ahmedabad gujarat', '1998-04-15', 1, 7, '2021-06-17 20:43:31');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `account`
--
ALTER TABLE `account`
  ADD PRIMARY KEY (`account_id`);

--
-- Indexes for table `account_configuration`
--
ALTER TABLE `account_configuration`
  ADD PRIMARY KEY (`account_config_id`),
  ADD KEY `accou_id` (`account_id`);

--
-- Indexes for table `account_onboard`
--
ALTER TABLE `account_onboard`
  ADD PRIMARY KEY (`client_ob_id`);

--
-- Indexes for table `account_onboard_status`
--
ALTER TABLE `account_onboard_status`
  ADD PRIMARY KEY (`step_id`);

--
-- Indexes for table `account_subscription`
--
ALTER TABLE `account_subscription`
  ADD PRIMARY KEY (`sub_id`),
  ADD KEY `account_id` (`acc_id`),
  ADD KEY `sub_plan_id` (`sub_plan_id`);

--
-- Indexes for table `account_subscription_history`
--
ALTER TABLE `account_subscription_history`
  ADD PRIMARY KEY (`sub_hist_id`),
  ADD KEY `sub_id` (`sub_id`),
  ADD KEY `sub_plan` (`sub_plan_id`);

--
-- Indexes for table `account_user_mapping`
--
ALTER TABLE `account_user_mapping`
  ADD PRIMARY KEY (`account_user_id`),
  ADD KEY `acc_id` (`account_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `subscription_plan`
--
ALTER TABLE `subscription_plan`
  ADD PRIMARY KEY (`sub_plan_id`);

--
-- Indexes for table `system_log`
--
ALTER TABLE `system_log`
  ADD PRIMARY KEY (`system_log_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `account`
--
ALTER TABLE `account`
  MODIFY `account_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `account_configuration`
--
ALTER TABLE `account_configuration`
  MODIFY `account_config_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `account_onboard`
--
ALTER TABLE `account_onboard`
  MODIFY `client_ob_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `account_onboard_status`
--
ALTER TABLE `account_onboard_status`
  MODIFY `step_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `account_subscription`
--
ALTER TABLE `account_subscription`
  MODIFY `sub_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `account_subscription_history`
--
ALTER TABLE `account_subscription_history`
  MODIFY `sub_hist_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `account_user_mapping`
--
ALTER TABLE `account_user_mapping`
  MODIFY `account_user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `subscription_plan`
--
ALTER TABLE `subscription_plan`
  MODIFY `sub_plan_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `system_log`
--
ALTER TABLE `system_log`
  MODIFY `system_log_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `account_configuration`
--
ALTER TABLE `account_configuration`
  ADD CONSTRAINT `accou_id` FOREIGN KEY (`account_id`) REFERENCES `account` (`account_id`);

--
-- Constraints for table `account_subscription`
--
ALTER TABLE `account_subscription`
  ADD CONSTRAINT `account_id` FOREIGN KEY (`acc_id`) REFERENCES `account` (`account_id`),
  ADD CONSTRAINT `sub_plan_id` FOREIGN KEY (`sub_plan_id`) REFERENCES `subscription_plan` (`sub_plan_id`);

--
-- Constraints for table `account_subscription_history`
--
ALTER TABLE `account_subscription_history`
  ADD CONSTRAINT `sub_id` FOREIGN KEY (`sub_id`) REFERENCES `account_subscription` (`sub_id`),
  ADD CONSTRAINT `sub_plan` FOREIGN KEY (`sub_plan_id`) REFERENCES `subscription_plan` (`sub_plan_id`);

--
-- Constraints for table `account_user_mapping`
--
ALTER TABLE `account_user_mapping`
  ADD CONSTRAINT `acc_id` FOREIGN KEY (`account_id`) REFERENCES `account` (`account_id`),
  ADD CONSTRAINT `user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
