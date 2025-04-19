import { useState, useCallback } from 'react';
import { z } from 'zod';
import { LocalSession, localSessionSchema } from '@shared/schema';

const STORAGE_KEY = 'remoteViewingSessions';

export const useSessionStorage = () => {
  // Function to load all sessions from localStorage
  const loadPracticeSessions = useCallback((): LocalSession[] => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (!storedData) return [];
      
      const parsedData = JSON.parse(storedData);
      
      // Validate the data against the schema
      const result = z.array(localSessionSchema).safeParse(parsedData);
      
      if (!result.success) {
        console.error('Invalid session data in localStorage:', result.error);
        return [];
      }
      
      // Sort by date, newest first
      return result.data.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error('Error loading practice sessions:', error);
      return [];
    }
  }, []);

  // Function to save a new session
  const savePracticeSession = useCallback((
    sessionData: Omit<LocalSession, 'id' | 'createdAt'>
  ): void => {
    try {
      // Generate a unique ID and add timestamp
      const newSession: LocalSession = {
        ...sessionData,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      
      // Get existing sessions and add the new one
      const existingSessions = loadPracticeSessions();
      const updatedSessions = [newSession, ...existingSessions];
      
      // Save back to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSessions));
    } catch (error) {
      console.error('Error saving practice session:', error);
    }
  }, [loadPracticeSessions]);

  // Function to delete a session
  const deletePracticeSession = useCallback((sessionId: string): void => {
    try {
      const existingSessions = loadPracticeSessions();
      const updatedSessions = existingSessions.filter(session => session.id !== sessionId);
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSessions));
    } catch (error) {
      console.error('Error deleting practice session:', error);
    }
  }, [loadPracticeSessions]);

  return {
    loadPracticeSessions,
    savePracticeSession,
    deletePracticeSession
  };
};
