/**
 * @swagger
 * /v1/list:
 *   post:
 *     summary: Create List
 *     tags: [ List ]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateListModel'
 *     responses:
 *       200:
 *         token: "this token"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateListModel'
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /v1/list:
 *   get:
 *     summary: Get list
 *     parameters:
 *       - name: board-id
 *         in: header
 *         description: ID of board
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
 *     tags: [ List ]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         token: "this token"
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/GetListModel'
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /v1/list/{id}:
 *   get:
 *     summary: Get list details
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of list to update
 *         required: true
 *         schema:
 *           type: string
 *     tags: [ List ]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         token: "this token"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GetListModel'
 *       500:
 *         description: Internal Server Error
 *
 */

/**
 * @swagger
 * /v1/list/{id}:
 *   put:
 *     summary: Update list details
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of list to update
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GetListModel'
 *     tags: [ List ]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       201:
 *         description: board updated successfully
 *       500:
 *         description: Internal Server Error
 *
 */


/**
 * @swagger
 * /v1/list/{id}:
 *   delete:
 *     summary: Delete a list
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of list to delete
 *         required: true
 *         schema:
 *           type: string
 *     tags: [ List ]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       201:
 *         description: list deleted successfully
 *       500:
 *         description: Internal Server Error
 *
 */

/**
 * @swagger
 * /v1/list/{id}/move:
 *   post:
 *     summary: Move list
 *     tags: [ List ]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MoveListModel'
 *     responses:
 *       200:
 *         description: List moved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GetListModel'
 *       500:
 *         description: Internal Server Error
 *
 *       400:
 *         description: Bad Request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "List ID is invalid or missing"
 *                 status_code:
 *                   type: integer
 *                   example: 400
 *       404:
 *         description: Not Found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "List not found"
 *                 status_code:
 *                   type: integer
 *                   example: 404
 */
