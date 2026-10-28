CREATE TABLE `appointments` (
	`id` integer PRIMARY KEY NOT NULL,
	`reference` text NOT NULL,
	`therapy_id` integer NOT NULL,
	`starts_at` text NOT NULL,
	`agent_name` text NOT NULL,
	`agent_email` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`therapy_id`) REFERENCES `therapies`(`id`) ON UPDATE no action ON DELETE restrict
);
--> statement-breakpoint
CREATE UNIQUE INDEX `appointments_reference_unique` ON `appointments` (`reference`);--> statement-breakpoint
CREATE UNIQUE INDEX `appointments_therapy_slot_unique` ON `appointments` (`therapy_id`,`starts_at`);--> statement-breakpoint
CREATE INDEX `appointments_starts_at_idx` ON `appointments` (`starts_at`);