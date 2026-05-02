import { type ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { GqlExecutionContext } from "@nestjs/graphql";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class GqlAuthGuard extends AuthGuard("jwt") {
  override getRequest(context: ExecutionContext): object {
    const ctx = GqlExecutionContext.create(context);
    const gqlContext = ctx.getContext<{ req?: unknown }>();
    const req = gqlContext.req;
    if (!req || typeof req !== "object") {
      throw new UnauthorizedException("GraphQL context missing HTTP request");
    }
    return req;
  }
}
