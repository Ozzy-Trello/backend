import {filterBoardDetail, BoardDetail, BoardDetailUpdate, BoardRepositoryI} from "@/repository/board/board_interfaces";
import Board from "@/database/schemas/board";
import {Error, Op} from "sequelize";
import {ResponseData, ResponseListData} from "@/utils/response_utils";
import {StatusCodes} from "http-status-codes";
import {InternalServerError} from "@/utils/errors";
import {Paginate} from "@/utils/data_utils";
import BoardMember from "@/database/schemas/board_member";
import db from "@/database";

export class BoardRepository implements BoardRepositoryI {
	createFilter(filter: filterBoardDetail): any {
		const whereClause: any = {};
		const orConditions: any[] = [];
		const notConditions: any[] = [];

		if (filter.id) whereClause.id = filter.id;
		if (filter.name) whereClause.name = filter.name;
		if (filter.description) whereClause.description = filter.description;
		if (filter.workspace_id) whereClause.workspace_id = filter.workspace_id;
	
		if (filter.__orId) orConditions.push({ id: filter.__orId });
		if (filter.__orName) orConditions.push({ name: filter.__orName });
		if (filter.__orDescription) orConditions.push({ description: filter.__orDescription });
		if (filter.__orWorkspaceId) orConditions.push({ workspace_id: filter.__orWorkspaceId });

		if (filter.__notId) notConditions.push({ id: filter.__notId });
		if (filter.__notName) notConditions.push({ name: filter.__notName });
		if (filter.__notDescription) notConditions.push({ description: filter.__notDescription });
		if (filter.__notWorkspaceId) notConditions.push({ workspace_id: filter.__notWorkspaceId });

		if (notConditions.length > 0) {
			whereClause[Op.not] = notConditions;
		}

		if (orConditions.length > 0) {
			whereClause[Op.or] = orConditions;
		}
		return whereClause
	}

	async deleteBoard(filter: filterBoardDetail): Promise<number> {
		try {
			const board = await Board.destroy({where: this.createFilter(filter)});
			if (board <= 0) {
				return StatusCodes.NOT_FOUND
			}
			return StatusCodes.NO_CONTENT
		} catch (e) {
			if (e instanceof Error) {
				throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e.message)
			}
			throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e as string)
		}
	}

	async createBoard(data: BoardDetail): Promise<ResponseData<BoardDetail>> {
		try {
			const board = await Board.create({
				name: data.name!,
				description: data.description!,
				background: data.background!,
				workspace_id: data.workspace_id
			});
			return new ResponseData({
				status_code: StatusCodes.OK,
				message: "create board success",
				data: new BoardDetail({
					id: board.id,
					name: board.name,
					description: board.description,
					background: board.background,
					workspace_id: board.workspace_id,
				})
			});
		} catch (e) {
			if (e instanceof Error) {
				throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e.message)
			}
			throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e as string)
		}
	}

	async addMember(id: string, user_id: string, role_id: string): Promise<number> {
		try {
			await db.insertInto("board_member").values({
				board_id: id,
				user_id: user_id,
				role_id: role_id,
			}).execute()
			return StatusCodes.NO_CONTENT
		} catch (e) {
			if (e instanceof Error) {
				throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e.message)
			}
			throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e as string)
		}
	}

	async removeMember(id: string, user_id: string): Promise<number> {
		try {
			const board = await BoardMember.destroy({where: {user_id, board_id: id}});
			if (board <= 0) {
				return StatusCodes.NOT_FOUND
			}
			return StatusCodes.NO_CONTENT
		} catch (e) {
			if (e instanceof Error) {
				throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e.message)
			}
			throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e as string)
		}
	}

	async isMember(id: string, user_id: string): Promise<number> {
		try {
			const total = await BoardMember.count({where: {user_id, board_id: id}});
			if (total <= 0) {
				return StatusCodes.NOT_FOUND
			}
			return StatusCodes.NO_CONTENT
		} catch (e) {
			if (e instanceof Error) {
				throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e.message)
			}
			throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e as string)
		}
	}

	async getBoard(filter: filterBoardDetail): Promise<ResponseData<BoardDetail>> {
		try {
			const board = await Board.findOne({where: this.createFilter(filter)});
			if (!board) {
				return {
					status_code: StatusCodes.NOT_FOUND,
					message: "board is not found",
				}
			}
			let result = new BoardDetail({
				id: board.id,
				name: board.name,
				description: board.description,
				background: board.background,
				workspace_id: board.workspace_id,
			})

			return new ResponseData({
				status_code: StatusCodes.OK,
				message: "board detail",
				data: result,
			});
		} catch (e) {
			if (e instanceof Error) {
				throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e.message)
			}
			throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e as string)
		}
	}

	async getBoardList(filter: filterBoardDetail, paginate: Paginate): Promise<ResponseListData<Array<BoardDetail>>> {
		let result: Array<BoardDetail> = [];
		paginate.setTotal(await Board.count({where: this.createFilter(filter)}))
		const boards = await Board.findAll({
			where: this.createFilter(filter),
			offset: paginate.getOffset(),
			limit: paginate.limit,
		});
		for (const board of boards) {
			result.push(new BoardDetail({
				id: board.id,
				name: board.name,
				description: board.description,
				background: board.background, 
			}))
		}
		return new ResponseListData({
			status_code: StatusCodes.OK,
			message: "list board",
			data: result,
		}, paginate)
	}

	async updateBoard(filter: filterBoardDetail, data: BoardDetailUpdate): Promise<number> {
		try {
			const effected= await Board.update(data.toObject(), {where: this.createFilter(filter)});
			if (effected[0] ==0 ){
				return StatusCodes.NOT_FOUND
			}
			return StatusCodes.NO_CONTENT
		} catch (e) {
			if (e instanceof Error) {
				throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e.message)
			}
			throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e as string)
		}
	}
}