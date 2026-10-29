-- Hand-edited: names that differ only in case would make the unique indexes
-- fail and the upgrade abort. Keep the oldest of each group as it is and add
-- the row id to the others ("foo" -> "foo (12)") so staff can tidy them up.
UPDATE `ailments` SET `name` = `name` || ' (' || `id` || ')' WHERE `id` NOT IN (SELECT min(`id`) FROM `ailments` GROUP BY lower(`name`));--> statement-breakpoint
UPDATE `therapies` SET `name` = `name` || ' (' || `id` || ')' WHERE `id` NOT IN (SELECT min(`id`) FROM `therapies` GROUP BY lower(`name`));--> statement-breakpoint
CREATE UNIQUE INDEX `ailments_name_unique` ON `ailments` (lower("name"));--> statement-breakpoint
CREATE UNIQUE INDEX `therapies_name_unique` ON `therapies` (lower("name"));
