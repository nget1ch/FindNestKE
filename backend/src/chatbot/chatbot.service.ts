import { eq, like, or, and, sql } from 'drizzle-orm';
import { db } from '../db/db.js';
import { chatbotSessions, houses } from '../db/schema.js';

export const createSession = async (data: any) => {
  if (!data.sessionToken) data.sessionToken = crypto.randomUUID();
  const [newSession] = await db.insert(chatbotSessions).values(data).returning();
  return newSession;
};

// INTELLIGENT DISCOVERY: Enhanced logic to return curated property cards
export const getChatResponse = async (query: string) => {
  const normalizedQuery = query.toLowerCase();
  
  // Extract parameters from structured query: "Budget 35000, location Westlands, house type 2BR, amenities Parking"
  const budgetMatch = query.match(/Budget ([\d.]+)/i);
  const locationMatch = query.match(/location ([^,]+)/i);
  const typeMatch = query.match(/house type ([^,]+)/i);
  const amenitiesMatch = query.match(/amenities (.+)/i);

  const budget = budgetMatch ? parseFloat(budgetMatch[1]) : null;
  const locationText = locationMatch ? locationMatch[1].trim() : null;
  const houseType = typeMatch ? typeMatch[1].trim() : null;
  const amenities = amenitiesMatch ? amenitiesMatch[1].trim() : null;

  const filters: any[] = [];

  // 1. Rent Filter (Approximate range +/- 20%)
  if (budget) {
    filters.push(and(
      sql`${houses.monthlyRent} >= ${budget * 0.7}`,
      sql`${houses.monthlyRent} <= ${budget * 1.3}`
    ));
  }

  // 2. Location/Title/Description Filter
  const searchTerms: string[] = [];
  if (locationText && locationText.length > 0) searchTerms.push(locationText);
  if (houseType && houseType.length > 0) searchTerms.push(houseType);
  if (amenities && amenities.length > 0) searchTerms.push(...amenities.split(',').map(a => a.trim()).filter(a => a.length > 0));

  if (searchTerms.length > 0) {
    const termFilters = searchTerms.map(term => or(
      like(houses.title, `%${term}%`),
      like(houses.description, `%${term}%`),
      like(houses.addressLine, `%${term}%`),
      like(houses.amenities, `%${term}%`)
    ));
    filters.push(or(...termFilters));
  }

  // If no structured parameters found, fallback to general search
  const whereClause = filters.length > 0 ? and(...filters) : or(
    like(houses.title, `%${normalizedQuery}%`),
    like(houses.description, `%${normalizedQuery}%`)
  );

  const matches = await db.query.houses.findMany({
    where: whereClause,
    limit: 6,
    with: {
      location: true,
      images: {
        limit: 1
      }
    }
  });

  if (matches.length > 0) {
    const list = matches.slice(0, 3).map(h => h.title).join(', ');
    const count = matches.length;
    return {
      reply: `I've analyzed the current inventory and isolated ${count} ${count === 1 ? 'property' : 'properties'} that align with your requirements. High-authority matches include ${list}. You can view the specifics on your Discovery Canvas.`,
      houses: matches.map(h => ({
        id: h.houseId,
        title: h.title,
        rent: h.monthlyRent,
        county: h.location?.town || h.location?.county || 'Nairobi',
        images: h.images?.map(img => img.imageUrl) || []
      }))
    };
  }

  return {
    reply: "My intelligence nodes couldn't isolate an exact match for that specific preference, but I have several upcoming institutional listings in Westlands and Karen. What specific budget or lifestyle features should I prioritize?",
    houses: []
  };
};

export const getSession = async (sessionId: number) => {
  return await db.query.chatbotSessions.findFirst({ where: eq(chatbotSessions.sessionId, sessionId) });
};

export const listSessions = async () => {
  return await db.select().from(chatbotSessions);
};

export const updateSession = async (sessionId: number, updates: any) => {
  const [updated] = await db.update(chatbotSessions).set(updates).where(eq(chatbotSessions.sessionId, sessionId)).returning();
  return updated;
};

export const deleteSession = async (sessionId: number) => {
  const [deleted] = await db.delete(chatbotSessions).where(eq(chatbotSessions.sessionId, sessionId)).returning();
  return deleted;
};