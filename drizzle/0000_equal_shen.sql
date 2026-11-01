CREATE TABLE `payments` (
	`id` text PRIMARY KEY NOT NULL,
	`invoice` text NOT NULL,
	`amount` integer NOT NULL,
	`date` text NOT NULL,
	`method` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `records` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`data` text NOT NULL
);
