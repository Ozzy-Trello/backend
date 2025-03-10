
/**
 * @swagger
 * components:
 *   schemas:
 *     CreateCustomFieldModel:
 *       type: object
 *       required:
 *         - name
 *         - description
 *       properties:
 *         name:
 *           type: string
 *           description: The auto-generated id of the user identity
 *         description:
 *           type: string
 *           description: The title of your phone
 *       example:
 *         name: default 
 *         description: CustomField for all list
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     GetCustomFieldModel:
 *       allOf:
 *         - $ref: '#/components/schemas/CreateCustomFieldModel'
 *         - type: object
 *           properties:
 *             id:
 *               type: string
 *       example:
 *         id: "E7656DE4-6E7B-4C27-8589-E4227EE05C00"
 *         name: default 
 *         description: CustomField for all list
 */

/**
 * @swagger
 * /v1/custom-field:
 *   post:
 *     summary: Create Custom Field
 *     tags: [ Custom Field ]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCustomFieldModel'
 *     responses:
 *       200:
 *         token: "this token"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateCustomFieldModel'
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /v1/custom-field:
 *   get:
 *     summary: Get custom field
 *     tags: [ Custom Field ]
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
 *                 $ref: '#/components/schemas/GetCustomFieldModel'
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /v1/custom-field/{id}:
 *   get:
 *     summary: Get custom field details
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of custom field to update
 *         required: true
 *         schema:
 *           type: string
 *     tags: [ Custom Field ]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         token: "this token"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GetCustomFieldModel'
 *       500:
 *         description: Internal Server Error
 *
 */

/**
 * @swagger
 * /v1/custom-field/{id}:
 *   put:
 *     summary: Update custom field details
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of custom field to update
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCustomFieldModel'
 *     tags: [ Custom Field ]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       201:
 *         description: custom field updated successfully
 *       500:
 *         description: Internal Server Error
 *
 */

/**
 * @swagger
 * /v1/custom-field/{id}:
 *   delete:
 *     summary: Delete a custom field
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of custom field to delete
 *         required: true
 *         schema:
 *           type: string
 *     tags: [ Custom Field ]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       201:
 *         description: custom field deleted successfully
 *       500:
 *         description: Internal Server Error
 *
 */
