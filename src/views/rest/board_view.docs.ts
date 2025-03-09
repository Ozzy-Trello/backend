/**
 * @swagger
 * /v1/board:
 *   post:
 *     x-beta: true
 *     x-internal: true
 *     summary: Create board
 *     tags: [ Board ]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBoardModel'
 *     responses:
 *       200:
 *         token: "this token"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateBoardModel'
 *       500:
 *         description: Internal Server Error
 *
 */

/**
 * @swagger
 * /v1/board:
 *   get:
 *     summary: Get board list
 *     tags: [ Board ]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: header
 *         name: my-default
 *         schema:
 *           type: boolean
 *       - in: header
 *         name: workspace-id
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         token: "this token"
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/GetBoardModel'
 *       500:
 *         description: Internal Server Error
 *
 */

/**
 * @swagger
 * /v1/board/{id}:
 *   get:
 *     summary: Get board details
 *     parameters:
 *       - in: header
 *         name: my-default
 *         schema:
 *           type: boolean
 *       - in: header
 *         name: workspace-id
 *         schema:
 *           type: string
 *       - name: id
 *         in: path
 *         description: ID of board to update
 *         required: true
 *         schema:
 *           type: string
 *     tags: [ Board ]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         token: "this token"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GetBoardModel'
 *       500:
 *         description: Internal Server Error
 *
 */

/**
 * @swagger
 * /v1/board/{id}:
 *   put:
 *     summary: Update board details
 *     parameters:
 *       - in: header
 *         name: my-default
 *         schema:
 *           type: boolean
 *       - in: header
 *         name: workspace-id
 *         schema:
 *           type: string
 *       - name: id
 *         in: path
 *         description: ID of board to update
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBoardModel'
 *     tags: [ Board ]
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
 * /v1/board/{id}:
 *   delete:
 *     summary: Delete a board
 *     parameters:
 *       - in: header
 *         name: my-default
 *         schema:
 *           type: boolean
 *       - in: header
 *         name: workspace-id
 *         schema:
 *           type: string
 *       - name: id
 *         in: path
 *         description: ID of board to delete
 *         required: true
 *         schema:
 *           type: string
 *     tags: [ Board ]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       201:
 *         description: board deleted successfully
 *       500:
 *         description: Internal Server Error
 *
 */


/**
 * @swagger
 * /v1/board/{id}/member/{user-id}:
 *   post:
 *     summary: Add a member to a board
 *     parameters:
 *       - in: header
 *         name: my-default
 *         schema:
 *           type: boolean
 *       - in: header
 *         name: workspace-id
 *         schema:
 *           type: string
 *       - name: id
 *         in: path
 *         description: ID of board to update
 *         required: true
 *         schema:
 *           type: string
 *       - name: user-id
 *         in: path
 *         description: ID of user to add
 *         required: true
 *         schema:
 *           type: string
 *     tags: [Board]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       201:
 *         description: User added to Board successfully
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /v1/board/{id}/member/{user-id}:
 *   delete:
 *     summary: Remove a member from a board
 *     parameters:
 *       - in: header
 *         name: my-default
 *         schema:
 *           type: boolean
 *       - in: header
 *         name: workspace-id
 *         schema:
 *           type: string
 *       - name: id
 *         in: path
 *         description: ID of board to update
 *         required: true
 *         schema:
 *           type: string
 *       - name: user-id
 *         in: path
 *         description: ID of user to add
 *         required: true
 *         schema:
 *           type: string
 *     tags: [Board]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       201:
 *         description: User removed from Board successfully
 *       500:
 *         description: Internal Server Error
 */