ALTER TABLE `products` ADD `subtitle` varchar(240) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `products` ADD `features` text;--> statement-breakpoint
ALTER TABLE `products` ADD `images` text;--> statement-breakpoint
ALTER TABLE `products` ADD `stockStatus` enum('in_stock','out_of_stock') DEFAULT 'in_stock' NOT NULL;