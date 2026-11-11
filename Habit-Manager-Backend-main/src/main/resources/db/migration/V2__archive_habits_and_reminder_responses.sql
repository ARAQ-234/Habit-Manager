ALTER TABLE habits
    ADD COLUMN is_archived BIT(1) NOT NULL DEFAULT b'0';

ALTER TABLE reminders
    ADD COLUMN last_response_date DATE NULL,
    ADD COLUMN last_response_status VARCHAR(16) NULL;
