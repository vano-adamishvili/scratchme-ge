CREATE TABLE `categories` (
	`id` varchar(32) NOT NULL,
	`label` varchar(80) NOT NULL,
	`labelKa` varchar(120) NOT NULL,
	`blurb` text NOT NULL,
	CONSTRAINT `categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`orderId` int NOT NULL,
	`productId` int NOT NULL,
	`title` varchar(180) NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`unitPrice` decimal(10,2) NOT NULL,
	CONSTRAINT `order_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`reference` varchar(32) NOT NULL,
	`fullName` varchar(160) NOT NULL,
	`phone` varchar(40) NOT NULL,
	`address` text NOT NULL,
	`city` varchar(80) NOT NULL,
	`notes` text,
	`total` decimal(10,2) NOT NULL,
	`paymentMethod` enum('bank_transfer','card') NOT NULL DEFAULT 'bank_transfer',
	`paymentStatus` enum('pending','paid') NOT NULL DEFAULT 'pending',
	`fulfillmentStatus` enum('pending','processing','shipped','completed') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_reference_unique` UNIQUE(`reference`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(160) NOT NULL,
	`title` varchar(180) NOT NULL,
	`titleKa` varchar(220) NOT NULL,
	`categoryId` varchar(32) NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`description` text NOT NULL,
	`imageUrl` text NOT NULL,
	`accent` varchar(16) NOT NULL,
	`stock` int NOT NULL DEFAULT 100,
	`tags` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `store_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bankName` varchar(100) NOT NULL DEFAULT 'TBC Bank',
	`iban` varchar(64) NOT NULL DEFAULT 'GE00TB0000000000000000',
	`receiverName` varchar(160) NOT NULL DEFAULT 'scratchme.ge LLC',
	`shippingFee` decimal(10,2) NOT NULL DEFAULT '5.00',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `store_settings_id` PRIMARY KEY(`id`)
);
