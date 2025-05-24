/**
 * @swagger
 * components:
 *   schemas:
 *     CreateCardAttachmentModel:
 *       type: object
 *       required:
 *         - card_id
 *         - attachable_type
 *         - attachable_id
 *       properties:
 *         card_id:
 *           type: string
 *           description: The ID of the card to attach to
 *         attachable_type:
 *           type: string
 *           description: The type of attachment (card or file)
 *           enum: ['card', 'file']
 *         attachable_id:
 *           type: string
 *           description: The ID of the attachable object
 *         is_cover:
 *           type: boolean
 *           description: Whether this attachment is the card cover
 *       example:
 *         card_id: "627ca47b-8e04-49b7-a623-feb3bfeeacd6"
 *         attachable_type: "file"
 *         attachable_id: "a17ca47b-9e04-48b7-b623-feb3bfeeabd7"
 *         is_cover: false
 */


/**
 * @swagger
 * components:
 *   schemas:
 *     GetCardAttachmentModel:
 *       allOf:
 *         - $ref: '#/components/schemas/CreateCardAttachmentModel'
 *         - type: object
 *           properties:
 *             id:
 *               type: string
 *               description: The ID of the card attachment
 *             metadata:
 *               type: object
 *               description: Additional metadata for the attachment
 *             created_by:
 *               type: string
 *               description: ID of the user who created the attachment
 *             created_at:
 *               type: string
 *               format: date-time
 *               description: Creation timestamp
 *             updated_at:
 *               type: string
 *               format: date-time
 *               description: Last update timestamp
 *       example:
 *         id: "e7656de4-6e7b-4c27-8589-e4227ee05c00"
 *         card_id: "627ca47b-8e04-49b7-a623-feb3bfeeacd6"
 *         attachable_type: "file"
 *         attachable_id: "a17ca47b-9e04-48b7-b623-feb3bfeeabd7"
 *         is_cover: false
 *         metadata: {}
 *         created_by: "b27ca47b-8e04-49b7-a623-feb3bfeebdf8"
 *         created_at: "2025-05-01T12:00:00Z"
 *         updated_at: "2025-05-01T12:00:00Z"
 */

/**
 * @swagger
 * /v1/card-attachment:
 *   post:
 *     summary: Create Card Attachment
 *     tags: [Card Attachment]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCardAttachmentModel'
 *     responses:
 *       201:
 *         description: Card attachment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/GetCardAttachmentModel'
 *                 message:
 *                   type: string
 *       400:
 *         description: Bad Request
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /v1/card-attachment:
 *   get:
 *     summary: Get card attachment list
 *     tags: [Card Attachment]
 *     parameters:
 *       - name: card-id
 *         in: header
 *         description: ID of card
 *         required: false
 *         schema:
 *           type: string
 *       - name: attachable_id
 *         in: query
 *         description: ID of the attachable object (either card or file)
 *         required: false
 *         schema:
 *           type: string
 *       - name: attachable_type
 *         in: query
 *         description: Type of the attachable object (either 'card' or 'file')
 *         required: false
 *         schema:
 *            type: string
 *       - name: page
 *         in: query
 *         schema:
 *           type: number
 *         default: 1
 *       - name: limit
 *         in: query
 *         schema:
 *           type: number
 *         default: 10
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of card attachments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/GetCardAttachmentModel'
 *                 message:
 *                   type: string
 *                 paginate:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                     current_page:
 *                       type: number
 *                     last_page:
 *                       type: number
 *                     per_page:
 *                       type: number
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /v1/card-attachment/{id}:
 *   get:
 *     summary: Get card attachment details
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of card attachment to retrieve
 *         required: true
 *         schema:
 *           type: string
 *     tags: [Card Attachment]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Card attachment details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/GetCardAttachmentModel'
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Card attachment not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /v1/card-attachment/{id}:
 *   delete:
 *     summary: Delete a card attachment
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of card attachment to delete
 *         required: true
 *         schema:
 *           type: string
 *     tags: [Card Attachment]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Card attachment deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Card attachment not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /v1/card/{cardId}/cover:
 *   get:
 *     summary: Get a card's cover attachment
 *     parameters:
 *       - name: cardId
 *         in: path
 *         description: ID of card to get cover attachment
 *         required: true
 *         schema:
 *           type: string
 *     tags: [Card Attachment]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Card cover attachment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/GetCardAttachmentModel'
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Card cover not found
 *       500:
 *         description: Internal Server Error
 */