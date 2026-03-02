import { Router, Request, Response } from 'express';

const router = Router();

/**
 * @swagger
 * /progress:
 *   get:
 *     summary: List user progress
 *     description: Retrieve the current user's progress entries across landmarks
 *     tags:
 *       - Progress
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [discovered, visited, completed]
 *         description: Filter by progress status
 *       - in: query
 *         name: includeLandmark
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Whether to include full landmark details
 *     responses:
 *       200:
 *         description: List of progress entries
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/UserProgress'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       401:
 *         $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/', (req: Request, res: Response) => {
  const status = req.query.status as string | undefined;
  const includeLandmark = req.query.includeLandmark !== 'false';

  // Mock response
  const progressEntry = {
    id: 'llllllll-llll-llll-llll-llllllllllll',
    user_id: 'user-uuid',
    landmark_id: 'landmark-uuid',
    visited_at: '2024-02-15T10:30:00Z',
    status: status || 'discovered',
    notes: 'Amazing view from the top!',
    created_at: new Date().toISOString(),
  };

  res.json({
    data: [progressEntry],
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
 * /progress/{id}:
 *   get:
 *     summary: Get progress entry by ID
 *     description: Retrieve a specific progress entry by its UUID
 *     tags:
 *       - Progress
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the progress entry
 *     responses:
 *       200:
 *         description: Progress entry found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProgress'
 *       401:
 *         $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Not authorized to view this progress entry
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/:id', (req: Request, res: Response) => {
  const progressEntry = {
    id: req.params.id,
    user_id: 'user-uuid',
    landmark_id: 'landmark-uuid',
    visited_at: '2024-02-15T10:30:00Z',
    status: 'visited',
    notes: 'Amazing view!',
    created_at: new Date().toISOString(),
  };
  res.json(progressEntry);
});

/**
 * @swagger
 * /progress:
 *   post:
 *     summary: Create progress entry
 *     description: Record progress for a landmark (create new or update existing)
 *     tags:
 *       - Progress
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
 *               - status
 *             properties:
 *               landmark_id:
 *                 type: string
 *                 format: uuid
 *                 description: UUID of the landmark
 *               status:
 *                 type: string
 *                 enum: [discovered, visited, completed]
 *               notes:
 *                 type: string
 *                 description: Optional user notes
 *               visited_at:
 *                 type: string
 *                 format: date-time
 *                 description: When the landmark was visited (optional)
 *           example:
 *             landmark_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"
 *             status: "visited"
 *             notes: "Great experience!"
 *             visited_at: "2024-02-15T10:30:00Z"
 *     responses:
 *       201:
 *         description: Progress entry created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProgress'
 *       400:
 *         $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', (req: Request, res: Response) => {
  const newEntry = {
    id: 'new-uuid',
    user_id: 'user-uuid',
    landmark_id: req.body.landmark_id,
    status: req.body.status,
    notes: req.body.notes || null,
    visited_at: req.body.visited_at || null,
    created_at: new Date().toISOString(),
  };
  res.status(201).json(newEntry);
});

/**
 * @swagger
 * /progress/{id}:
 *   put:
 *     summary: Update progress entry
 *     description: Update status and notes for a progress entry
 *     tags:
 *       - Progress
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the progress entry
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [discovered, visited, completed]
 *               notes:
 *                 type: string
 *               visited_at:
 *                 type: string
 *                 format: date-time
 *           example:
 *             status: "completed"
 *             notes: "Finally made it! Awesome."
 *     responses:
 *       200:
 *         description: Progress entry updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProgress'
 *       401:
 *         $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Not authorized to update this progress entry
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
  const updatedEntry = {
    id: req.params.id,
    user_id: 'user-uuid',
    landmark_id: 'landmark-uuid',
    visited_at: req.body.visited_at || null,
    status: req.body.status,
    notes: req.body.notes || null,
    created_at: new Date().toISOString(),
  };
  res.json(updatedEntry);
});

/**
 * @swagger
 * /progress/{id}:
 *   delete:
 *     summary: Delete progress entry
 *     description: Remove a progress entry (only owner or admin)
 *     tags:
 *       - Progress
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: UUID of the progress entry to delete
 *     responses:
 *       204:
 *         description: Progress entry deleted
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

export default router;
