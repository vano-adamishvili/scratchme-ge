ALTER TABLE `store_settings` ADD `giftStickersNameKa` varchar(160) DEFAULT 'რენდომ 10 სტიკერი' NOT NULL;--> statement-breakpoint
ALTER TABLE `store_settings` ADD `giftStickersNameEn` varchar(160) DEFAULT 'Random set of 10 stickers' NOT NULL;--> statement-breakpoint
ALTER TABLE `store_settings` ADD `giftMagnetNameKa` varchar(160) DEFAULT 'თემატური მისაკრობი მაგნიტი' NOT NULL;--> statement-breakpoint
ALTER TABLE `store_settings` ADD `giftMagnetNameEn` varchar(160) DEFAULT 'Themed magnetic sticker' NOT NULL;--> statement-breakpoint
ALTER TABLE `store_settings` ADD `giftPinNameKa` varchar(160) DEFAULT 'თემატური დასამაგრებელი პინი' NOT NULL;--> statement-breakpoint
ALTER TABLE `store_settings` ADD `giftPinNameEn` varchar(160) DEFAULT 'Themed pin' NOT NULL;