ALTER TABLE habits ADD COLUMN category_id INT NULL;
ALTER TABLE habits ADD KEY idx_habits_category_id (category_id);
ALTER TABLE habits ADD CONSTRAINT fk_habits_category FOREIGN KEY (category_id) REFERENCES categories (id);

INSERT INTO categories (name, color_code, created_at)
SELECT seed.name, seed.color_code, CURRENT_TIMESTAMP(6)
FROM (
    SELECT 'Health' AS name, '#4d8b68' AS color_code
    UNION ALL SELECT 'Learning', '#718833'
    UNION ALL SELECT 'Mindfulness', '#8b72a8'
    UNION ALL SELECT 'Fitness', '#bf7a3e'
    UNION ALL SELECT 'Personal', '#587c91'
) seed
WHERE NOT EXISTS (SELECT 1 FROM categories existing WHERE existing.name = seed.name);
