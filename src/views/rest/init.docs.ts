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
 *         phone:
 *           type: string
 *           description: Add your phone number
 *       example:
 *         username: admin
 *         email: admin@admin.com
 *         password: aDm1n
 *         phone: "082332884"
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
