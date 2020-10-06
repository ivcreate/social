import { Module, HttpModule } from '@nestjs/common';
import { SocialController } from './social.controller';
import { VkService } from './vk.service';
import { SocialModel } from './social.model';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'path';
import { SocialResolver } from './social.resolver';
import { ConfigModule } from '@nestjs/config';
import { AppLogger } from './logger.Injectable';
import { SocialService } from './social.service';


@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot(),
    GraphQLModule.forRoot({
    autoSchemaFile: join(process.cwd(), 'schema.gql'),
  })],
  controllers: [SocialController],
  providers: [VkService, SocialService, SocialModel, SocialResolver, AppLogger],
})
export class SocialModule {}
