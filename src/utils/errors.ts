export class BadRequest extends Error {
	message!: string
}

export class NotFound extends Error {
	message!: string
}

export class TooManyProcess extends Error {
	message!: string
}

export class InternalServerError extends Error {
	public readonly statusCode: number;
	public readonly isOperational: boolean;

	constructor(statusCode: number, message: string, isOperational: boolean = true) {
		super(message);
		this.statusCode = statusCode;
		this.isOperational = isOperational;
		Error.captureStackTrace(this);
	}
}