import { Injectable } from '@nestjs/common';
import { SocialModel } from './social.model';
import axios, { Method } from 'axios';
const fs = require('fs');
import { curly, Curl, CurlFeature, HeaderInfo } from 'node-libcurl';
import { spawn, exec, execSync} from 'child_process';
const imageSizeOf = require('image-size');

@Injectable()
export class InstaService {
  private SocialModel = new SocialModel();

  async CreatePostOnInsta(file_count: number, file_path: string, post_id: string) {
    let dataToSend;
    const comand = 'cd python && python insta.py ' + process.env.INSTA_LOGIN + ' ' +
      process.env.INSTA_PASSWORD + ' ' + file_count + ' ' + file_path + ' ' +
      post_id + ' ' + process.env.HASURA_ENDPOINT_URL + ' ' + process.env.HASURA_ADMIN_PASS
    const res = execSync(comand).toString();
  }
}