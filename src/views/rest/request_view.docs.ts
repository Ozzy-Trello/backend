/**
 * @openapi
 * /accurate/open-db:
 *   post:
 *     tags:
 *       - Accurate
 *     summary: Open Accurate DB
 *     description: Hit Accurate API to open a DB session
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - token
 *             properties:
 *               id:
 *                 type: string
 *                 example: "123456789"
 *               token:
 *                 type: string
 *                 description: Bearer token for Accurate API
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: Accurate API response
 *       400:
 *         description: Missing id or token in request body
 *       401:
 *         description: Missing or invalid Authorization header or token
 *       502:
 *         description: Error from Accurate API
 */
