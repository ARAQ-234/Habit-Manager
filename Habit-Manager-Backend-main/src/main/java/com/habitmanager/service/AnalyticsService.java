package com.habitmanager.service;

import com.habitmanager.entity.Habit;
import com.habitmanager.entity.HabitLog;
import com.habitmanager.repository.HabitLogRepository;
import com.habitmanager.repository.HabitRepository;
import com.habitmanager.repository.UserRepository;
import com.habitmanager.entity.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@Service
public class AnalyticsService {

    @Autowired
    private HabitLogRepository logRepository;
    @Autowired
    private HabitRepository habitRepository;
    @Autowired
    private UserRepository userRepository;

    public Map<String, Object> getWeeklyAnalytics(Integer habitId, String username) {
        Habit habit = habitRepository.findByIdAndUser_Username(habitId, username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Habit not found"));
        LocalDate endDate = LocalDate.now(ZoneId.of(habit.getUser().getTimeZone()));
        LocalDate startDate = endDate.minusDays(6);
        List<HabitLog> logs = logRepository.findByHabitAndCheckInDateBetween(habit, startDate, endDate);
        return summarize(habit, logs, startDate, endDate);
    }

    public Map<Integer, Map<String, Object>> getWeeklyAnalyticsForUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Account not found"));
        LocalDate endDate = LocalDate.now(ZoneId.of(user.getTimeZone()));
        LocalDate startDate = endDate.minusDays(6);
        List<Habit> habits = habitRepository.findByUserAndArchived(user, false);
        List<HabitLog> allLogs = logRepository.findByHabit_UserAndCheckInDateBetweenOrderByCheckInDateAsc(user, startDate, endDate);
        Map<Integer, List<HabitLog>> logsByHabit = new HashMap<>();
        for (HabitLog log : allLogs) logsByHabit.computeIfAbsent(log.getHabit().getId(), ignored -> new ArrayList<>()).add(log);
        Map<Integer, Map<String, Object>> result = new LinkedHashMap<>();
        for (Habit habit : habits) result.put(habit.getId(), summarize(habit, logsByHabit.getOrDefault(habit.getId(), List.of()), startDate, endDate));
        return result;
    }

    public Map<String, Object> getMonthlyAnalyticsForUser(String username, Integer requestedYear, Integer requestedMonth) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Account not found"));
        LocalDate today = LocalDate.now(ZoneId.of(user.getTimeZone()));
        YearMonth currentMonth = YearMonth.from(today);
        YearMonth month;
        try {
            month = requestedYear == null && requestedMonth == null
                    ? currentMonth
                    : YearMonth.of(requestedYear, requestedMonth);
        } catch (java.time.DateTimeException exception) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose a valid year and month");
        }
        if (month.isAfter(currentMonth)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Future months are not available");
        }

        LocalDate monthStart = month.atDay(1);
        LocalDate monthEnd = month.atEndOfMonth();
        LocalDate asOfDate = month.equals(currentMonth) ? today : monthEnd;
        List<Habit> habits = habitRepository.findByUserAndArchived(user, false);
        List<HabitLog> logs = logRepository.findByHabit_UserAndCheckInDateBetweenOrderByCheckInDateAsc(user, monthStart, monthEnd);
        Map<Integer, Map<LocalDate, HabitLog>> logsByHabit = new HashMap<>();
        for (HabitLog log : logs) {
            logsByHabit.computeIfAbsent(log.getHabit().getId(), ignored -> new HashMap<>())
                    .put(log.getCheckInDate(), log);
        }

        List<Map<String, Object>> weekSummaries = new ArrayList<>();
        int[] weekGoals = new int[4];
        int[] weekCompleted = new int[4];
        for (int week = 0; week < 4; week++) {
            int fromDay = week * 7 + 1;
            int toDay = week == 3 ? month.lengthOfMonth() : Math.min(month.lengthOfMonth(), fromDay + 6);
            Map<String, Object> weekInfo = new LinkedHashMap<>();
            weekInfo.put("week", week + 1);
            weekInfo.put("fromDay", fromDay);
            weekInfo.put("toDay", toDay);
            weekSummaries.add(weekInfo);
        }

        List<Map<String, Object>> habitSummaries = new ArrayList<>();
        int totalGoals = 0;
        int totalCompleted = 0;
        for (Habit habit : habits) {
            int scheduledCount = 0;
            int completedCount = 0;
            List<String> dayStates = new ArrayList<>();
            List<Integer> dayCounts = new ArrayList<>();
            Map<LocalDate, HabitLog> habitLogs = logsByHabit.getOrDefault(habit.getId(), Map.of());

            for (int day = 1; day <= month.lengthOfMonth(); day++) {
                LocalDate date = month.atDay(day);
                int weekIndex = Math.min(3, (day - 1) / 7);
                boolean activeForDate = (habit.getCreatedAt() == null || !date.isBefore(habit.getCreatedAt().toLocalDate()))
                        && habit.isScheduledOn(date);
                if (!activeForDate) {
                    dayStates.add("NONE");
                    dayCounts.add(null);
                    continue;
                }

                HabitLog log = habitLogs.get(date);
                if (date.isAfter(asOfDate)) {
                    dayStates.add("UPCOMING");
                    dayCounts.add(null);
                    continue;
                }

                scheduledCount++;
                weekGoals[weekIndex]++;
                if (log != null && log.getStatus() == com.habitmanager.entity.LogStatus.SUCCESS) {
                    completedCount++;
                    weekCompleted[weekIndex]++;
                    dayStates.add("COMPLETE");
                } else if (log != null && log.getCompletedCount() != null && log.getCompletedCount() > 0) {
                    dayStates.add("PARTIAL");
                } else {
                    dayStates.add("MISSED");
                }
                dayCounts.add(log == null ? 0 : log.getCompletedCount());
            }

            int leftCount = Math.max(0, scheduledCount - completedCount);
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("id", habit.getId());
            item.put("title", habit.getTitle());
            item.put("goalCount", habit.getGoalCount() == null ? 1 : habit.getGoalCount());
            item.put("unit", habit.getUnit() == null ? "" : habit.getUnit());
            item.put("scheduledCount", scheduledCount);
            item.put("completedCount", completedCount);
            item.put("leftCount", leftCount);
            item.put("completionPercent", scheduledCount == 0 ? 0 : Math.round(completedCount * 100.0 / scheduledCount));
            item.put("dayStates", dayStates);
            item.put("dayCounts", dayCounts);
            habitSummaries.add(item);
            totalGoals += scheduledCount;
            totalCompleted += completedCount;
        }

        for (int index = 0; index < weekSummaries.size(); index++) {
            Map<String, Object> week = weekSummaries.get(index);
            int goals = weekGoals[index];
            int completed = weekCompleted[index];
            week.put("totalGoals", goals);
            week.put("completedGoals", completed);
            week.put("completionPercent", goals == 0 ? 0 : Math.round(completed * 100.0 / goals));
        }

        List<Map<String, Object>> topHabits = habitSummaries.stream()
                .sorted(Comparator.<Map<String, Object>>comparingInt(item -> ((Number) item.get("completionPercent")).intValue())
                        .reversed().thenComparing(Comparator.comparingInt((Map<String, Object> item) -> ((Number) item.get("completedCount")).intValue()).reversed()))
                .limit(10).toList();

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("year", month.getYear());
        response.put("month", month.getMonthValue());
        response.put("monthLabel", month.getMonth().getDisplayName(java.time.format.TextStyle.FULL, Locale.ENGLISH) + " " + month.getYear());
        response.put("daysInMonth", month.lengthOfMonth());
        response.put("asOfDate", asOfDate.toString());
        response.put("totalGoals", totalGoals);
        response.put("completedGoals", totalCompleted);
        response.put("leftGoals", Math.max(0, totalGoals - totalCompleted));
        response.put("completionPercent", totalGoals == 0 ? 0 : Math.round(totalCompleted * 100.0 / totalGoals));
        response.put("weeks", weekSummaries);
        response.put("habits", habitSummaries);
        response.put("topHabits", topHabits);
        return response;
    }

    private Map<String, Object> summarize(Habit habit, List<HabitLog> logs, LocalDate startDate, LocalDate endDate) {
        
        // Map date -> completedCount (default 0)
        Map<LocalDate, Integer> completedMap = new HashMap<>();
        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            completedMap.put(date, 0);
        }
        for (HabitLog log : logs) {
            completedMap.put(log.getCheckInDate(), log.getCompletedCount());
        }
        
        // Prepare response with labels, completed values, remaining values
        List<String> labels = new ArrayList<>();
        List<Boolean> scheduledDays = new ArrayList<>();
        List<Double> completedPercent = new ArrayList<>();
        List<Double> remainingPercent = new ArrayList<>();
        List<Double> completedRaw = new ArrayList<>();
        List<Double> remainingRaw = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("EEE");
        
        int goal = Math.max(1, habit.getGoalCount() == null ? 1 : habit.getGoalCount());
        for (LocalDate date = startDate; !date.isAfter(endDate); date = date.plusDays(1)) {
            labels.add(date.format(formatter));
            boolean created = habit.getCreatedAt() == null || !date.isBefore(habit.getCreatedAt().toLocalDate());
            boolean scheduled = created && habit.isScheduledOn(date);
            scheduledDays.add(scheduled);
            int comp = scheduled ? completedMap.get(date) : 0;
            double compPercent = scheduled ? Math.min(100.0, (comp * 100.0) / goal) : 0.0;
            double remPercent = 100.0 - compPercent;
            completedPercent.add(compPercent);
            remainingPercent.add(scheduled ? remPercent : 0.0);
            completedRaw.add(scheduled ? (double) comp : null);
            remainingRaw.add(scheduled ? (double) Math.max(0, goal - comp) : null);
        }
        
        // Calculate weekly average completion percentage
        double avgPercent = scheduledDays.stream().filter(Boolean::booleanValue).count() == 0 ? 0.0
                : completedPercent.stream().filter(Objects::nonNull).mapToDouble(Double::doubleValue).sum()
                / scheduledDays.stream().filter(Boolean::booleanValue).count();
        
        Map<String, Object> response = new HashMap<>();
        response.put("habitId", habit.getId());
        response.put("labels", labels);
        response.put("scheduledDays", scheduledDays);
        response.put("completedPercent", completedPercent);
        response.put("remainingPercent", remainingPercent);
        response.put("completedRaw", completedRaw);
        response.put("remainingRaw", remainingRaw);
        response.put("averageCompletion", avgPercent);
        response.put("goal", goal);
        response.put("unit", habit.getUnit() != null ? habit.getUnit() : "");
        return response;
    }
}
