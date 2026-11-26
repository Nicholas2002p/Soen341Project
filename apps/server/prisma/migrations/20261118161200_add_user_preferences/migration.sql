CREATE TABLE "user_preferences" (
    "user_id" INTEGER NOT NULL,
    "key" VARCHAR(100) NOT NULL,
    "value" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "user_preferences_pkey" PRIMARY KEY ("user_id", "key"),
    CONSTRAINT "user_preferences_user_id_fkey"
        FOREIGN KEY ("user_id") REFERENCES "Users"("userId") ON DELETE CASCADE
);

CREATE INDEX "user_preferences_key_idx" ON "user_preferences"("key");
