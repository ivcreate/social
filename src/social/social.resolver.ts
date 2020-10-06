import { Resolver, Query, Context, Mutation, Args } from '@nestjs/graphql';
import { VkService } from './vk.service';
import { HttpException, HttpStatus, Inject } from '@nestjs/common';
import { AppLogger } from './logger.Injectable';
import { SocialService } from './social.service';
import { CreatePostDTO } from './dto/create_post.dto';

@Resolver()
export class SocialResolver {

  private readonly appLogger = new AppLogger();

  constructor(private readonly VkService: VkService, private readonly SocialService: SocialService) { }

  private setEnv(ctx): void{ 
    if (ctx.req.headers['x-hasura-type'] === "dev") {
      process.env.HASURA_ENDPOINT_URL = process.env.HASURA_URL_DEV;
      process.env.HASURA_ADMIN_PASS = process.env.HASURA_ADMIN_DEV_PASS;
    } else {
      process.env.HASURA_ENDPOINT_URL = process.env.HASURA_URL;
      process.env.HASURA_ADMIN_PASS = process.env.HASURA_ADMIN_PASS;
    }
  }

  @Query(() => String)
  async Social(@Inject('winston') @Context() ctx) {
    this.setEnv(ctx);
    
    await this.SocialService.testAllApi();
    return 'social works' + process.env.HASURA_ENDPOINT_URL;
  }

  @Mutation(returns => String)
  async createPostToVk(@Args('input') input: CreatePostDTO, @Context() ctx) {
    try {
      this.setEnv(ctx);
      const post = await this.SocialService.socialPost(input, "vk");
      if (post)
        return "ok"
      else
        return post;
    }catch(err){
      const message = HttpStatus.BAD_REQUEST;
      throw new HttpException(err.message, message);
    }
  }

  @Mutation(returns => String)
  async createPostToInsta(@Args('input') input: CreatePostDTO, @Context() ctx) {
    try {
      this.setEnv(ctx);
      if (await this.SocialService.socialPost(input, "insta"))
        return "ok"
      else
        return "error"
    }catch(err){
      const message = HttpStatus.BAD_REQUEST;
      throw new HttpException(err.message, message);
    }
  }

  @Mutation(returns => String)
  async createPostToFB(@Args('input') input: CreatePostDTO, @Context() ctx) {
    try {
      this.setEnv(ctx);
      if (await this.SocialService.socialPost(input, "facebook"))
        return "ok"
      else
        return "error"
    }catch(err){
      const message = HttpStatus.BAD_REQUEST;
      throw new HttpException(err.message, message);
    }
  }

  @Mutation(returns => String)
  async createPostInAll(@Args('input') input: CreatePostDTO, @Context() ctx) { 
    try {
      this.setEnv(ctx);
      return await this.SocialService.socialPost(input);
    } catch (err) { 
      const message = HttpStatus.BAD_REQUEST;
      throw new HttpException(err.message, message);
    }
  }
}
