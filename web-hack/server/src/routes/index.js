import express from 'express';
import authRoutes from './auth.routes.js';
import asteroidRoutes from './asteroid.routes.js'
import messageRoutes from './message.route.js'


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
router.use('/message', messageRoutes);

// router.use('/radar', radarRoutes);
// router.use('/user', userRoutes);

export default router;