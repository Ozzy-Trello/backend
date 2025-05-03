/**
 * @swagger
 * /v1/trigger:
 *   post:
 *     x-beta: true
 *     x-internal: true
 *     summary: Create automation rule
 *     tags: [ Trigger ]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 example: "card_move"
 *               condition:
 *                 type: object
 *                 properties:
 *                   type:
 *                     type: string
 *                     example: "list_action"
 *                   by:
 *                     type: string
 *                     example: "every_one"
 *                   action:
 *                     type: string
 *                     example: "added"
 *               workspace_id:
 *                 type: string
 *                 format: uuid
 *                 example: "627ca47b-8e04-49b7-a623-feb3bfeeacd6"
 *               action:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     type:
 *                       type: string
 *                       example: "card_move"
 *                     condition:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           type:
 *                             type: string
 *                             example: "copy"
 *                           include_comments:
 *                             type: boolean
 *                             example: true
 *                           positon:
 *                             type: string
 *                             example: "bottom"
 *                           id_list:
 *                             type: string
 *                             format: uuid
 *                             example: "627ca47b-8e04-49b7-a623-feb3bfeeacd6"
 *                           board_id:
 *                             type: string
 *                             format: uuid
 *                             example: "627ca47b-8e04-49b7-a623-feb3bfeeacd6"
 *     responses:
 *       201:
 *         description: Automation rule created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Automation rule created successfully"
 *                 data:
 *                   type: object
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /v1/trigger:
 *   get:
 *     summary: Get trigger list
 *     tags: [ Trigger ]
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
 *                 $ref: '#/components/schemas/GetBoardModel'
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /v1/trigger/{id}:
 *   get:
 *     summary: Get trigger details
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
 *         description: ID of trigger to update
 *         required: true
 *         schema:
 *           type: string
 *     tags: [ Trigger ]
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
 */

/**
 * @swagger
 * /v1/trigger/{id}:
 *   put:
 *     summary: Update trigger details
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
 *         description: ID of trigger to update
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBoardModel'
 *     tags: [ Trigger ]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       201:
 *         description: trigger updated successfully
 *       500:
 *         description: Internal Server Error
 */


/**
 * @swagger
 * /v1/trigger/{id}:
 *   delete:
 *     summary: Delete a trigger
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
 *         description: ID of trigger to delete
 *         required: true
 *         schema:
 *           type: string
 *     tags: [ Trigger ]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       201:
 *         description: trigger deleted successfully
 *       500:
 *         description: Internal Server Error
 */


/**
 * @!swagger
 * /v1/trigger/{id}/member/{user-id}:
 *   post:
 *     summary: Add a member to a trigger
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
 *         description: ID of trigger to update
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
 * @!swagger
 * /v1/trigger/{id}/member/{user-id}:
 *   delete:
 *     summary: Remove a member from a trigger
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
 *         description: ID of trigger to update
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