import { Router, Request, Response, NextFunction } from "express";
type Handler = (req: Request, res: Response, next: NextFunction) => unknown;
export declare const Get: (path: string) => (fn: Handler, _context: ClassMethodDecoratorContext) => void;
export declare const Post: (path: string) => (fn: Handler, _context: ClassMethodDecoratorContext) => void;
export declare const Put: (path: string) => (fn: Handler, _context: ClassMethodDecoratorContext) => void;
export declare const Patch: (path: string) => (fn: Handler, _context: ClassMethodDecoratorContext) => void;
export declare const Delete: (path: string) => (fn: Handler, _context: ClassMethodDecoratorContext) => void;
export declare function registerController(router: Router, Controller: any): void;
export {};
//# sourceMappingURL=index.d.ts.map