/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: The auth managing API
 * /v1/auth/login:
 *   post:
 *     summary: Login User
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginModel'
 *     responses:
 *       200:
 *         token: "this token"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginModel'
 *       500:
 *         description: Internal Server Error
 *
 */

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: The auth managing API
 * /v1/auth/register:
 *   post:
 *     summary: Register endpoint, only granted for admin
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterModel'
 *     responses:
 *       200:
 *         token: "this token"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegisterModel'
 *       500:
 *         description: Internal Server Error
 *
 */

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: The auth managing API
 * /v1/auth/refresh-token:
 *   post:
 *     summary: Get New Token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterModel'
 *     responses:
 *       200:
 *         token: "this token"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegisterModel'
 *       500:
 *         description: Internal Server Error
 *
 */
