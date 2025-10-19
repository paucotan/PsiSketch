import type { Express } from "express";
import { storage } from "./storage";
import axios from "axios";

export function registerRoutes(app: Express): void {
  // Store the last used categories to ensure diversity
  let lastUsedCategories: string[] = [];

  // Route to fetch a random image from Unsplash
  app.get("/api/random-image", async (req, res) => {
    try {
      // Get Unsplash API key from environment variables
      const apiKey = process.env.UNSPLASH_API_KEY || "demo_key";

      // Define diverse categories for random targets
      const allCategories = [
        // Nature/Outdoor
        "nature", "landscape", "mountains", "beach", "forest", "ocean", "sunset",
        // Man-made
        "architecture", "cityscape", "buildings", "interior", "transportation",
        // Objects
        "furniture", "technology", "tools", "instruments", "vintage",
        // Living things
        "animals", "wildlife", "pets", "plants", "flowers",
        // Food & Drink
        "food", "cuisine", "drinks", "desserts", "fruits",
        // Abstract
        "abstract", "texture", "pattern", "minimalism", "geometric",
        // Activities
        "sports", "travel", "art", "craft", "hobby"
      ];

      // Filter out recently used categories if we have some history
      let availableCategories = allCategories;
      if (lastUsedCategories.length > 0) {
        availableCategories = allCategories.filter(cat => !lastUsedCategories.includes(cat));
      }

      // Select a random category from available ones
      const randomCategory = availableCategories[Math.floor(Math.random() * availableCategories.length)];

      // Update the history of used categories
      lastUsedCategories.push(randomCategory);
      // Keep only the 5 most recent categories in history to avoid repetition
      if (lastUsedCategories.length > 5) {
        lastUsedCategories.shift();
      }

      console.log(`Fetching random image with category: ${randomCategory}`);

      const response = await axios.get(`https://api.unsplash.com/photos/random`, {
        params: {
          query: randomCategory,
          orientation: "landscape",
          content_filter: "high",
        },
        headers: {
          Authorization: `Client-ID ${apiKey}`,
        },
      });

      // Add the category to the response so we can store it with the session
      const responseWithCategory = {
        ...response.data,
        category: randomCategory
      };

      res.json(responseWithCategory);
    } catch (error) {
      console.error("Error fetching random image:", error);

      if (axios.isAxiosError(error) && error.response) {
        res.status(error.response.status).json({
          message: "Failed to fetch image from Unsplash API",
          error: error.response.data,
        });
      } else {
        res.status(500).json({
          message: "An error occurred while fetching a random image",
        });
      }
    }
  });

  // Session management endpoints
  app.post("/api/sessions", async (req, res) => {
    try {
      const sessionData = req.body;
      const result = await storage.createSession(sessionData);
      res.status(201).json(result);
    } catch (error) {
      console.error("Error creating session:", error);
      res.status(500).json({
        message: "Failed to save session"
      });
    }
  });

  app.get("/api/sessions", async (req, res) => {
    try {
      const sessions = await storage.getSessions();
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      res.status(500).json({
        message: "Failed to fetch sessions"
      });
    }
  });

  app.get("/api/sessions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const session = await storage.getSession(id);

      if (!session) {
        return res.status(404).json({
          message: "Session not found"
        });
      }

      res.json(session);
    } catch (error) {
      console.error("Error fetching session:", error);
      res.status(500).json({
        message: "Failed to fetch session"
      });
    }
  });

  app.delete("/api/sessions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteSession(id);

      if (!success) {
        return res.status(404).json({
          message: "Session not found or could not be deleted"
        });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting session:", error);
      res.status(500).json({
        message: "Failed to delete session"
      });
    }
  });

  // Get practice statistics
  app.get("/api/stats", async (req, res) => {
    try {
      const stats = await storage.getSessionStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching statistics:", error);
      res.status(500).json({
        message: "Failed to fetch practice statistics"
      });
    }
  });

}
