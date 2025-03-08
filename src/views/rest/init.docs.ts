// =======  schemas  =======
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
 *     LoginResponseModel:
 *       type: object
 *       required:
 *         - access_token
 *         - refresh_token
 *       properties:
 *         access_token:
 *           type: string
 *           description: The auto-generated id of the user identity
 *         refresh_token:
 *           type: string
 *           description: The title of your password
 *       example:
 *         access_token: "xxxx"
 *         refresh_token: "xxxx"
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

/**
 * @swagger
 * components:
 *   schemas:
 *     RegisterResponseModel:
 *       type: object
 *       allOf:
 *         - $ref: '#/components/schemas/CreateWorkspaceModel'
 *         - type: object
 *           properties:
 *             user_id:
 *               type: string
 *       example:
 *         user_id: 0e41e5fe-6c52-461e-9624-e34633468e3a
 *         access_token: "xxxx"
 *         refresh_token: "xxxx"
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateWorkspaceModel:
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
 *         description: workspace for all boards
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     GetWorkspaceModel:
 *       allOf:
 *         - $ref: '#/components/schemas/CreateWorkspaceModel'
 *         - type: object
 *           properties:
 *             id:
 *               type: string
 *       example:
 *         id: "E7656DE4-6E7B-4C27-8589-E4227EE05C00"
 *         name: default 
 *         description: workspace for all boards
 */


/**
 * @swagger
 * components:
 *   schemas:
 *     WorkspaceMemberModel:
 *       type: object
 *       required:
 *         - user_id
 *         - role
 *       properties:
 *         user_id:
 *           type: string
 *           description: The auto-generated id of the user identity
 *         role:
 *           type: string
 *           description: The title of your phone
 *       example:
 *         user_id: 1
 *         role: admin
 */

// ==================================== start board ====================================

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateBoardModel:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - workspace_id
 *       properties:
 *         name:
 *           type: string
 *           description: The auto-generated id of the user identity
 *         description:
 *           type: string
 *           description: The title of your phone
 *         background:
 *           type: string
 *           description: The title of your phone
 *         workspace_id:
 *           type: string
 *           description: The title of your phone
 *       example:
 *         name: default 
 *         description: board for all workspaces
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     GetBoardModel:
 *       allOf:
 *         - $ref: '#/components/schemas/CreateBoardModel'
 *         - type: object
 *           properties:
 *             id:
 *               type: string
 *       example:
 *         id: "E7656DE4-6E7B-4C27-8589-E4227EE05C00"
 *         name: default 
 *         description: board for all workspaces
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     BoardMemberModel:
 *       type: object
 *       required:
 *         - user_id
 *         - role
 *       properties:
 *         user_id:
 *           type: string
 *           description: The auto-generated id of the user identity
 *         role:
 *           type: string
 *           description: The title of your phone
 *       example:
 *         user_id: 1
 *         role: admin
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     GetListModel:
 *       allOf:
 *         - $ref: '#/components/schemas/CreateBoardModel'
 *         - type: object
 *           properties:
 *             id:
 *               type: string
 *       example:
 *         id: "E7656DE4-6E7B-4C27-8589-E4227EE05C00"
 *         name: default 
 *         description: board for all workspaces
 */

// ==================================== end board ====================================

// ==================================== start board ====================================

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateAccessControlModel:
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
 *         permissions:
 *           type: string
 *           description: The title of your phone
 *       example:
 *         name: default 
 *         description: board for all workspaces
 *         permissions: aaaaa
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     GetAccessControlModel:
 *       allOf:
 *         - $ref: '#/components/schemas/CreateAccessControlModel'
 *         - type: object
 *           properties:
 *             id:
 *               type: string
 *       example:
 *         id: "E7656DE4-6E7B-4C27-8589-E4227EE05C00"
 *         name: default 
 *         description: board for all workspaces
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     AccessControlMemberModel:
 *       type: object
 *       required:
 *         - user_id
 *         - role
 *       properties:
 *         user_id:
 *           type: string
 *           description: The auto-generated id of the user identity
 *         role:
 *           type: string
 *           description: The title of your phone
 *       example:
 *         user_id: 1
 *         role: admin
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     GetListModel:
 *       allOf:
 *         - $ref: '#/components/schemas/CreateAccessControlModel'
 *         - type: object
 *           properties:
 *             id:
 *               type: string
 *       example:
 *         id: "E7656DE4-6E7B-4C27-8589-E4227EE05C00"
 *         name: default 
 *         description: board for all workspaces
 */

// ==================================== end board ====================================


/**
 * @swagger
 * components:
 *   schemas:
 *     CreateListModel:
 *       type: object
 *       required:
 *         - board_id
 *         - name
 *       properties:
 *         board_id:
 *           type: string
 *           description: The title of your phone
 *         order:
 *           type: integer
 *           description: The title of your phone
 *         name:
 *           type: string
 *           description: The title of your phone
 *         background:
 *           type: string
 *           description: The title of your phone
 *       example:
 *         board_id: "659cd528-1a9e-4ff4-a772-ce7aee2cbcb9"
 *         order: 1
 *         name: default 
 *         description: list for all List
 *         background: #ffffff
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateCardModel:
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
 *         description: Card for all list
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     GetCardModel:
 *       allOf:
 *         - $ref: '#/components/schemas/CreateCardModel'
 *         - type: object
 *           properties:
 *             id:
 *               type: string
 *       example:
 *         id: "E7656DE4-6E7B-4C27-8589-E4227EE05C00"
 *         name: default 
 *         description: Card for all list
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CardActivityModel:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the user identity
 *         card_id:
 *           type: string
 *           description: The title of your phone
 *         sender_user_id:
 *           type: string
 *           description: The title of your phone
 *         activity_type:
 *           type: string
 *           description: The title of your phone
 *       example:
 *         id: 1
 *         card_id: 1
 *         sender_user_id: 1
 *         activity_type: 1
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CreateCardCommentModel:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         card_id:
 *           type: string
 *         text:
 *           type: string
 *       example:
 *         id: 1
 *         card_id: 1
 *         text: 'Hello world!'
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     CardActionModel:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the user identity
 *         activity_id:
 *           type: string
 *           description: The title of your phone
 *         action:
 *           type: string
 *           description: The title of your phone
 *         source:
 *           type: object
 *           description: The title of your phone
 *       example:
 *         id: 1
 *         activity_id: 1
 *         action: 'assign_tag'
 *         source: { tag_id: 1 }
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     UserRoleModel:
 *       type: object
 *       properties:
 *         user_id:
 *           type: string
 *           description: The title of your phone
 *         role_id:
 *           type: string
 *           description: The title of your phone
 *       example:
 *         user_id: 1
 *         role_id: 1
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     RolesModel:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the user identity
 *         name:
 *           type: string
 *           description: The title of your phone
 *         description:
 *           type: string
 *           description: The title of your phone
 *         workspace_id:
 *           type: string
 *           description: The title of your phone
 *         permission_id:
 *           type: string
 *           description: The title of your phone
 *       example:
 *         id: 1
 *         name: admin
 *         description: admin@admin.com
 *         workspace_id: 1
 *         permission_id: 1
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     TagModel:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the user identity
 *         name:
 *           type: string
 *           description: The title of your phone
 *       example:
 *         id: 1
 *         name: coba
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     PermissionModel:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated id of the user identity
 *         feature:
 *           type: string
 *           description: The title of your phone
 *         description:
 *           type: string
 *           description: The title of your phone
 *         read:
 *           type: boolean
 *         write:
 *           type: boolean
 *         execute:
 *           type: boolean
 *       example:
 *         id: 1
 *         name: admin
 *         description: admin@admin.com
 *         workspace_id: 1
 *         permission_id: 1
 */


/**
 * @swagger
 * components:
 *   schemas:
 *     PermissionRoleModel:
 *       type: object
 *       properties:
 *         role_id:
 *           type: string
 *           description: The auto-generated id of the user identity
 *         permission_id:
 *           type: string
 *           description: The title of your phone
 *       example:
 *         role_id: 1
 *         permission_id: 1
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     FileModel:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         prefix:
 *           type: string
 *         url:
 *           type: string   
 *         extension:
 *           type: string
 *         size:
 *           type: number
 *         size_unit:
 *           type: string
 *       example:
 *         id: 8a476b8c-b0ac-4b44-885f-93f6037e8ad5
 *         name: 'image.png'
 *         prefix: 'image'
 *         extension: 'png'
 *         size: 123456
 *         size_unit: 'KB '
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Pagination:
 *       type: object
 *       properties:
 *         limit:
 *           type: integer
 *           example: 10
 *         page:
 *           type: integer
 *           example: 1
 *         total_data:
 *           type: integer
 *           example: 1
 *         total_page:
 *           type: integer
 *           example: 1
 *         next_page:
 *           type: integer
 *           nullable: true
 *           example: null
 *         prev_page:
 *           type: integer
 *           nullable: true
 *           example: null
 */

// =======  tags  =======

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: The authentication managing API
 */

/**
 * @swagger
 * tags:
 *   name: Access Control
 *   description: The access control managing API
 */

/**
 * @swagger
 * tags:
 *   name: Account
 *   description: The account managing API
 */

/**
 * @swagger
 * tags:
 *   name: Workspace
 *   description: The workspace managing API
 */

/**
 * @swagger
 * tags:
 *   name: Board
 *   description: The board managing API
 */

/**
 * @swagger
 * tags:
 *   name: Card
 *   description: The card managing API
 */

/**
 * @swagger
 * tags:
 *   name: CardActivity
 *   description: The card activity managing API
 */

/**
 * @swagger
 * tags:
 *   name: List
 *   description: The list managing API
 */

/**
 * @swagger
 * tags:
 *   name: File
 *   description: The file managing API
 */

