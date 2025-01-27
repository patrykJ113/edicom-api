import { Response, Request } from 'express'

declare global {
    var res: Response 
    var req: Request
}

export {}
