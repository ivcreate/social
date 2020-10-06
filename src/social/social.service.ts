import { Injectable } from '@nestjs/common';
import { VkService } from './vk.service';
import { CreatePostDTO } from './dto/create_post.dto';
import { SocialModel } from './social.model';
import { InstaService } from './insta.service';
import { FacebookService } from './facebook.service';
import axios from "axios";
const fs = require('fs');
const path = require('path');

@Injectable()
export class SocialService {

  private VkService = new VkService();
  private InstaService = new InstaService();
  private FacebookService = new FacebookService();
  private SocialModel = new SocialModel();

  async testAllApi(): Promise<boolean> { 
    await this.VkService.test();
    return true
  }

  async socialPost(post: CreatePostDTO, socials: string = "vk,facebook,insta") {
    let post_info = await this.SocialModel.getPostInfo(post.post_id);

    this.checkErrorDataDb(post_info);
    if (!post_info.data.data.posts_by_pk) {
      throw new Error("Data not found");
    }
    post_info = post_info.data.data.posts_by_pk
    
    let img_urls = [];
    if (post_info.photos.length > 0) {
      img_urls = this.getPostImg(post_info.photos, 10);
    } else if(post_info.before_afters.before) {
      img_urls.push(post_info.before_afters.before);
      img_urls.push(post_info.before_afters.after);
    }

    let text = "";
    if (post_info.texts.length > 0) {
      text = post_info.texts[0].text;
    }

    const dir_name = await this.uploadImg(img_urls);

    if (socials.indexOf("facebook") !== -1) { 
      const fb_res = await this.FacebookService.createPost(text, img_urls, dir_name);
      if (fb_res.id) {
        await this.SocialModel.confirmCreatePost(post.post_id, "facebook", fb_res.id);
      }
    }

    if (socials.indexOf("vk") !== -1) { 
      const res = await this.VkService.createPost(post.user_id_vk, img_urls, post.album_name, text, dir_name);
      
      if(res[0])
        await this.SocialModel.confirmCreatePost(post.post_id, "vk", res[0]);
    }

    if (socials.indexOf("insta") !== -1) { 
      await this.PostInInsta(dir_name + "/", img_urls.length, post.post_id);
      await this.SocialModel.confirmCreatePost(post.post_id, "instagram", "ok");
    }   
    
    this.deleteFolder(dir_name)
    return "ok"
  }

  deleteFolder(directory) { 
    fs.readdir(directory, (err, files) => {
      if (err) throw err;
    
      for (const file of files) {
        fs.unlinkSync(path.join(directory, file));
      }
      fs.rmdirSync(directory);
    });
  }

  async uploadImg(img_urls: Array<string>): Promise<string> { 
    const dir_name = "/var/tmp/"+(Math.floor(Date.now() / 1000)).toString();
    fs.mkdirSync(dir_name);
    for (let i = 0; i < img_urls.length; i++) {
         (img_urls[i])
        const photo = await axios.get(img_urls[i], {
            responseType: 'arraybuffer'
        });
        const bynari = Buffer.from(photo.data, 'base64');
        const imgname = dir_name+"/file" + i + ".jpg"
        fs.writeFileSync(imgname, bynari)
    }
    return dir_name;
  }

  async PostInInsta(dir_name, count_file, post_id) {
    await this.InstaService.CreatePostOnInsta(count_file, dir_name, post_id);
    return true;
  }

  getPostImg(imgs: Array<any>, max_count: number): Array<String> { 
    let result = [];
    for (const img_arr of imgs) { 
      result = result.concat(img_arr);
    }
    return result.slice(0, max_count);
  }

  checkErrorDataDb(data: any): void{
    if(data.data.errors){
        throw new Error(data.data.errors[0].message);
    }
  }

  checkNotEmptyDataDb(res: Array<any>): void{
    if(res.length === 0){
        throw new Error("Data not found");
    }
  }
}


const chars = {
  "0": "0",
  "1": "1",
  "2": "2",
  "3": "3",
  "4": "4",
  "5": "5",
  "6": "6",
  "7": "7",
  "8": "8",
  "9": "9",
  " ": "-",
  "-": "-",
  'а': 'a',
  'б': 'b',
  'в': 'v',
  'г': 'g',
  'д': 'd',
  'е': 'e',
  'ё': 'yo',
  'ж': 'zh',
  'з': 'z',
  'и': 'i',
  'й': 'y',
  'к': 'k',
  'л': 'l',
  'м': 'm',
  'н': 'n',
  'о': 'o',
  'п': 'p',
  'р': 'r',
  'с': 's',
  'т': 't',
  'у': 'u',
  'ф': 'f',
  'х': 'h',
  'ц': 'c',
  'ч': 'ch',
  'ш': 'sh',
  'щ': 'shch',
  'ъ': '',
  'ы': 'y',
  'ь': '',
  'э': 'e',
  'ю': 'yu',
  'я': 'ya',
}

function chpu(text: string): string {
  text = text.toLowerCase().trim();
  let result_text = "";
  for (let char of text) {
    if (!chars[char])
      continue;
    result_text += chars[char];
  }
  return result_text;
}