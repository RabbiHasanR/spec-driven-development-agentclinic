CREATE TABLE `ailment_therapy` (
	`ailment_id` integer NOT NULL,
	`therapy_id` integer NOT NULL,
	PRIMARY KEY(`ailment_id`, `therapy_id`),
	FOREIGN KEY (`ailment_id`) REFERENCES `ailments`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`therapy_id`) REFERENCES `therapies`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `therapies` (
	`id` integer PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`summary` text NOT NULL,
	`duration_minutes` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `therapies_slug_unique` ON `therapies` (`slug`);