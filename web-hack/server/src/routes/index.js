import express from 'express';
import authRoutes from './auth.routes.js';
import asteroidRoutes from './asteroid.routes.js'
// import radarRoutes from './radar.routes.js'; // Future: for NASA API logic
// import userRoutes from './user.routes.js';   // Future: for Profile logic

const router = express.Router();

// 🛰️ Health Check Endpoint
router.get('/status', (req, res) => {
  res.json({ 
    status: 'online', 
    timestamp: new Date().toISOString(),
    system: 'Cosmic Watch Core'
  });
});

// 📂 Sub-Route Registration
router.use('/auth', authRoutes);
router.use('/asteroids', asteroidRoutes);
// router.use('/radar', radarRoutes);
// router.use('/user', userRoutes);

export default router;