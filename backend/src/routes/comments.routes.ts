import { Router, Request, Response } from 'express';

const router = Router();

/**
 * @swagger
 * /comments:
 *   get:
 *     summary: List comments
 *     description: Retrieve public comments, optionally filtered by landmark or user
 *     tags:
 *       - Comments
 *     parameters:
 *       - in: query
 *         name: landmark_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by landmark UUID
 *       - in: query
 *         name: user_id
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by user UUID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [helpful_count, created_at]
 *           default: created_at
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: List of comments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Comment'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       500:
 *         $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', (req: Request, res: Response) => {
  res.json({
    data: [
      {
        id: 'oooooooo-oooo-oooo-oooo-oooooooooooo',
        user_id: '22222222-2222-2222-2222-222222222222',
        landmark_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
        content: 'The Eiffel Tower is absolutely stunning at night!',
        rating: 5,
        helpful_count: 42,
        is_public: true,
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
 * /comments/{id}:
 *   get:
 *     summary: Get comment by ID
 *     description: Retrieve a specific comment
 *     tags:
 *       - Comments
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Comment found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       404:
 *         $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', (req: Request, res: Response) => {
  const comment = {
    id: req.params.id,
    user_id: 'user-uuid',
    landmark_id: 'landmark-uuid',
    content: 'Sample comment',
    rating: 4,
    helpful_count: 0,
    is_public: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  res.json(comment);
});

/**
 * @swagger
 * /comments:
 *   post:
 *     summary: Create comment
 *     description: Add a new comment for a landmark (authenticated users)
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - landmark_id
 *               - content
 *             properties:
 *               landmark_id:
 *                 type: string
 *                 format: uuid
 *               content:
 *                 type: string
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 description: Optional rating (1-5)
 *               is_public:
 *                 type: boolean
 *                 default: true
 *           example:
 *             landmark_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"
 *             content: "Amazing place! Highly recommended."
 *             rating: 5
 *             is_public: true
 *     responses:
 *       201:
 *         description: Comment created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       400:
 *         $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', (req: Request, res: Response) => {
  const newComment = {
    id: 'new-uuid',
    user_id: 'user-uuid',
    landmark_id: req.body.landmark_id,
    content: req.body.content,
    rating: req.body.rating || null,
    helpful_count: 0,
    is_public: req.body.is_public !== undefined ? req.body.is_public : true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  res.status(201).json(newComment);
});

/**
 * @swagger
 * /comments/{id}:
 *   put:
 *     summary: Update comment
 *     description: Update comment content, rating, or visibility (owner only)
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                is_public:
 *                 type: boolean
 *           example:
 *             content: "Updated comment after revisiting."
 *             rating: 4
 *     responses:
 *       200:
 *         description: Comment updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       401:
 *         $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - only owner can update
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
  const updatedComment = {
    id: req.params.id,
    user_id: 'user-uuid',
    landmark_id: 'landmark-uuid',
    content: req.body.content,
    rating: req.body.rating || null,
    helpful_count: 0,
    is_public: req.body.is_public !== undefined ? req.body.is_public : true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  res.json(updatedComment);
});

/**
 * @swagger
 * /comments/{id}:
 *   delete:
 *     summary: Delete comment
 *     description: Remove a comment (owner or admin only)
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Comment deleted
 *       401:
 *         $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - not authorized
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

/**
 * @swagger
 * /comments/{id}/helpful:
 *   post:
 *     summary: Mark comment as helpful
 *     description: Increment the helpful count for a comment (authenticated users)
 *     tags:
 *       - Comments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Helpful count incremented
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 helpful_count:
 *                   type: integer
 *                   example: 43
 *       401:
 *         $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/:id/helpful', (req: Request, res: Response) => {
  res.json({ helpful_count: 43 });
});

export default router;
