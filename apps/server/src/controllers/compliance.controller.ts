import { Context } from 'hono';
import * as complianceService from '../services/compliance.service.js';

export const listLogs = async (c: Context) => {
  try {
    const query = c.req.query();
    const logs = await complianceService.listComplianceLogs(query);
    return c.json(logs, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
};

export const fileReturn = async (c: Context) => {
  try {
    const data = await c.req.json();
    const result = await complianceService.fileReturn(data);
    return c.json(result, 201);
  } catch (error: any) {
    return c.json({ error: error.message }, 400);
  }
};

export const verifyKraPin = async (c: Context) => {
  try {
    const { kraPin } = await c.req.json();
    const user = c.get('user');
    const userId = user?.userId;
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    const result = await complianceService.verifyKraPin(userId, kraPin);
    return c.json(result, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 400);
  }
};

export const verifyNationalId = async (c: Context) => {
  try {
    const { userId, nationalId } = await c.req.json();
    if (!userId || !nationalId) {
      return c.json({ error: 'Missing userId or nationalId' }, 400);
    }
    const result = await complianceService.verifyNationalId(Number(userId), nationalId);
    return c.json(result, 200);
  } catch (error: any) {
    return c.json({ error: error.message }, 400);
  }
};