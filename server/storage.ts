import { users, type User, type InsertUser, sessions, type Session, type InsertSession } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";
import connectPg from "connect-pg-simple";
import session from "express-session";

// Define the storage interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Session operations
  getSession(id: number): Promise<Session | undefined>;
  getSessions(): Promise<Session[]>;
  getSessionsByCategory(category: string): Promise<Session[]>;
  getUserSessions(userId: number): Promise<Session[]>;
  createSession(session: InsertSession): Promise<Session>;
  deleteSession(id: number): Promise<boolean>;
  
  // Statistics
  getSessionStats(): Promise<{
    totalSessions: number;
    hitRate: number;
    byCategory: {category: string, count: number, hitRate: number}[];
  }>;
  
  // Session store for authentication
  sessionStore: session.Store;
}

// PostgreSQL session store
const PostgresSessionStore = connectPg(session);

// Database storage implementation
export class DatabaseStorage implements IStorage {
  public sessionStore: session.Store;
  
  constructor() {
    // Initialize session store for authentication
    this.sessionStore = new PostgresSessionStore({
      conObject: {
        connectionString: process.env.DATABASE_URL,
      },
      createTableIfMissing: true
    });
  }
  
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  
  // Session operations
  async getSession(id: number): Promise<Session | undefined> {
    const [session] = await db.select().from(sessions).where(eq(sessions.id, id));
    return session;
  }

  async getSessions(): Promise<Session[]> {
    return await db.select().from(sessions).orderBy(desc(sessions.createdAt));
  }
  
  async getSessionsByCategory(category: string): Promise<Session[]> {
    return await db.select().from(sessions)
      .where(eq(sessions.category, category))
      .orderBy(desc(sessions.createdAt));
  }
  
  async getUserSessions(userId: number): Promise<Session[]> {
    // Need to add user_id column to sessions table for this to work
    return await db.select().from(sessions)
      .orderBy(desc(sessions.createdAt));
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const [session] = await db.insert(sessions).values(insertSession).returning();
    return session;
  }

  async deleteSession(id: number): Promise<boolean> {
    const result = await db.delete(sessions).where(eq(sessions.id, id)).returning();
    return result.length > 0;
  }
  
  // Statistics for user tracking over time
  async getSessionStats(): Promise<{
    totalSessions: number;
    hitRate: number;
    byCategory: {category: string, count: number, hitRate: number}[];
  }> {
    const allSessions = await this.getSessions();
    const totalSessions = allSessions.length;
    
    // Calculate hit rate
    const hits = allSessions.filter(s => s.rating === "hit").length;
    const hitRate = totalSessions > 0 ? hits / totalSessions : 0;
    
    // Group by category
    const categories = new Map<string, {count: number, hits: number}>();
    
    for (const session of allSessions) {
      const category = session.category || "unknown";
      const current = categories.get(category) || {count: 0, hits: 0};
      
      current.count++;
      if (session.rating === "hit") {
        current.hits++;
      }
      
      categories.set(category, current);
    }
    
    // Convert to array of statistics
    const byCategory = Array.from(categories.entries()).map(([category, stats]) => {
      return {
        category,
        count: stats.count,
        hitRate: stats.count > 0 ? stats.hits / stats.count : 0
      };
    });
    
    return {
      totalSessions,
      hitRate,
      byCategory
    };
  }
}

// Memory fallback for development if needed
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private sessions: Map<number, Session>;
  currentUserId: number;
  currentSessionId: number;
  public sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.sessions = new Map();
    this.currentUserId = 1;
    this.currentSessionId = 1;
    
    // Create memory session store
    const MemoryStore = require('memorystore')(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
  }

  // User operations  
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Session operations
  async getSession(id: number): Promise<Session | undefined> {
    return this.sessions.get(id);
  }

  async getSessions(): Promise<Session[]> {
    return Array.from(this.sessions.values()).sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }
  
  async getSessionsByCategory(category: string): Promise<Session[]> {
    return Array.from(this.sessions.values())
      .filter(session => session.category === category)
      .sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }
  
  async getUserSessions(userId: number): Promise<Session[]> {
    // In memory implementation doesn't track user sessions
    return this.getSessions();
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const id = this.currentSessionId++;
    const now = new Date();
    
    // Ensure required fields are set
    const sessionWithDefaults: InsertSession = {
      ...insertSession,
      notes: insertSession.notes || null,
      category: insertSession.category || null,
    };
    
    const session: Session = { 
      ...sessionWithDefaults, 
      id, 
      createdAt: now 
    };
    
    this.sessions.set(id, session);
    return session;
  }

  async deleteSession(id: number): Promise<boolean> {
    return this.sessions.delete(id);
  }
  
  // Statistics
  async getSessionStats(): Promise<{
    totalSessions: number;
    hitRate: number;
    byCategory: {category: string, count: number, hitRate: number}[];
  }> {
    const allSessions = await this.getSessions();
    const totalSessions = allSessions.length;
    
    // Calculate hit rate
    const hits = allSessions.filter(s => s.rating === "hit").length;
    const hitRate = totalSessions > 0 ? hits / totalSessions : 0;
    
    // Group by category
    const categories = new Map<string, {count: number, hits: number}>();
    
    for (const session of allSessions) {
      const category = session.category || "unknown";
      const current = categories.get(category) || {count: 0, hits: 0};
      
      current.count++;
      if (session.rating === "hit") {
        current.hits++;
      }
      
      categories.set(category, current);
    }
    
    // Convert to array of statistics
    const byCategory = Array.from(categories.entries()).map(([category, stats]) => {
      return {
        category,
        count: stats.count,
        hitRate: stats.count > 0 ? stats.hits / stats.count : 0
      };
    });
    
    return {
      totalSessions,
      hitRate,
      byCategory
    };
  }
}

// Choose which implementation to use
export const storage = new DatabaseStorage();
