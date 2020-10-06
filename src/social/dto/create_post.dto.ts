import { IsNotEmpty, IsString, IsInt } from 'class-validator';
import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CreatePostDTO {

    @IsString()
    @IsNotEmpty()
    @Field()
    readonly post_id: string;
  
    @IsString()
    @IsNotEmpty()
    @Field()
    readonly album_name: string;

    @IsInt()
    @IsNotEmpty()
    @Field()
    readonly user_id_vk: number;  
  }