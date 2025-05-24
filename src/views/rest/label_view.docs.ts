/**
 * @swagger
 * components:
 *   schemas:
 *     CreateLabelModel:
 *       type: object
 *       required:
 *         - name
 *         - value
 *         - value_type
 *         - workspace_id
 *       properties:
 *         name:
 *           type: string
 *           description: The auto-generated id of the user identity
 *         value:
 *           type: string
 *           description: The title of your phone
 *         value_type:
 *           type: string
 *           description: list id
 *         workspace_id:
 *           type: string
 *           description: workspace id
 *       example:
 *         name: default 
 *         value: #12122
 *         value_type: color
 *         workspace_id: 407608EA-C0A5-4F30-B182-95E68A97BBF9
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     GetLabelModel:
 *       allOf:
 *         - $ref: '#/components/schemas/CreateLabelModel'
 *         - type: object
 *           properties:
 *             id:
 *               type: string
 *       example:
 *         id: "E7656DE4-6E7B-4C27-8589-E4227EE05C00"
 *         name: default 
 *         value: Label for all list
 *         value_type: color
 */

/**
 * @swagger
 * /v1/label:
 *   post:
 *     summary: Create Label
 *     tags: [ Label ]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateLabelModel'
 *     responses:
 *       200:
 *         token: "this token"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateLabelModel'
 *       500:
 *         description: Internal Server Error
 */


/**
 * @swagger
 * /v1/label:
 *   get:
 *     summary: Get label
 *     tags: [ Label ]
 *     parameters:
 *       - name: workspace-id
 *         in: header
 *         description: ID of list
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
 *                 $ref: '#/components/schemas/GetLabelModel'
 *       500:
 *         description: Internal Server Error
 */


/**
 * @swagger
 * /v1/label/{id}:
 *   get:
 *     summary: Get label details
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of label to update
 *         required: true
 *         schema:
 *           type: string
 *     tags: [ Label ]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         token: "this token"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GetLabelModel'
 *       500:
 *         description: Internal Server Error
 *
 */

/**
 * @swagger
 * /v1/label/{id}:
 *   put:
 *     summary: Update label details
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of label to update
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateLabelModel'
 *     tags: [ Label ]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       201:
 *         description: label updated successfully
 *       500:
 *         description: Internal Server Error
 *
 */


/**
 * @swagger
 * /v1/label/{id}:
 *   delete:
 *     summary: Delete a label
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of label to delete
 *         required: true
 *         schema:
 *           type: string
 *     tags: [ Label ]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       201:
 *         description: label deleted successfully
 *       500:
 *         description: Internal Server Error
 *
 */