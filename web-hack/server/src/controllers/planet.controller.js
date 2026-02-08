import axios from "axios";

/**
 * @desc    Get a 10-word summary of a planet using OpenRouter
 * @route   POST /api/v1/planets/describe
 */
export const getPlanetSummary = async (req, res) => {
  const { planetName } = req.body;

  if (!planetName) {
    return res.status(400).json({ success: false, message: "Planet name is required." });
  }

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "google/gemini-2.0-flash-001", // Or your preferred model
        messages: [
          {
            role: "system",
            content: "You are a space expert. Describe the planet in exactly 16 words. No more, no less. No intro text."
          },
          {
            role: "user",
            content: `Describe the planet ${planetName}.`
          }
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const description = response.data.choices[0].message.content.trim();

    res.status(200).json({
      success: true,
      planet: planetName,
      description: description,
      wordCount: description.split(/\s+/).length
    });
  } catch (error) {
    console.error("OPENROUTER_ERROR:", error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      message: "Failed to fetch planetary data from LLM." 
    });
  }
};