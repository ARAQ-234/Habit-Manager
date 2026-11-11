CREATE TABLE users (
    id INT NOT NULL AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at DATETIME(6) NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_users_username (username),
    UNIQUE KEY uk_users_email (email)
) ENGINE=InnoDB;

CREATE TABLE categories (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NULL,
    color_code VARCHAR(255) NULL,
    created_at DATETIME(6) NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB;

CREATE TABLE habits (
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(120) NOT NULL,
    description VARCHAR(2000) NULL,
    frequency VARCHAR(20) NOT NULL,
    goal_count INT NULL,
    unit VARCHAR(255) NULL,
    scheduled_values VARCHAR(255) NULL,
    end_date DATE NULL,
    created_at DATETIME(6) NULL,
    updated_at DATETIME(6) NULL,
    PRIMARY KEY (id),
    KEY idx_habits_user_id (user_id),
    CONSTRAINT fk_habits_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB;

CREATE TABLE habit_logs (
    id INT NOT NULL AUTO_INCREMENT,
    habit_id INT NOT NULL,
    check_in_date DATE NULL,
    completed_count INT NULL,
    status VARCHAR(255) NULL,
    created_at DATETIME(6) NULL,
    deleted_at DATETIME(6) NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_habit_logs_habit_date (habit_id, check_in_date),
    KEY idx_habit_logs_check_in_date (check_in_date),
    CONSTRAINT fk_habit_logs_habit FOREIGN KEY (habit_id) REFERENCES habits (id)
) ENGINE=InnoDB;

CREATE TABLE habit_notes (
    id INT NOT NULL AUTO_INCREMENT,
    habit_id INT NOT NULL,
    note TEXT NULL,
    created_at DATETIME(6) NULL,
    updated_at DATETIME(6) NULL,
    PRIMARY KEY (id),
    KEY idx_habit_notes_habit_id (habit_id),
    CONSTRAINT fk_habit_notes_habit FOREIGN KEY (habit_id) REFERENCES habits (id)
) ENGINE=InnoDB;

CREATE TABLE habit_schedules (
    id INT NOT NULL AUTO_INCREMENT,
    habit_id INT NOT NULL,
    day_of_week VARCHAR(255) NULL,
    day_of_month INT NULL,
    reminder_time TIME(6) NULL,
    PRIMARY KEY (id),
    KEY idx_habit_schedules_habit_id (habit_id),
    CONSTRAINT fk_habit_schedules_habit FOREIGN KEY (habit_id) REFERENCES habits (id)
) ENGINE=InnoDB;

CREATE TABLE reminders (
    id BIGINT NOT NULL AUTO_INCREMENT,
    habit_id INT NOT NULL,
    reminder_time TIME(6) NULL,
    days_of_week VARCHAR(255) NULL,
    is_active BIT NULL,
    created_at DATETIME(6) NULL,
    last_sent_at DATETIME(6) NULL,
    PRIMARY KEY (id),
    KEY idx_reminders_active_time (is_active, reminder_time),
    KEY idx_reminders_habit_id (habit_id),
    CONSTRAINT fk_reminders_habit FOREIGN KEY (habit_id) REFERENCES habits (id)
) ENGINE=InnoDB;

CREATE TABLE reminder_records (
    id BIGINT NOT NULL AUTO_INCREMENT,
    habit_id INT NOT NULL,
    user_id INT NOT NULL,
    scheduled_time DATETIME(6) NULL,
    status VARCHAR(255) NULL,
    created_at DATETIME(6) NULL,
    PRIMARY KEY (id),
    KEY idx_reminder_records_habit_id (habit_id),
    KEY idx_reminder_records_user_id (user_id),
    CONSTRAINT fk_reminder_records_habit FOREIGN KEY (habit_id) REFERENCES habits (id),
    CONSTRAINT fk_reminder_records_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB;

CREATE TABLE history_logs (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    action VARCHAR(255) NULL,
    details VARCHAR(255) NULL,
    timestamp DATETIME(6) NULL,
    PRIMARY KEY (id),
    KEY idx_history_logs_user_timestamp (user_id, timestamp),
    CONSTRAINT fk_history_logs_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB;
