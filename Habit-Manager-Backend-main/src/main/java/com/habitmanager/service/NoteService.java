package com.habitmanager.service;

import com.habitmanager.entity.Habit;
import com.habitmanager.entity.HabitNote;
import com.habitmanager.repository.HabitNoteRepository;
import com.habitmanager.repository.HabitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class NoteService {
    @Autowired
    private HabitNoteRepository noteRepository;
    @Autowired
    private HabitRepository habitRepository;

    public HabitNote addNote(Integer habitId, String noteText, String username) {
        Habit habit = habitRepository.findByIdAndUser_Username(habitId, username)
                .orElseThrow(() -> new org.springframework.web.server.ResponseStatusException(
                        org.springframework.http.HttpStatus.NOT_FOUND, "Habit not found"));
        HabitNote note = new HabitNote();
        note.setHabit(habit);
        note.setNote(noteText);
        return noteRepository.save(note);
    }
}
