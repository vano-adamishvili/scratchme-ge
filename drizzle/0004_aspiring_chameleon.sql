ALTER TABLE `store_settings` MODIFY COLUMN `iban` varchar(64) NOT NULL DEFAULT '';--> statement-breakpoint
ALTER TABLE `store_settings` MODIFY COLUMN `receiverName` varchar(160) NOT NULL DEFAULT '';--> statement-breakpoint
ALTER TABLE `store_settings` ADD `secondBankName` varchar(100) DEFAULT 'საქართველოს ბანკი' NOT NULL;--> statement-breakpoint
ALTER TABLE `store_settings` ADD `secondIban` varchar(64) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `store_settings` ADD `secondReceiverName` varchar(160) DEFAULT '' NOT NULL;