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
 *               group_type:
 *                 type: string
 *                 example: "card_move"
 *               type:
 *                 type: string
 *                 example: "when_a_card_<filter>_is_<action>_to_the_<board>_by_<by>"
 *               condition:
 *                 type: object
 *                 properties:
 *                   action:
 *                     type: string
 *                     example: "added"
 *                   board:
 *                     type: string
 *                     example: "036e1ffa-b93f-453a-9ea6-3d1c56276cd9"
 *                   by:
 *                     type: string
 *                     example: "every_one"
 *               workspace_id:
 *                 type: string
 *                 format: uuid
 *                 example: "627ca47b-8e04-49b7-a623-feb3bfeeacd6"
 *               action:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     group_type:
 *                       type: string
 *                       example: "card_move"
 *                     type:
 *                       type: string
 *                       example: "<action>_the_card_to_a_specific_<position>_<optional_board>"
 *                     condition:
 *                       type: object
 *                       properties:
 *                         action:
 *                           type: string
 *                           example: "move"
 *                         position:
 *                           type: string
 *                           example: "top_of_list"
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