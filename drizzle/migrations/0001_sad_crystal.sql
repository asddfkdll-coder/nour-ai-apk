CREATE TABLE `conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`language` enum('ar','en') NOT NULL DEFAULT 'ar',
	`messageCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`role` enum('user','assistant') NOT NULL,
	`content` text NOT NULL,
	`language` enum('ar','en') NOT NULL DEFAULT 'ar',
	`processingTimeMs` int,
	`tokensUsed` int,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `processingQueries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`inputText` text NOT NULL,
	`taskType` enum('classification','emotion_extraction','summarization','semantic_analysis','generation') NOT NULL,
	`language` enum('ar','en') NOT NULL DEFAULT 'ar',
	`outputText` text,
	`processingTimeMs` int NOT NULL,
	`tokensUsed` int,
	`stealthApplied` boolean NOT NULL DEFAULT false,
	`modelParameters` json,
	`result` json,
	`error` text,
	`status` enum('pending','completed','failed') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `processingQueries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `processingStats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`totalRequests` int NOT NULL DEFAULT 0,
	`successfulRequests` int NOT NULL DEFAULT 0,
	`failedRequests` int NOT NULL DEFAULT 0,
	`totalTokensUsed` int NOT NULL DEFAULT 0,
	`averageProcessingTimeMs` decimal(10,2) DEFAULT '0',
	`lastProcessedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `processingStats_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `systemNotifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`notificationType` enum('request_limit','error_alert','system_info','performance_warning') NOT NULL,
	`isRead` boolean NOT NULL DEFAULT false,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `systemNotifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userSessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sessionToken` varchar(255) NOT NULL,
	`ipAddress` varchar(45),
	`userAgent` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`lastActivityAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `userSessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `userSessions_sessionToken_unique` UNIQUE(`sessionToken`)
);
--> statement-breakpoint
CREATE INDEX `userIdIdx` ON `conversations` (`userId`);--> statement-breakpoint
CREATE INDEX `conversationIdIdx` ON `messages` (`conversationId`);--> statement-breakpoint
CREATE INDEX `userIdIdx_queries` ON `processingQueries` (`userId`);--> statement-breakpoint
CREATE INDEX `taskTypeIdx` ON `processingQueries` (`taskType`);--> statement-breakpoint
CREATE INDEX `statusIdx` ON `processingQueries` (`status`);--> statement-breakpoint
CREATE INDEX `userIdIdx_stats` ON `processingStats` (`userId`);--> statement-breakpoint
CREATE INDEX `userIdIdx_notifications` ON `systemNotifications` (`userId`);--> statement-breakpoint
CREATE INDEX `isReadIdx` ON `systemNotifications` (`isRead`);--> statement-breakpoint
CREATE INDEX `userIdIdx_sessions` ON `userSessions` (`userId`);--> statement-breakpoint
CREATE INDEX `sessionTokenIdx` ON `userSessions` (`sessionToken`);