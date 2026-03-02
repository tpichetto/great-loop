import { Router, Request, Response } from 'express';
import pool from '../config/database';

const router = Router();

// Helper to calculate distance between two points (Haversine formula)
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lng2 - lng1);
  const lat1Rad = toRad(lat1);
  const lat2Rad = toRad(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1Rad) * Math.cos(lat2Rad);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

// GET /api/landmarks - fetch landmarks within bounding box
router.get('/', async (req: Request, res: Response) => {
  try {
    const { minLat, maxLat, minLng, maxLng, category, limit = 100 } = req.query;

    if (!minLat || !maxLat || !minLng || !maxLng) {
      return res.status(400).json({
        error: 'Missing required bounding box parameters: minLat, maxLat, minLng, maxLng',
      });
    }

    const minLatNum = parseFloat(minLat as string);
    const maxLatNum = parseFloat(maxLat as string);
    const minLngNum = parseFloat(minLng as string);
    const maxLngNum = parseFloat(maxLng as string);
    const limitNum = parseInt(limit as string, 10);

    // Build query with optional category filter
    let queryParams: any[] = [minLngNum, minLatNum, maxLngNum, maxLatNum];
    let categoryFilter = '';
    if (category) {
      categoryFilter = 'AND category = $' + (queryParams.length + 1);
      queryParams.push(category);
    }

    const query = `
      SELECT
        id,
        name,
        description,
        latitude,
        longitude,
        category,
        image_urls as images,
        opening_hours as openingHours,
        admission_fee as priceLevel,
        contact_info as contact,
        rating,
        review_count as reviewCount,
        tags,
        created_at as createdAt,
        updated_at as updatedAt
      FROM landmarks
      WHERE ST_Within(
        location,
        ST_MakeEnvelope($1, $2, $3, $4, 4326)
      )
      ${categoryFilter}
      ORDER BY rating DESC NULLS LAST
      LIMIT $${queryParams.length + 1}
    `;
    queryParams.push(limitNum);

    const { rows } = await pool.query(query, queryParams);

    // Transform to match frontend schema
    const landmarks = rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      shortDescription:
        row.description.substring(0, 150) + (row.description.length > 150 ? '...' : ''),
      category: row.category,
      latitude: parseFloat(row.latitude),
      longitude: parseFloat(row.longitude),
      address: null, // Not stored in DB currently
      phone: row.contact?.phone || null,
      website: row.contact?.website || null,
      openingHours: row.openingHours || null,
      images: row.images || [],
      rating: row.rating ? parseFloat(row.rating) : undefined,
      reviewCount: row.reviewCount || undefined,
      priceLevel: row.priceLevel ? parseInt(row.priceLevel) : undefined,
      tags: row.tags || [],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));

    res.json(landmarks);
  } catch (error) {
    console.error('Error fetching landmarks by bbox:', error);
    res.status(500).json({ error: 'Failed to fetch landmarks' });
  }
});

// GET /api/landmarks/:id - fetch single landmark
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const { rows } = await pool.query(
      `
      SELECT
        id,
        name,
        description,
        latitude,
        longitude,
        category,
        image_urls as images,
        opening_hours as openingHours,
        admission_fee as priceLevel,
        contact_info as contact,
        rating,
        review_count as reviewCount,
        tags,
        created_at as createdAt,
        updated_at as updatedAt
      FROM landmarks
      WHERE id = $1
      `,
      [id],
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Landmark not found' });
    }

    const row = rows[0];
    const landmark = {
      id: row.id,
      name: row.name,
      description: row.description,
      shortDescription:
        row.description.substring(0, 150) + (row.description.length > 150 ? '...' : ''),
      category: row.category,
      latitude: parseFloat(row.latitude),
      longitude: parseFloat(row.longitude),
      address: null,
      phone: row.contact?.phone || null,
      website: row.contact?.website || null,
      openingHours: row.openingHours || null,
      images: row.images || [],
      rating: row.rating ? parseFloat(row.rating) : undefined,
      reviewCount: row.reviewCount || undefined,
      priceLevel: row.priceLevel ? parseInt(row.priceLevel) : undefined,
      tags: row.tags || [],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    };

    res.json(landmark);
  } catch (error) {
    console.error('Error fetching landmark by ID:', error);
    res.status(500).json({ error: 'Failed to fetch landmark' });
  }
});

// GET /api/landmarks/near - fetch landmarks near a point
router.get('/near', async (req: Request, res: Response) => {
  try {
    const { lat, lng, radius } = req.query;

    if (!lat || !lng || !radius) {
      return res.status(400).json({ error: 'Missing required parameters: lat, lng, radius' });
    }

    const latNum = parseFloat(lat as string);
    const lngNum = parseFloat(lng as string);
    const radiusKm = parseFloat(radius as string);

    // Query using PostGIS geography distance
    const query = `
      SELECT
        id,
        name,
        description,
        latitude,
        longitude,
        category,
        image_urls as images,
        opening_hours as openingHours,
        admission_fee as priceLevel,
        contact_info as contact,
        rating,
        review_count as reviewCount,
        tags,
        created_at as createdAt,
        updated_at as updatedAt,
        ST_Distance(location::geography, ST_GeogFromText($1)) / 1000 as distance_km
      FROM landmarks
      WHERE ST_DWithin(
        location::geography,
        ST_GeogFromText($1),
        $2 * 1000  -- convert km to meters
      )
      ORDER BY distance_km ASC
      LIMIT 100
    `;

    const point = `SRID=4326;POINT(${lngNum} ${latNum})`;
    const { rows } = await pool.query(query, [point, radiusKm]);

    const landmarks = rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      description: row.description,
      shortDescription:
        row.description.substring(0, 150) + (row.description.length > 150 ? '...' : ''),
      category: row.category,
      latitude: parseFloat(row.latitude),
      longitude: parseFloat(row.longitude),
      address: null,
      phone: row.contact?.phone || null,
      website: row.contact?.website || null,
      openingHours: row.openingHours || null,
      images: row.images || [],
      rating: row.rating ? parseFloat(row.rating) : undefined,
      reviewCount: row.reviewCount || undefined,
      priceLevel: row.priceLevel ? parseInt(row.priceLevel) : undefined,
      tags: row.tags || [],
      distance: parseFloat(row.distance_km),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }));

    res.json(landmarks);
  } catch (error) {
    console.error('Error fetching nearby landmarks:', error);
    res.status(500).json({ error: 'Failed to fetch nearby landmarks' });
  }
});

export default router;
