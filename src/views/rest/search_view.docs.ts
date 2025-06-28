/**
 * @swagger
 * components:
 *   schemas:
 *     SearchResult:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Unique identifier of the result
 *         name:
 *           type: string
 *           description: Name of the card or board
 *         description:
 *           type: string
 *           description: Description of the card or board
 *         type:
 *           type: string
 *           enum: [card, board]
 *           description: Type of the search result
 *         board_id:
 *           type: string
 *           description: Board ID (for cards)
 *         board_name:
 *           type: string
 *           description: Board name (for cards)
 *         list_id:
 *           type: string
 *           description: List ID (for cards)
 *         list_name:
 *           type: string
 *           description: List name (for cards)
 *         workspace_id:
 *           type: string
 *           description: Workspace ID
 *         workspace_name:
 *           type: string
 *           description: Workspace name
 *         cover:
 *           type: string
 *           description: Cover image URL (for cards)
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *       example:
 *         id: "123e4567-e89b-12d3-a456-426614174000"
 *         name: "Sample Card"
 *         description: "This is a sample card"
 *         type: "card"
 *         list_id: "456e7890-e89b-12d3-a456-426614174001"
 *         cover: "https://example.com/image.jpg"
 *         created_at: "2023-01-01T00:00:00Z"
 *         updated_at: "2023-01-02T00:00:00Z"
 */

/**
 * @swagger
 * /v1/search:
 *   get:
 *     summary: Unified search for cards and boards
 *     tags: [Search]
 *     parameters:
 *       - name: q
 *         in: query
 *         description: Search query string
 *         required: true
 *         schema:
 *           type: string
 *           example: "design"
 *       - name: workspace-id
 *         in: header
 *         description: Workspace ID to search within
 *         schema:
 *           type: string
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *       - name: page
 *         in: query
 *         description: Page number for pagination
 *         schema:
 *           type: integer
 *           default: 1
 *           example: 1
 *       - name: limit
 *         in: query
 *         description: Number of results per page
 *         schema:
 *           type: integer
 *           default: 10
 *           example: 10
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successful search response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SearchResult'
 *                 message:
 *                   type: string
 *                   example: "Search results"
 *                 paginate:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     total:
 *                       type: integer
 *                       example: 25
 *       400:
 *         description: Bad Request - Query parameter missing
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Query parameter is required"
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Internal server error"
 */
