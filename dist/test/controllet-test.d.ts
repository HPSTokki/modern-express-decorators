import { Request, Response } from "express";
export declare class TestController {
    getTest(req: Request, res: Response): Promise<{
        message: string;
        query: import("qs").ParsedQs;
    }>;
    getUser(req: Request, res: Response): Promise<{
        id: string | string[] | undefined;
        name: string;
        method: string;
    }>;
    createUser(req: Request, res: Response): Promise<any>;
    updateUser(req: Request, res: Response): Promise<any>;
    deleteUser(req: Request, res: Response): Promise<void>;
    patchUser(req: Request, res: Response): Promise<any>;
    emptyResponse(req: Request, res: Response): Promise<void>;
    nullResponse(req: Request, res: Response): Promise<null>;
    emptyString(req: Request, res: Response): Promise<string>;
    numberResponse(req: Request, res: Response): Promise<number>;
    booleanResponse(req: Request, res: Response): Promise<boolean>;
    arrayResponse(req: Request, res: Response): Promise<number[]>;
    nestedResponse(req: Request, res: Response): Promise<{
        user: {
            id: number;
            profile: {
                name: string;
                address: {
                    city: string;
                    zip: string;
                };
            };
        };
    }>;
    manual201(req: Request, res: Response): Promise<void>;
    manual400(req: Request, res: Response): Promise<void>;
    manual404(req: Request, res: Response): Promise<void>;
    syncError(req: Request, res: Response): Promise<void>;
    asyncError(req: Request, res: Response): Promise<void>;
    headersTest(req: Request, res: Response): Promise<{
        headers: import("node:http").IncomingHttpHeaders;
    }>;
    largeResponse(req: Request, res: Response): Promise<{
        items: {
            id: number;
            name: string;
        }[];
    }>;
    querySpecial(req: Request, res: Response): Promise<{
        search: string | import("qs").ParsedQs | (string | import("qs").ParsedQs)[] | undefined;
        filter: string | import("qs").ParsedQs | (string | import("qs").ParsedQs)[] | undefined;
        page: string | import("qs").ParsedQs | (string | import("qs").ParsedQs)[] | undefined;
    }>;
    multipleParams(req: Request, res: Response): Promise<{
        userId: string | string[] | undefined;
        postId: string | string[] | undefined;
        message: string;
    }>;
    optionalParams(req: Request, res: Response): Promise<{
        page: string | number | import("qs").ParsedQs | (string | import("qs").ParsedQs)[];
        limit: string | number | import("qs").ParsedQs | (string | import("qs").ParsedQs)[];
    }>;
    rawBody(req: Request, res: Response): Promise<{
        received: any;
    }>;
    multipleSend(req: Request, res: Response): Promise<void>;
    noContentCustom(req: Request, res: Response): Promise<void>;
    redirectTest(req: Request, res: Response): Promise<void>;
    downloadTest(req: Request, res: Response): Promise<void>;
    slowResponse(req: Request, res: Response): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=controllet-test.d.ts.map