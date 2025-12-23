CREATE TABLE "settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" text NOT NULL,
	"soundEnabled" boolean DEFAULT true NOT NULL,
	"browserNotificationsEnabled" boolean DEFAULT true NOT NULL,
	"highValueThreshold" integer DEFAULT 100 NOT NULL,
	"activitySpikeMultiplier" integer DEFAULT 2 NOT NULL,
	"createdAt" timestamp DEFAULT now(),
	"updatedAt" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "settings" ADD CONSTRAINT "settings_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "settings_userId_unique" ON "settings" USING btree ("userId");