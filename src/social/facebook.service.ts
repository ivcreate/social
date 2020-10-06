import { Injectable } from '@nestjs/common';
import { SocialModel } from './social.model';
import axios, { Method } from 'axios';
const fs = require('fs');
import { curly  } from 'node-libcurl';
import FB from 'fb';

@Injectable()
export class FacebookService {

  private model = new SocialModel();

  constructor() {
    FB.options({ version: 'v2.4' });
    FB.setAccessToken(process.env.FB_ACCESS_TOKEN);
   }
   
  async test(): Promise<void> {
    const data = await FB.api("/v8.0/" + process.env.FB_PAGE + '/albums ');
    if(data === undefined)
        throw new Error("api facebook don't work")
  }

  async createPost(text: string, img_urls: Array<string>, dir_name: string): Promise<any> {
      const attached_media = []
      for (let i = 0; i < img_urls.length; i++) {
          const imgname = dir_name + "/file" + i + ".jpg"
          const photo_up = await FB.api(process.env.FB_PAGE + '/photos', 'post', { source: fs.createReadStream(imgname), published: "false", temporary: "true"});
        attached_media.push({
              "media_fbid": photo_up.id
          })
      }      
      const post_res = await FB.api(process.env.FB_PAGE + '/feed', 'post', { message: text, attached_media: attached_media });
      
      return post_res;
    }
    
}