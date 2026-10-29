PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_appointments` (
	`id` integer PRIMARY KEY NOT NULL,
	`reference` text NOT NULL,
	`therapy_id` integer NOT NULL,
	`starts_at` text NOT NULL,
	`agent_name` text NOT NULL,
	`agent_email` text NOT NULL,
	`created_at` text NOT NULL,
	`status` text DEFAULT 'booked' NOT NULL,
	`status_changed_at` text,
	FOREIGN KEY (`therapy_id`) REFERENCES `therapies`(`id`) ON UPDATE no action ON DELETE restrict,
	CONSTRAINT "appointments_status_check" CHECK("status" IN ('booked', 'attended', 'no_show', 'cancelled'))
);
--> statement-breakpoint
-- Hand-edited: drizzle-kit also copied the new status columns, which the old table doesn't have. Existing bookings take the defaults (booked, no change time).
INSERT INTO `__new_appointments`("id", "reference", "therapy_id", "starts_at", "agent_name", "agent_email", "created_at") SELECT "id", "reference", "therapy_id", "starts_at", "agent_name", "agent_email", "created_at" FROM `appointments`;--> statement-breakpoint
DROP TABLE `appointments`;--> statement-breakpoint
ALTER TABLE `__new_appointments` RENAME TO `appointments`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `appointments_reference_unique` ON `appointments` (`reference`);--> statement-breakpoint
CREATE UNIQUE INDEX `appointments_therapy_slot_unique` ON `appointments` (`therapy_id`,`starts_at`) WHERE "appointments"."status" <> 'cancelled';--> statement-breakpoint
CREATE INDEX `appointments_starts_at_idx` ON `appointments` (`starts_at`);