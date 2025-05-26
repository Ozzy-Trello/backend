/**
 * @swagger
 * /v1/card/{id}/member:
 *   get:
 *     summary: Get members of a card
 *     tags: [ Card Member ]
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Card ID
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of card members
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 members:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CardMember'
 *             example:
 *               members:
 *                 - id: "uuid-user-1"
 *                   name: "user1"
 *                   email: "user1@email.com"
 *                 - id: "uuid-user-2"
 *                   name: "user2"
 *                   email: "user2@email.com"
 */

/**
 * @swagger
 * /v1/card/{id}/member:
 *   post:
 *     summary: Add members to a card
 *     tags: [ Card Member ]
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Card ID
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_ids:
 *                 type: array
 *                 items:
 *                   type: string
 *             required:
 *               - user_ids
 *           example:
 *             user_ids: ["uuid-user-1", "uuid-user-2"]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Members added
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 members:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CardMember'
 *             example:
 *               message: "Members added"
 *               members:
 *                 - id: "uuid-user-1"
 *                   name: "user1"
 *                   email: "user1@email.com"
 *                 - id: "uuid-user-2"
 *                   name: "user2"
 *                   email: "user2@email.com"
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "card_id and user_ids[] are required"
 */

/**
 * @swagger
 * /v1/card/{id}/member/{user_id}:
 *   delete:
 *     summary: Remove a member from a card
 *     tags: [ Card Member ]
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Card ID
 *         required: true
 *         schema:
 *           type: string
 *       - name: user_id
 *         in: path
 *         description: User ID
 *         required: true
 *         schema:
 *           type: string
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Member removed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "Member removed"
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             example:
 *               message: "card_id and user_id are required"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CardMember:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *       required:
 *         - id
 *         - name
 *         - email
 *       example:
 *         id: "uuid-user-1"
 *         name: "user1"
 *         email: "user1@email.com"
 */
