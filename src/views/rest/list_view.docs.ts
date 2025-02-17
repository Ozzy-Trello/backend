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
 *           type: integer
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
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateListModel'
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
 *           type: integer
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

