ALTER TABLE categories ADD COLUMN icon_key VARCHAR(40) NULL;
ALTER TABLE categories ADD COLUMN user_id INT NULL;
ALTER TABLE categories ADD KEY idx_categories_user_id (user_id);
ALTER TABLE categories ADD CONSTRAINT fk_categories_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE;
