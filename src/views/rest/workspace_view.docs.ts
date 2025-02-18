/**
 * @swagger
 * /v1/workspace:
 *   post:
 *     x-beta: true
 *     x-internal: true
 *     summary: Create Workspace
 *     tags: [Workspace]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateWorkspaceModel'
 *     responses:
 *       200:
 *         token: "this token"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateWorkspaceModel'
 *       500:
 *         description: Internal Server Error
 *
 */

/**
 * @swagger
 * /v1/workspace:
 *   get:
 *     summary: Get workspace list
 *     tags: [Workspace]
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
 *                 $ref: '#/components/schemas/GetWorkspaceModel'
 *       500:
 *         description: Internal Server Error
 *
 */

/**
 * @swagger
 * /v1/workspace/{id}:
 *   get:
 *     summary: Get workspace details
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of workspace to update
 *         required: true
 *         schema:
 *           type: integer
 *     tags: [Workspace]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         token: "this token"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/GetWorkspaceModel'
 *       500:
 *         description: Internal Server Error
 *
 */

/**
 * @swagger
 * /v1/workspace/{id}:
 *   put:
 *     summary: Update workspace details
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of workspace to update
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateWorkspaceModel'
 *     tags: [Workspace]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       201:
 *         description: Workspace updated successfully
 *       500:
 *         description: Internal Server Error
 *
 */

/**
 * @swagger
 * /v1/workspace/{id}/member/{user-id}:
 *   post:
 *     summary: Add a member to a workspace
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of workspace to update
 *         required: true
 *         schema:
 *           type: string
 *       - name: user-id
 *         in: path
 *         description: ID of user to add
 *         required: true
 *         schema:
 *           type: string
 *     tags: [Workspace]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       201:
 *         description: User added to Workspace successfully
 *       500:
 *         description: Internal Server Error
 *
 */

/**
 * @swagger
 * /v1/workspace/{id}/member/{user-id}:
 *   delete:
 *     summary: Remove a member from a workspace
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of workspace to update
 *         required: true
 *         schema:
 *           type: string
 *       - name: user-id
 *         in: path
 *         description: ID of user to add
 *         required: true
 *         schema:
 *           type: string
 *     tags: [Workspace]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       201:
 *         description: User added to Workspace successfully
 *       500:
 *         description: Internal Server Error
 *
 */

/**
 * @swagger
 * /v1/workspace/{id}/member/{user-id}/role:
 *   put:
 *     summary: Update a member's role in a workspace
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of workspace to update
 *         required: true
 *         schema:
 *           type: string
 *       - name: user-id
 *         in: path
 *         description: ID of user to add
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               role:
 *                 type: string
 *             example:
 *               role: designer
 *     tags: [Workspace]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       201:
 *         description: User added to Workspace successfully
 *       500:
 *         description: Internal Server Error
 *
 */

/**
 * @swagger
 * /v1/workspace/{id}:
 *   delete:
 *     summary: Delete a workspace
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of workspace to update
 *         required: true
 *         schema:
 *           type: integer
 *     tags: [Workspace]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       201:
 *         description: Workspace deleted successfully
 *       500:
 *         description: Internal Server Error
 *
 */