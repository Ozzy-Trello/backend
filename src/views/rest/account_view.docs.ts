//AccountModel
/**
 * @swagger
 * /v1/account:
 *   get:
 *     summary: Get Current Account
 *     tags: [Account]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         token: "this token"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AccountModel'
 *       500:
 *         description: Internal Server Error
 *
 */

/**
 * @swagger
 * /v1/account/list:
 *   get:
 *     summary: Get Account list
 *     tags: [Account]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: workspace-id
 *         in: query
 *         description: ID of workspace
 *         schema:
 *           type: string
 *       - name: board-id
 *         in: query
 *         description: ID of board
 *         schema:
 *           type: string
 *       - name: name
 *         in: query
 *         schema:
 *           type: string
 *       - name: page
 *         in: query
 *         schema:
 *          type: number
 *       - name: limit
 *         in: query
 *         schema:
 *          type: number
 *     responses:
 *       200:
 *         token: "this token"
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AccountModel'
 *       500:
 *         description: Internal Server Error
 *
 */

/**
 * @swagger
 * /v1/account:
 *   put:
 *     summary: Update Current Account
 *     tags: [Account]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AccountModel'
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       201:
 *          description: Account updated successfully
 *       500:
 *         description: Internal Server Error
 *
 */