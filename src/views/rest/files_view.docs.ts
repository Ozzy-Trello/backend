/**
 * @swagger
 * /v1/file:
 *   post:
 *     summary: Update file
 *     tags: [ File ]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 required: true
 *                 type: string
 *                 format: binary
 *               name:
 *                 required: true
 *                 type: string
 *               prefix:
 *                 type: string
 *     responses:
 *       200:
 *         token: "this token"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FileModel'
 *       500:
 *         description: Internal Server Error
 *
 */

/**
 * @swagger
 * /v1/file:
 *   get:
 *     summary: Get file list
 *     tags: [ File ]
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
 *               $ref: '#/components/schemas/FileModel'

 *       500:
 *         description: Internal Server Error
 *
 */

/**
 * @swagger
 * /v1/file/{id}:
 *   get:
 *     summary: Get File Detail
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of file to download
 *         required: true
 *         schema:
 *           type: integer
 *     tags: [ File ]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: download file
 *         token: "this token"
 *       500:
 *         description: Internal Server Error
 *
 */

/**
 * @swagger
 * /v1/file/{id}:
 *   delete:
 *     summary: Delete a file
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of file to delete
 *         required: true
 *         schema:
 *           type: string
 *     tags: [File]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       201:
 *         description: User removed from Board successfully
 *       500:
 *         description: Internal Server Error
 */