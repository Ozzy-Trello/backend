/**
 * @swagger
 * /v1/card:
 *   post:
 *     summary: Create Card
 *     tags: [ Card ]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCardModel'
 *     responses:
 *       200:
 *         token: "this token"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateCardModel'
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /v1/card:
 *   get:
 *     summary: Get card
 *     tags: [ Card ]
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
 *                 $ref: '#/components/schemas/GetCardModel'
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /v1/card/{id}:
 *   get:
 *     summary: Get card details
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of card to update
 *         required: true
 *         schema:
 *           type: string
 *     tags: [ Card ]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         token: "this token"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GetCardModel'
 *       500:
 *         description: Internal Server Error
 *
 */

/**
 * @swagger
 * /v1/card/{id}:
 *   put:
 *     summary: Update card details
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of card to update
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCardModel'
 *     tags: [ Card ]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       201:
 *         description: card updated successfully
 *       500:
 *         description: Internal Server Error
 *
 */

/**
 * @swagger
 * /v1/card/{id}:
 *   delete:
 *     summary: Delete a card
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of card to delete
 *         required: true
 *         schema:
 *           type: string
 *     tags: [ Card ]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       201:
 *         description: card deleted successfully
 *       500:
 *         description: Internal Server Error
 *
 */

/**
 * @!swagger
 * /v1/card/{id}/tag:
 *   get:
 *     summary: Get a card's tags
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of card to get tags
 *         required: true
 *         schema:
 *           type: string
 *     tags: [ Card ]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         token: "this token"
 *         content:
 *           application/json:
 *       500:
 *         description: Internal Server Error
 */

/**
 * @!swagger
 * /v1/card/{id}/tag/{tag-id}:
 *   post:
 *     summary: add a tag to a card
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of card to delete
 *         required: true
 *         schema:
 *           type: string
 *       - name: tag-id
 *         in: path
 *         description: ID of tag to add
 *         required: true
 *         schema:
 *           type: string
 *     tags: [ Card ]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       201:
 *         description: card tag added successfully
 *       500:
 *         description: Internal Server Error
 */

/**
 * @!swagger
 * /v1/card/{id}/tag/{tag-id}:
 *   delete:
 *     summary: Remove a tag from a card
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of card to delete
 *         required: true
 *         schema:
 *           type: string
 *       - name: tag-id
 *         in: path
 *         description: ID of tag to remove
 *         required: true
 *         schema:
 *           type: string
 *     tags: [ Card ]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       201:
 *         description: card deleted successfully
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /v1/card/{id}/activity:
 *   get:
 *     summary: Get a card's activity
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of card to get activity
 *         required: true
 *         schema:
 *           type: string
 *     tags: [ CardActivity ]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *             example:
 *               - id: 'c91c2e42-c672-4ad8-9e22-92af58cad396'
 *                 sender_username: '@leader'
 *                 sender_user_id: '627ca47b-8e04-49b7-a623-feb3bfeeacd6'
 *                 type: 'text'
 *                 text: 'Hello world!'
 *               - id: '627ca47b-8e04-49b7-a623-feb3bfeeacd6'
 *                 sender_username: '@coklat127'
 *                 sender_user_id: '627ca47b-8e04-49b7-a623-feb3bfeeacd6'
 *                 type: 'action'
 *                 source:
 *                   action_type: 'move'
 *                   from_id: '627ca47b-8e04-49b7-a623-feb3bfeeacd6'
 *                   from: 'to do'
 *                   destination: 'in progress'
 *                   destination_id: '627ca47b-8e04-49b7-a623-feb3bfeeacd6'
 *               - id: '627ca47b-8e04-49b7-a623-feb3bfeeacd6'
 *                 sender_username: '@coklat127'
 *                 sender_user_id: '627ca47b-8e04-49b7-a623-feb3bfeeacd6'
 *                 type: 'action'
 *                 source:
 *                   action_type: 'add tag'
 *                   tag_id: '627ca47b-8e04-49b7-a623-feb3bfeeacd6'
 *                   tag_name: 'Red'
 *               - id: '627ca47b-8e04-49b7-a623-feb3bfeeacd6'
 *                 sender_username: '@rhyanz46'
 *                 sender_user_id: '627ca47b-8e04-49b7-a623-feb3bfeeacd6'
 *                 type: 'action'
 *                 source:
 *                   action_type: 'remove tag'
 *                   tag_id: '627ca47b-8e04-49b7-a623-feb3bfeeacd6'
 *                   tag_name: 'Blue'
 *       500:
 *         description: Internal Server Error
 */

