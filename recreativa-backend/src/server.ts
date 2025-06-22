import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { lessonPlanRoutes } from './routes/lessonPlanRoutes';
import path from 'path';

dotenv.config();

const app = express(); 
const PORT = process.env.PORT || 3333;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/files/generated', express.static(path.resolve(__dirname, '..', 'uploads', 'generated')));
app.use('/api', lessonPlanRoutes);
app.get('/', (req, res) => {
  res.send('A Recreativa - Backend is running! 🚀');
});

export { app };

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
  });
}