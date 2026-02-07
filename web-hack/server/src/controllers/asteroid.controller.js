import User from "../models/user.model.js";

export const saveAsteroid = async (req, res) => {
  try {
    const userId = req.user.id;
    // Extracting neoReferenceId and the full data object from the frontend payload
    const { neoReferenceId, data } = req.body;

    if (!neoReferenceId)
      return res.status(400).json({ message: "ASTEROID_ID_REQUIRED" });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "USER_NOT_FOUND" });

    // 🔍 Check duplicate using the schema structure
    const alreadySaved = user.watchedAsteroids.some(
      (a) => a.neoReferenceId === neoReferenceId
    );

    if (alreadySaved)
      return res.status(409).json({ message: "ASTEROID_ALREADY_WATCHED" });

    // 💾 Push the structure that matches your mongoose schema
    user.watchedAsteroids.push({
      neoReferenceId,
      data, // This stores the full object from NASA/Frontend
      addedAt: new Date(),
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: "ASTEROID_ADDED_TO_WATCHLIST",
      data: user.watchedAsteroids,
    });
  } catch (err) {
    console.error("SAVE_ASTEROID_ERROR:", err);
    res.status(500).json({ message: "INTERNAL_SERVER_ERROR" });
  }
};

// getWatchedAsteroids and removeAsteroid remain largely the same
export const getWatchedAsteroids = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("watchedAsteroids");
    res.json({ success: true, data: user.watchedAsteroids });
  } catch (err) {
    res.status(500).json({ message: "FETCH_ERROR" });
  }
};
/**
 * ❌ Remove asteroid from watchlist
 * DELETE /api/asteroids/watch/:neoReferenceId
 */
export const removeAsteroid = async (req, res) => {
  try {
    const userId = req.user.id;
    const { neoReferenceId } = req.params;

    const user = await User.findById(userId);

    const before = user.watchedAsteroids.length;

    user.watchedAsteroids = user.watchedAsteroids.filter(
      (a) => a.neoReferenceId !== neoReferenceId
    );

    if (before === user.watchedAsteroids.length)
      return res.status(404).json({ message: "ASTEROID_NOT_FOUND" });

    await user.save();

    res.json({
      success: true,
      message: "ASTEROID_REMOVED",
      data: user.watchedAsteroids,
    });
  } catch (err) {
    console.error("REMOVE_ASTEROID_ERROR:", err);
    res.status(500).json({ message: "INTERNAL_SERVER_ERROR" });
  }
};

