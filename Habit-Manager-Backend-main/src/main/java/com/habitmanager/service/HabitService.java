package com.habitmanager.service;

import com.habitmanager.dao.HabitDAO;
import com.habitmanager.entity.Habit;
import com.habitmanager.entity.User;
import com.habitmanager.repository.HabitRepository;
import com.habitmanager.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import com.habitmanager.repository.HabitLogRepository;
import com.habitmanager.repository.HabitNoteRepository;
import com.habitmanager.repository.HabitScheduleRepository;
import com.habitmanager.repository.ReminderRecordRepository;
import com.habitmanager.repository.ReminderRepository;
import java.util.Arrays;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class HabitService {

    @Autowired private HabitRepository habitRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private com.habitmanager.repository.CategoryRepository categoryRepository;
    @Autowired private HistoryService historyService;
    @Autowired private HabitLogRepository logRepository;
    @Autowired private HabitNoteRepository noteRepository;
    @Autowired private HabitScheduleRepository scheduleRepository;
    @Autowired private ReminderRepository reminderRepository;
    @Autowired private ReminderRecordRepository reminderRecordRepository;

    public Habit createHabit(HabitDAO dao, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));

        Habit habit = new Habit();
        habit.setUser(user);
        habit.setTitle(dao.getTitle());
        habit.setDescription(dao.getDescription());
        habit.setFrequency(normalizeFrequency(dao.getFrequency()));
        habit.setGoalCount(dao.getGoalCount());
        habit.setUnit(dao.getUnit());
        habit.setScheduledValues(normalizeSchedule(dao.getFrequency(), dao.getScheduledValues()));
        habit.setEndDate(dao.getEndDate());
        habit.setCategory(resolveCategory(dao.getCategoryId(), user.getId()));
        habit.setArchived(false);

        Habit saved = habitRepository.save(habit);
        historyService.logAction(user, "CREATED", "Habit '" + saved.getTitle() + "' created");
        return saved;
    }

    public List<Habit> getUserHabits(String username, boolean archived) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found: " + username));
        return habitRepository.findByUserAndArchived(user, archived);
    }

    @Transactional
    public Habit updateHabit(Integer id, HabitDAO dao, String username) {
        Habit habit = habitRepository.findByIdAndUser_Username(id, username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Habit not found"));
        if (habit.isArchived()) throw new ResponseStatusException(HttpStatus.CONFLICT, "Restore this habit before editing it");
        habit.setTitle(dao.getTitle());
        habit.setDescription(dao.getDescription());
        habit.setFrequency(normalizeFrequency(dao.getFrequency()));
        habit.setGoalCount(dao.getGoalCount());
        habit.setUnit(dao.getUnit());
        habit.setScheduledValues(normalizeSchedule(dao.getFrequency(), dao.getScheduledValues()));
        habit.setEndDate(dao.getEndDate());
        habit.setCategory(resolveCategory(dao.getCategoryId(), habit.getUser().getId()));
        Habit updated = habitRepository.save(habit);
        historyService.logAction(habit.getUser(), "UPDATED", "Habit '" + habit.getTitle() + "' updated");
        return updated;
    }

    @Transactional
    public Habit setArchived(Integer id, boolean archived, String username) {
        Habit habit = habitRepository.findByIdAndUser_Username(id, username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Habit not found"));
        habit.setArchived(archived);
        historyService.logAction(habit.getUser(), archived ? "ARCHIVED" : "RESTORED",
                "Habit '" + habit.getTitle() + "' " + (archived ? "archived" : "restored"));
        return habitRepository.save(habit);
    }

    @Transactional
    public void deleteHabit(Integer id, String username) {
        Habit habit = habitRepository.findByIdAndUser_Username(id, username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Habit not found"));
        User user = habit.getUser();
        historyService.logAction(user, "DELETED", "Habit '" + habit.getTitle() + "' deleted");
        logRepository.deleteByHabit_Id(id);
        noteRepository.deleteByHabit_Id(id);
        scheduleRepository.deleteByHabit_Id(id);
        reminderRepository.deleteByHabit_Id(id);
        reminderRecordRepository.deleteByHabit_Id(id);
        habitRepository.deleteById(id);
    }

    private String normalizeFrequency(String frequency) {
        return frequency.trim().toUpperCase(Locale.ROOT);
    }

    private com.habitmanager.entity.Category resolveCategory(Integer categoryId, Integer userId) {
        if (categoryId == null) return null;
        com.habitmanager.entity.Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category not found"));
        if (category.getUserId() != null && !category.getUserId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category not found");
        }
        return category;
    }

    private String normalizeSchedule(String frequency, String values) {
        String normalizedFrequency = normalizeFrequency(frequency);
        if ("DAILY".equals(normalizedFrequency)) return "";
        Set<String> valuesSet = Arrays.stream(values == null ? new String[0] : values.split(","))
                .map(String::trim).map(value -> value.toUpperCase(Locale.ROOT))
                .filter(value -> !value.isEmpty()).collect(Collectors.toSet());
        if ("WEEKLY".equals(normalizedFrequency)) {
            Set<String> allowed = Set.of("MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN");
            if (valuesSet.isEmpty() || !allowed.containsAll(valuesSet)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Weekly habits require valid weekdays");
            }
            return List.of("MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN").stream()
                    .filter(valuesSet::contains).collect(Collectors.joining(","));
        } else if ("MONTHLY".equals(normalizedFrequency)) {
            if (valuesSet.isEmpty() || valuesSet.stream().anyMatch(value -> {
                try { int day = Integer.parseInt(value); return day < 1 || day > 31; }
                catch (NumberFormatException exception) { return true; }
            })) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Monthly habits require dates from 1 to 31");
            }
            return valuesSet.stream().sorted(java.util.Comparator.comparingInt(Integer::parseInt)).collect(Collectors.joining(","));
        }
        return "";
    }
}
