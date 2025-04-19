import { users, type User, type InsertUser, sessions, type Session, type InsertSession } from "@shared/schema";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Session operations
  getSession(id: number): Promise<Session | undefined>;
  getSessions(): Promise<Session[]>;
  createSession(session: InsertSession): Promise<Session>;
  deleteSession(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private sessionStore: Map<number, Session>;
  currentUserId: number;
  currentSessionId: number;

  constructor() {
    this.users = new Map();
    this.sessionStore = new Map();
    this.currentUserId = 1;
    this.currentSessionId = 1;
  }

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
    return this.sessionStore.get(id);
  }

  async getSessions(): Promise<Session[]> {
    return Array.from(this.sessionStore.values()).sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const id = this.currentSessionId++;
    const now = new Date();
    const session: Session = { 
      ...insertSession, 
      id, 
      createdAt: now 
    };
    this.sessionStore.set(id, session);
    return session;
  }

  async deleteSession(id: number): Promise<boolean> {
    return this.sessionStore.delete(id);
  }
}

export const storage = new MemStorage();
