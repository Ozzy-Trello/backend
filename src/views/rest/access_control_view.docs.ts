/**
 * @swagger
 * /v1/access-control:
 *   post:
 *     x-beta: true
 *     x-internal: true
 *     summary: Create Access Control
 *     tags: [ Access Control ]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAccessControlModel'
 *     responses:
 *       200:
 *         token: "this token"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateAccessControlModel'
 *       500:
 *         description: Internal Server Error
 *
 */

/**
 * @swagger
 * /v1/access-control:
 *   get:
 *     summary: Get Access Control list
 *     tags: [ Access Control ]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - name: workspace-id
 *         in: query
 *         schema:
 *           type: string
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         token: "this token"
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/GetAccessControlModel'
 *       500:
 *         description: Internal Server Error
 *
 */

/**
 * @swagger
 * /v1/access-control/{id}:
 *   get:
 *     summary: Get Access Control details
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of Access Control to update
 *         required: true
 *         schema:
 *           type: string
 *     tags: [ Access Control ]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         token: "this token"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GetAccessControlModel'
 *       500:
 *         description: Internal Server Error
 *
 */

/**
 * @swagger
 * /v1/access-control/{id}:
 *   put:
 *     summary: Update Access Control details
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of Access Control to update
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateAccessControlModel'
 *     tags: [ Access Control ]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       201:
 *         description: Access Control updated successfully
 *       500:
 *         description: Internal Server Error
 *
 */


/**
 * @swagger
 * /v1/access-control/{id}:
 *   delete:
 *     summary: Delete a Access Control
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of Access Control to delete
 *         required: true
 *         schema:
 *           type: string
 *     tags: [ Access Control ]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       201:
 *         description: Access Control deleted successfully
 *       500:
 *         description: Internal Server Error
 *
 */
