import express from "express";
import { authenticateFirebaseUser } from "../../auth/middlewares/authenticateFirebaseUser";
import * as reportController from '../controller/report';

const route = express.Router()

route.post('/create', authenticateFirebaseUser, async (req, res) => {
  try {
    const report = await reportController.createReport(req.body);
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

route.post('/schedule/create/:id', authenticateFirebaseUser, async (req, res) => {
  try {
    const report = await reportController.createScheduleReport(req.params.id, req.body);
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

route.get('/getAll', authenticateFirebaseUser, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const page = parseInt(req.query.page as string) || 1;

    if (isNaN(limit) || isNaN(page)) {
      return res.status(400).json({ error: "Invalid or missing 'limit' or 'page' query parameters" });
    }
    const report = await reportController.getAllReport(page, limit);
    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

route.delete('/delete/:id', authenticateFirebaseUser, async (req, res) => {
  try {
    const report = await reportController.deleteReport(req.params.id);
    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

route.get('/schedule/getAll', authenticateFirebaseUser, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const page = parseInt(req.query.page as string) || 1;

    if (isNaN(limit) || isNaN(page)) {
      return res.status(400).json({ error: "Invalid or missing 'limit' or 'page' query parameters" });
    }
    const report = await reportController.getAllScheduledReports(page, limit);
    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

route.patch('/schedule/:id', authenticateFirebaseUser, async (req, res) => {
  try {
    const project = await reportController.updateScheduledReport(req.params.id, req.body);
    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

route.delete('/delete/schedule/:id', authenticateFirebaseUser, async (req, res) => {
  try {
    const report = await reportController.deleteScheduledReport(req.params.id);
    res.status(200).json(report);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

export default route;