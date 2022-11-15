export class AppError extends Error {
    public statusCode: number
    public isOperational: boolean
    public name: string
    public readonly status: string

    constructor(
        statusCode: number,
        message: string,
        isOperational: boolean = true,
        name: string = "Error",
        stack: string = ""
    ) {
        super(message)
        this.statusCode = statusCode
        this.isOperational = isOperational
        this.name = name
        this.status = statusCode.toString().startsWith('4') ? "fail" : "error"
        if (stack) {
            this.stack = stack
        } else {
            Error.captureStackTrace(this, this.constructor)
        }
    }
}