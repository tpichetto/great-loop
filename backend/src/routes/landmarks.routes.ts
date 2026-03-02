import { Router, Request, Response } from 'express';

const router = Router();

/**
 * @swagger
 * /landmarks:
 *   get:
 *     summary: List landmarks
 *     description: Retrieve a paginated list of landmarks with optional filters
 *     tags:
 *       - Landmarks
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number (mutually exclusive with offset)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           description: Number of items to skip (for pagination)
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [historical, natural, cultural, architectural, recreational]
 *         description: Filter by landmark category
 *       - in: query
 *         name: near
 *         schema:
 *           type: string
 *           pattern: '^-?\\d+\\.\\d+,-?\\d+\\.\\d+$'
 *         example: "40.782864,-73.965355"
 *         description: Comma-separated latitude and longitude for distance search
 *       - in: query
 *         name: radius
 *         schema:
 *           type: number
 *           minimum: 1
 *           maximum: 50000
 *           default: 10000
 *         description: Radius in meters (used with near parameter)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [distance, created_at, name]
 *           default: created_at
 *         description: Sort field (distance requires near parameter)
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: List of landmarks
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Landmark'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       400:
 *         $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', (req: Request, res: Response) => {
  res.json({
    data: [
      {
        id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        name: 'Eiffel Tower',
        description: 'Iconic iron lattice tower in Paris, France.',
        latitude: 48.85837,
        longitude: 2.294481,
        location: { type: 'Point', coordinates: [2.294481, 48.85837] },
        category: 'historical',
        image_urls: ['https://example.com/eiffel1.jpg'],
        opening_hours: { summer: '09:30-23:45', winter: '09:30-21:45' },
        admission_fee: 28.0,
        contact_info: { phone: '+33 892 70 12 39', website: 'https://www.toureiffel.paris' },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    pagination: {
      total: 1,
      limit: 20,
      offset: 0,
      page: 1,
    },
  });
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
router.get('/:id', (req: Request, res: Response) => {
  const landmark = {
    id: req.params.id,
    name: 'Sample Landmark',
    description: 'Sample description',
    latitude: 0,
    longitude: 0,
    location: { type: 'Point', coordinates: [0, 0] },
    category: 'historical',
    image_urls: [],
    opening_hours: null,
    admission_fee: null,
    contact_info: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  res.json(landmark);
});

/**
 * @swagger
 * /landmarks:
 *   post:
 *     summary: Create landmark
 *     description: Add a new landmark (admin only)
 *     tags:
 *       - Landmarks
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Landmark'
 *           example:
 *             name: "Statue of Liberty"
 *             description: "A colossal neoclassical sculpture on Liberty Island"
 *             latitude: 40.689247
 *             longitude: -74.044502
 *             category: "historical"
 *             image_urls: ["https://example.com/liberty1.jpg"]
 *             opening_hours: {"daily": "09:00-17:00"}
 *             admission_fee: 24.00
 *             contact_info: {"phone": "+1 212-363-3200", "website": "https://www.nps.gov/stli"}
 *     responses:
 *       201:
 *         description: Landmark created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Landmark'
 *       400:
 *         $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - requires admin privileges
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', (req: Request, res: Response) => {
  res.status(201).json(req.body);
});

/**
 * @swagger
 * /landmarks/{id}:
 *   put:
 *     summary: Update landmark
 *     description: Update an existing landmark (admin only)
 *     tags:
 *       - Landmarks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the landmark to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Landmark'
 *     responses:
 *       200:
 *         description: Landmark updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Landmark'
 *       400:
 *         $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - requires admin privileges
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/schemas/ErrorResponse'
 */
router.put('/:id', (req: Request, res: Response) => {
  res.json({ ...req.body, id: req.params.id });
});

/**
 * @swagger
 * /landmarks/{id}:
 *   delete:
 *     summary: Delete landmark
 *     description: Remove a landmark (admin only)
 *     tags:
 *       - Landmarks
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the landmark to delete
 *     responses:
 *       204:
 *         description: Landmark deleted successfully
 *       401:
 *         $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - requires admin privileges
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/schemas/ErrorResponse'
 */
router.delete('/:id', (req: Request, res: Response) => {
  res.status(204).send();
});

export default router;
