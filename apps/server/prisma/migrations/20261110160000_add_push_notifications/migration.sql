CREATE TABLE "push_installations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" INTEGER NOT NULL,
    "installation_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "last_seen_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "push_installations_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "push_installations_user_id_fkey"
        FOREIGN KEY ("user_id") REFERENCES "Users"("userId") ON DELETE CASCADE,
    CONSTRAINT "push_installations_installation_id_key" UNIQUE ("installation_id")
);

CREATE TABLE "notifications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" INTEGER NOT NULL,
    "type" VARCHAR(100) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "body" TEXT NOT NULL,
    "data" JSONB NOT NULL DEFAULT '{}',
    "read_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "notifications_user_id_fkey"
        FOREIGN KEY ("user_id") REFERENCES "Users"("userId") ON DELETE CASCADE
);

CREATE INDEX "idx_notifications_user_created"
    ON "notifications"("user_id", "created_at" DESC);

CREATE TABLE "notification_deliveries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "notification_id" UUID NOT NULL,
    "installation_id" TEXT NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "provider_message_id" TEXT,
    "error_code" TEXT,
    "attempted_at" TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT "notification_deliveries_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "notification_deliveries_notification_id_fkey"
        FOREIGN KEY ("notification_id") REFERENCES "notifications"("id") ON DELETE CASCADE,
    CONSTRAINT "notification_deliveries_installation_id_fkey"
        FOREIGN KEY ("installation_id") REFERENCES "push_installations"("installation_id") ON DELETE CASCADE
);
