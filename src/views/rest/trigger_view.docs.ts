/**
 * @swagger
 * /v1/trigger:
 *   post:
 *     x-beta: true
 *     x-internal: true
 *     summary: Create trigger
 *     tags: [ Trigger ]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *               type: object
 *           example:
 *             name: hallo
 *             condition_value: 'value to trigger'
 *             workspace_id: id dari workspace
 *             action:
 *               target_list_id: '627ca47b-8e04-49b7-a623-feb3bfeeacd6'
 *               message_telegram: 'hallo'
 *               label_card_id: '627ca47b-8e04-49b7-a623-feb3bfeeacd6' 
 *     responses:
 *       200:
 *         token: "this token"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateBoardModel'
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