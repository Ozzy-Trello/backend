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
 *           type: integer
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
 *           type: integer
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
 *         description: board updated successfully
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
 *           type: integer
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

