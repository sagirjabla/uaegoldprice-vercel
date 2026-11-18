CREATE TABLE "daily_prices" (
	"day" date PRIMARY KEY,
	"gold_open" double precision NOT NULL,
	"gold_high" double precision NOT NULL,
	"gold_low" double precision NOT NULL,
	"gold_close" double precision NOT NULL,
	"silver_close" double precision,
	"source" text DEFAULT 'live' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
