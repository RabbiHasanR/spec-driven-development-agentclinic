-- Hand-edited: drizzle-kit emitted `ADD ... NOT NULL` with no default, which
-- SQLite refuses on a table with rows. Add it with a placeholder default, then
-- give every existing booking its therapy's length at upgrade time (the best
-- record available). New bookings always set it explicitly.
ALTER TABLE `appointments` ADD `duration_minutes` integer NOT NULL DEFAULT 0;--> statement-breakpoint
UPDATE `appointments` SET `duration_minutes` = (SELECT `duration_minutes` FROM `therapies` WHERE `therapies`.`id` = `appointments`.`therapy_id`);
