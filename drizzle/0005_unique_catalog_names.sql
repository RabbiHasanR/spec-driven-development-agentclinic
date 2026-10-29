CREATE UNIQUE INDEX `ailments_name_unique` ON `ailments` (lower("name"));--> statement-breakpoint
CREATE UNIQUE INDEX `therapies_name_unique` ON `therapies` (lower("name"));