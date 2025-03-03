import Board from "@/database/schemas/board";
import {Error, Op} from "sequelize";
import {ResponseData} from "@/utils/response_utils";
import {StatusCodes} from "http-status-codes";
import {InternalServerError} from "@/utils/errors";
import {BoardDetail, BoardDetailUpdate, BoardRepositoryI, filterBoardDetail} from "@/repository/board/board_interfaces";

export class BoardRepository implements BoardRepositoryI {
	createFilter(filter: filterBoardDetail) : any {
		const whereClause: any = {};
		if (filter.id) whereClause.id = filter.id;
		if (filter.workspace_id) whereClause.workspace_id = filter.workspace_id;
		if (filter.name) whereClause.name = filter.name;
		if (filter.description) whereClause.description = filter.description;
		if (filter.background) whereClause.background = filter.background;
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
			let board = await Board.create({
				workspace_id: data.workspace_id!,
				name: data.name!,
				description: data.description!,
				background: data.background!,
			});
			return new ResponseData({
				status_code: StatusCodes.OK,
				message: "create board success",
				data: new BoardDetail({
					id: board.id,
					workspace_id: data.workspace_id!,
					name: data.name!,
					description: data.description!,
					background: data.background!,
				})
			});
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
				workspace_id: board.workspace_id!,
				name: board.name!,
				description: board.description!,
				background: board.background!,
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

	async getBoardList(filter: filterBoardDetail): Promise<Array<BoardDetail>> {
		const boards = await Board.findAll({where: this.createFilter(filter)});
		return boards.map(board => board.toJSON() as unknown as BoardDetail);
	}

	async updateBoard(filter: filterBoardDetail, data: BoardDetailUpdate): Promise<number> {
		try {
			await Board.update(data.toObject(), {where: this.createFilter(filter)});
			return StatusCodes.NO_CONTENT
		} catch (e) {
			if (e instanceof Error) {
				throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e.message)
			}
			throw new InternalServerError(StatusCodes.INTERNAL_SERVER_ERROR, e as string)
		}
	}
}