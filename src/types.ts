import { NextFunction, Request, Response } from "express";

export type Middleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => void | Promise<void>;

export type ErrorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => void | Promise<void>;

export type Methods = "get" | "post" | "put" | "delete" | "patch";

export type Handler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => unknown;

export type AnyMiddleware = Middleware | ErrorMiddleware;

export type Constructor<T = any> = new (...args: any[]) => T;

export type ControllerClass = Constructor<Object>;

export interface ValidationSchema {
  parse: (data: unknown) => unknown;
}

export type RouteOptions = {
  body?: ValidationSchema | ((data: unknown) => unknown);
  query?: ValidationSchema | ((data: unknown) => unknown);
  params?: ValidationSchema | ((data: unknown) => unknown);
};

export const routeMetadata = new Map<
  Handler,
  { path: string; method: Methods; middlewares: AnyMiddleware[]; options?: RouteOptions }
>();
export const controllerMetadata = new Map<
  Constructor,
  { basePath: string; middlewares: AnyMiddleware[] }
>();
