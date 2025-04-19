import { useToast } from "@/hooks/use-toast";

// Function to fetch a random image from Unsplash
export const fetchRandomImage = async (): Promise<{ fullImage: string; thumbnail: string }> => {
  try {
    const response = await fetch('/api/random-image');
    
    if (!response.ok) {
      throw new Error('Failed to fetch random image');
    }
    
    const data = await response.json();
    return {
      fullImage: data.urls.regular,
      thumbnail: data.urls.small
    };
  } catch (error) {
    console.error('Error fetching image from Unsplash:', error);
    throw error;
  }
};

// Hook to fetch random image with toast notification for errors
export const useFetchRandomImage = () => {
  const { toast } = useToast();

  const getRandomImage = async (): Promise<{ fullImage: string; thumbnail: string } | null> => {
    try {
      return await fetchRandomImage();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch a random image. Please try again later.",
        variant: "destructive",
      });
      return null;
    }
  };

  return { getRandomImage };
};
