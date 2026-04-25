import { Context } from 'hono';
import * as complianceService from './compliance.service.js';

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