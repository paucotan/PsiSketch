import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import axios from "axios";

export async function registerRoutes(app: Express): Promise<Server> {
  // Route to fetch a random image from Unsplash
  app.get("/api/random-image", async (req, res) => {
    try {
      // Get Unsplash API key from environment variables
      const apiKey = process.env.UNSPLASH_API_KEY || "demo_key";
      
      // Call Unsplash API for a random photo
      // Categories can be: nature, architecture, people, animals, food, travel
      const categories = ["nature", "architecture", "abstract", "travel", "animals"];
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      
      const response = await axios.get(`https://api.unsplash.com/photos/random`, {
        params: {
          query: randomCategory,
          orientation: "landscape",
        },
        headers: {
          Authorization: `Client-ID ${apiKey}`,
        },
      });
      
      res.json(response.data);
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

  const httpServer = createServer(app);
  return httpServer;
}
