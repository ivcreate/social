import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class SocialModel {

  async getPostInfo(id: string): Promise<any>{
    return axios(this.getOptionSend(`
    query {
      posts_by_pk(id: "${id}") {
        before_afters
        id
        info
        insert_at
        photos
        tags
        texts
        status
        videos
        quizs
        course
      }
    }
    `));
  }

  async getAllPostInfo(): Promise<any>{
    return axios(this.getOptionSend(`
    query {
      posts{
        before_afters
        id
        info
        insert_at
        photos
        tags
        texts
        status
        videos
        quizs
        course
      }
    }
    `));
  }

  async getTest(): Promise<any>{
    return axios(this.getOptionSend(`
    query {
      posts(where: {id: {_eq: "5c31d640-883e-4a4f-84ef-03f775a366fa"}}) {
        texts
      }
    }
    `));
  }

  async confirmCreatePost(id: string, soc_name: string, id_post_soc: string) {
    const info = await axios(this.getOptionSend(`
    query {
      posts_by_pk(id: "${id}") {
        info
      }
    }
    `));
    
    if (!info.data.data) {
      throw new Error("Error db")
    }

    const info_up = info.data.data.posts_by_pk.info;
    info_up[soc_name] = id_post_soc;

    const data = {
      "post_id": id,
      "info": info_up
    }    

    const update = await axios(this.getOptionSend(`
    mutation ($post_id: uuid!, $info: jsonb!) {
      update_posts(where: {id: {_eq: $post_id}}, _set: {info: $info}) {
        affected_rows
      }
    }
    `, data));
    
    if (!update.data.data) {
      throw new Error("Error db")
    }
        
  }

  async changePost(id: string, slug: string) {

    const data = {
      "id": id,
      "info": slug
    }

    const update = await axios(this.getOptionSend(`
    mutation ($id: uuid, $info: String) {
      update_posts(where: {id: {_eq: $id}}, _set: {slug: $info}) {
        affected_rows
      }
    }    
    `,data));
    if (!update.data.data) {
      throw new Error("Error db")
    }
        
  }

  private getOptionSend(query: string, variables: object = {}): object{
    return {
      url: process.env.HASURA_ENDPOINT_URL,
      method: 'post',
      headers: {'x-hasura-admin-secret': process.env.HASURA_ADMIN_PASS},
      data: {
        query: query,
        variables: variables
      }
    };
  }
}
