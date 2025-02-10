//AccountModel
/**
 * @swagger
 * tags:
 *   name: Account
 *   description: The account managing API
 * /v1/account:
 *   get:
 *     summary: Get Current Account
 *     tags: [Account]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         token: "this token"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AccountModel'
 *       500:
 *         description: Internal Server Error
 *
 */