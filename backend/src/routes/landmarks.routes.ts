import { Router, Request, Response } from 'express';
import pool from '../config/database';

const router = Router();

/**
 * @swagger
 * /landmarks:
 *   get:
 *     summary: List landmarks
 *     description: Retrieve landmarks within a bounding box with optional category filter
 *     tags:
 *       - Landmarks
 *     parameters:
 *       - in: query
 *         name: minLat
 *         schema:
 *           type: number
 *           format: float
 *         description: Minimum latitude of bounding box
 *         required: true
 *       - in: query
 *         name: maxLat
 *         schema:
 *           type: number
 *           format: float
 *         description: Maximum latitude of bounding box
 *         required: true
 *       - in: query
 *         name: minLng
 *         schema:
 *           type: number
 *           format: float
 *         description: Minimum longitude of bounding box
 *         required: true
 *       - in: query
 *         name: maxLng
 *         schema:
 *           type: number
 *           format: float
 *         description: Maximum longitude of bounding box
 *         required: true
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [historical, natural, cultural, architectural, recreational]
 *         description: Filter by landmark category
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 100
 *         description: Maximum number of results to return
 *     responses:
 *       200:
 *         description: List of landmarks
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Landmark'
 *       400:
 *         $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/schemas/ErrorResponse'
 */
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

/**
 * @swagger
 * /landmarks/{id}:
 *   get:
 *     summary: Get landmark by ID
 *     description: Retrieve detailed information about a specific landmark
 *     tags:
 *       - Landmarks
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the landmark
 *     responses:
 *       200:
 *         description: Landmark found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Landmark'
 *       404:
 *         $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/schemas/ErrorResponse'
 */
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

/**
 * @swagger
 * /landmarks/near:
 *   get:
 *     summary: Find nearby landmarks
 *     description: Retrieve landmarks within a radius of a given point
 *     tags:
 *       - Landmarks
 *     parameters:
 *       - in: query
 *         name: lat
 *         schema:
 *           type: number
 *           format: float
 *         description: Latitude of the center point
 *         required: true
 *       - in: query
 *         name: lng
 *         schema:
 *           type: number
 *           format: float
 *         description: Longitude of the center point
 *         required: true
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           format: float
 *         description: Radius in kilometers
 *         required: true
 *     responses:
 *       200:
 *         description: List of nearby landmarks with distance information
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Landmark'
 *       400:
 *         $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/schemas/ErrorResponse'
 */
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
