
/**
 * @swagger
 * components:
 *   schemas:
 *     CreateCardModel:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - list_id
 *       properties:
 *         name:
 *           type: string
 *           description: The auto-generated id of the user identity
 *         description:
 *           type: string
 *           description: The title of your phone
 *         list_id:
 *           type: string
 *           description: list id
 *       example:
 *         name: default 
 *         description: Card for all list
 *         list_id: list id
 */


/**
 * @swagger
 * components:
 *   schemas:
 *     AssiggnCustomFieldTrigger:
 *       type: object
 *       properties:
 *         trigger:
 *           type: object
 *           description: The auto-generated id of the user identity
 *         value:
 *           type: object
 *           description: The auto-generated id of the user identity
 *       example:
 *         trigger:
 *           condition_value: 'value to trigger'
 *           action:
 *             target_list_id: '627ca47b-8e04-49b7-a623-feb3bfeeacd6'
 *             message_telegram: 'hallo'
 *             label_card_id: '627ca47b-8e04-49b7-a623-feb3bfeeacd6'
 *         value: "aa"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     GetCardModel:
 *       allOf:
 *         - $ref: '#/components/schemas/CreateCardModel'
 *         - type: object
 *           properties:
 *             id:
 *               type: string
 *       example:
 *         id: "E7656DE4-6E7B-4C27-8589-E4227EE05C00"
 *         name: default 
 *         description: Card for all list
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CardActivityModel:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the user identity
 *         card_id:
 *           type: string
 *           description: The title of your phone
 *         sender_user_id:
 *           type: string
 *           description: The title of your phone
 *         activity_type:
 *           type: string
 *           description: The title of your phone
 *       example:
 *         id: 1
 *         card_id: 1
 *         sender_user_id: 1
 *         activity_type: 1
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateCardCommentModel:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         card_id:
 *           type: string
 *         text:
 *           type: string
 *       example:
 *         id: 1
 *         card_id: 1
 *         text: 'Hello world!'
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CardActionModel:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the user identity
 *         activity_id:
 *           type: string
 *           description: The title of your phone
 *         action:
 *           type: string
 *           description: The title of your phone
 *         source:
 *           type: object
 *           description: The title of your phone
 *       example:
 *         id: 1
 *         activity_id: 1
 *         action: 'assign_tag'
 *         source: { tag_id: 1 }
 */

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
 *     parameters:
 *       - name: list-id
 *         in: header
 *         description: ID of board
 *         required: true
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
 * @swagger
 * components:
 *   schemas:
 *     CardMoveModel:
 *       type: object
 *       required:
 *         - target_position
 *       properties:
 *         target_list_id:
 *           type: string
 *           description: ID of the target list to move the card to
 *         previous_list_id:
 *           type: string
 *           description: ID of the current list the card is in
 *         target_position:
 *           type: number
 *           description: The position in the target list where the card should be placed
 *         previous_position:
 *           type: number
 *           description: The current position of the card in its list
 *       example:
 *         target_list_id: "627ca47b-8e04-49b7-a623-feb3bfeeacd6"
 *         previous_list_id: "a17ca47b-9e04-48b7-b623-feb3bfeeabd7"
 *         target_position: 2
 *         previous_position: 0
 */

/**
 * @swagger
 * /v1/card/{id}/move:
 *   post:
 *     summary: Move a card within a list or to another list
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of card to move
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CardMoveModel'
 *     tags: [ Card ]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Card moved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/GetCardModel'
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad Request - Invalid parameters
 *       404:
 *         description: Card or list not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /v1/card/{id}/custom-field:
 *   get:
 *     summary: get custom fields
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of card
 *         required: true
 *         schema:
 *           type: string
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
 * /v1/card/{id}/custom-field/{custom-field-id}:
 *   post:
 *     summary: Add custom field to card
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of card
 *         required: true
 *         schema:
 *           type: string
 *       - name: custom-field-id
 *         in: path
 *         description: ID of custom field to add
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AssiggnCustomFieldTrigger'
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
 * /v1/card/{id}/custom-field/{custom-field-id}:
 *   delete:
 *     summary: Delete custom field to card
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of card
 *         required: true
 *         schema:
 *           type: string
 *       - name: custom-field-id
 *         in: path
 *         description: ID of custom field to add
 *         required: true
 *         schema:
 *           type: string
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
 * /v1/card/{id}/custom-field/{custom-field-id}:
 *   put:
 *     summary: Delete custom field to card
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of card
 *         required: true
 *         schema:
 *           type: string
 *       - name: custom-field-id
 *         in: path
 *         description: ID of custom field to add
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           type: object
 *           required:
 *             - value
 *           properties:
 *             value:
 *               type: string
 *               description: The auto-generated id of the user identity
 *           example:
 *             value: "dedoieajhdewio" 
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

/**
 * @swagger
 * components:
 *   schemas:
 *     CardTimeInListModel:
 *       type: object
 *       properties:
 *         list_id:
 *           type: string
 *           description: ID of the list
 *         list_name:
 *           type: string
 *           description: Name of the list
 *         total_seconds:
 *           type: number
 *           description: Total time spent in the list in seconds
 *         formatted_time:
 *           type: string
 *           description: Human-readable formatted time (e.g., "5 minutes", "2 hours", "3 days")
 *       example:
 *         list_id: "627ca47b-8e04-49b7-a623-feb3bfeeacd6"
 *         list_name: "In Progress"
 *         total_seconds: 86400
 *         formatted_time: "1 day"
 */

/**
 * @swagger
 * /v1/card/{id}/time-in-lists:
 *   get:
 *     summary: Get time spent by a card in each list
 *     tags: [Card]
 *     description: Retrieves the total time a card has spent in each list it has been assigned to
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of card to get time tracking data
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CardTimeInListModel'
 *                 message:
 *                   type: string
 *             example:
 *               message: "Card time in lists retrieved successfully"
 *               data:
 *                 - list_id: "627ca47b-8e04-49b7-a623-feb3bfeeacd6"
 *                   list_name: "In Progress"
 *                   total_seconds: 86400
 *                   formatted_time: "1 day"
 *                 - list_id: "a17ca47b-9e04-48b7-b623-feb3bfeeabd7"
 *                   list_name: "To Do"
 *                   total_seconds: 3600
 *                   formatted_time: "1 hour"
 *                 - list_id: "b27ca48c-4e54-49b7-a623-feb3bfeeacd7"
 *                   list_name: "Done"
 *                   total_seconds: 7200
 *                   formatted_time: "2 hours"
 *       400:
 *         description: Bad Request - Invalid card ID
 *       404:
 *         description: Card not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /v1/card/{id}/time-in-board/{board_id}:
 *   get:
 *     summary: Get time spent by a card in a specific board
 *     tags: [Card]
 *     description: Retrieves the total time a card has spent in a specific board
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of card to get time tracking data
 *         required: true
 *         schema:
 *           type: string
 *       - name: board_id
 *         in: path
 *         description: ID of the board to get time tracking data
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     card_id:
 *                       type: string
 *                     board_id:
 *                       type: string
 *                     entered_at:
 *                       type: string
 *                       format: date-time
 *                     exited_at:
 *                       type: string
 *                       format: date-time
 *                     formatted_time_in_board:
 *                       type: string
 *                       description: Human-readable formatted time (e.g., "5 minutes", "2 hours", "3 days")
 *                     board_name:
 *                       type: string
 *                       description: Name of the board
 *                 message:
 *                   type: string
 *             example:
 *               message: "Card time in board retrieved successfully"
 *               data:
 *                 id: "627ca47b-8e04-49b7-a623-feb3bfeeacd6"
 *                 card_id: "627ca47b-8e04-49b7-a623-feb3bfeeacd6"
 *                 board_id: "627ca47b-8e04-49b7-a623-feb3bfeeacd6"
 *                 entered_at: "2023-10-01T12:00:00Z"
 *                 exited_at: "2023-10-02T12:00:00Z"
 *                 formatted_time_in_board: "1 day"
 *                 board_name: "Project Board"
 *       400:
 *         description: Bad Request - Invalid card ID or board ID
 *       404:
 *         description: Card or board not found
 *       500:
 *         description: Internal Server Error
 */