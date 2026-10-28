CREATE TABLE `ailments` (
	`id` integer PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`summary` text NOT NULL,
	`description` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `ailments_slug_unique` ON `ailments` (`slug`);