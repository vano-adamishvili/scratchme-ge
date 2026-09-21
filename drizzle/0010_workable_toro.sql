ALTER TABLE `store_settings` ADD `giftStickersImage` text;--> statement-breakpoint
ALTER TABLE `store_settings` ADD `giftStickersActive` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `store_settings` ADD `giftMagnetImage` text;--> statement-breakpoint
ALTER TABLE `store_settings` ADD `giftMagnetActive` int DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE `store_settings` ADD `giftPinImage` text;--> statement-breakpoint
ALTER TABLE `store_settings` ADD `giftPinActive` int DEFAULT 1 NOT NULL;