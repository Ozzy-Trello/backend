//Schemas
/**
 * @swagger
 * components:
 *   schemas:
 *     LoginModel:
 *       type: object
 *       required:
 *         - identity
 *         - password
 *       properties:
 *         identity:
 *           type: string
 *           description: The auto-generated id of the user identity
 *         password:
 *           type: string
 *           description: The title of your password
 *       example:
 *         identity: admin
 *         password: aDm1n
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     RegisterModel:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           description: The auto-generated id of the user identity
 *         email:
 *           type: string
 *           description: The auto-generated id of the user identity
 *         password:
 *           type: string
 *           description: The title of your password
 *       example:
 *         username: admin
 *         email: admin@admin.com
 *         password: aDm1n
 */


/**
 * @swagger
 * components:
 *   schemas:
 *     AccountModel:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - phone
 *       properties:
 *         username:
 *           type: string
 *           description: The auto-generated id of the user identity
 *         email:
 *           type: string
 *           description: The auto-generated id of the user identity
 *         phone:
 *           type: string
 *           description: The title of your phone
 *       example:
 *         username: admin
 *         email: admin@admin.com
 *         phone: 102902901902
 */

//AuthModel
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
 *     summary: Login Register
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


//AccountModel
/**
 * @swagger
 * tags:
 *   name: Account
 *   description: The account managing API
 * /v1/account:
 *   get:
 *     summary: Login Register
 *     tags: [Account]
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