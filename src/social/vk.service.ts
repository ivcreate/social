import { Injectable } from '@nestjs/common';
import { SocialModel } from './social.model';
import axios, { Method } from 'axios';
const fs = require('fs');
import { curly  } from 'node-libcurl';

@Injectable()
export class VkService {

    private model = new SocialModel();

    async test(): Promise<void> {
        const data = await this.callToApiVk('users.get', 'get', 'user_ids=380199798&fields=bdate', {});

        if(data === undefined)
            throw new Error("api vk don't work")
    }

    async createPost(user_id: number, img_urls: Array<string>, album_name: string, massage: string, dir_name: string): Promise<any>{
        try {
            const data_groups = {
                user_id: user_id,
                extended: 1,
                filter: "admin"
            }
        
            const groups = await this.callToApiVk('groups.get', 'get', this.serialize(data_groups), {});
            const img_slice_urls = this.sliceArray(img_urls, 5);
        
            const res_id = [];
            for (const group of groups.items) {
                const album_id = await this.checkAlbumInGroup(group.id, album_name);
                let img_upload_info = [];
                for (const img_slice_url of img_slice_urls) {
                    let ids = await this.UploadImg(group.id, album_id, img_slice_url, dir_name);
                    img_upload_info = img_upload_info.concat(ids);
                }
                res_id.push(group.id + "_" + (await this.postInGroup(group.id, massage, img_upload_info.join(','), 'twitter')).post_id)
            }
        
            return res_id;
        } catch (err) {
            return err;
        }
    }

    sliceArray(arr: Array<any>, size: number): Array<any> {
        const subs_arr = [];
        for (let i = 0; i < Math.ceil(arr.length / size); i++) {
            subs_arr.push(arr.slice((i*size), (i*size) + size));
        }
        return subs_arr;
    }

    async postInGroup(owner_id: number, message: string, attachments: string, services: string) { 
        const data = {
            owner_id: -owner_id,
            from_group: 1,
            message: message,
            attachments: attachments,
            services: services
        }

        return this.callToApiVk('wall.post', 'post', '', data);
    }

    async checkAlbumInGroup(owner_id: number, name: string): Promise<number> {
        const data_album = {
            owner_id: -owner_id,
        }
        const albums = await this.callToApiVk('photos.getAlbums', 'get', this.serialize(data_album), {});
        let album_id: number;
        let created = false;
        for (const album of albums.items) {
            if (album.title === name) {
                created = true;
                album_id = album.id;
            }
        }

        if (created === false) {
            album_id = await this.createAlbumInGroup(owner_id, name)
        }

        return album_id;
    }

    async createAlbumInGroup(owner_id: number, name: string) {
        const data_album = {
            title: name,
            group_id: owner_id,
            description: name,
            upload_by_admins_only: 1
        }
        const album = await this.callToApiVk('photos.createAlbum', 'get', this.serialize(data_album), {});

        return album.id;
    }

    async UploadImg(owner_id: number, album_id: number, imgs: Array<string>, dir_name: string): Promise<Array<any>>{ 
        const data = {
            album_id: album_id,
            group_id: owner_id,
        }
        const upload_info = await this.callToApiVk('photos.getUploadServer', 'get', this.serialize(data), {});
        
        const img_info = [];
        for (let i = 0; i < imgs.length; i++) {
            const imgname = dir_name+"/file" + i + ".jpg"
            
            img_info.push({
                type: 'text/html',
                file: imgname,
                name: 'file' + (i + 1)
            })
        }

        let response = await curly.post(upload_info.upload_url, {
            HTTPPOST: img_info,
            'SSL_VERIFYHOST': 0,
            'SSL_VERIFYPEER': 0,
            'FOLLOWLOCATION': 1
        })
        
        const callback_info = await this.onUploadImg(response.data, owner_id, album_id)
        const photo_for_post = [];
        for (const info of callback_info) {
            photo_for_post.push("photo-" + owner_id + "_" + info.id);
        }
        
        return photo_for_post;
    }

    async onUploadImg(data: string, owner_id: number, album_id: number): Promise<any>{ 
        const res = JSON.parse(data);
        
        const data1 = {
            group_id: owner_id,
            album_id: album_id,
            photos_list: res.photos_list,
            hash: res.hash,
            server: res.server
        }

        return await this.callToApiVk('photos.save', 'post', '', data1)
        
    }

    serialize (obj): string {
        const str = [];
        for (const p in obj)
            if (obj.hasOwnProperty(p)) {
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            }
        return str.join("&");
    }
    
    async callToApiVk(method_api: string, method_sand: Method, parameters: string, data: Record<any, any>): Promise<any>{
        let add_uri = '&' + parameters;
        if (parameters === '')
            add_uri = ''
        const url = process.env.VK_END_POINT +
          method_api +
          '?access_token=' + process.env.VK_ACCESS_TOKEN +
          '&v=' + process.env.VK_VERSION +
          add_uri;

        const headers = {};

        const object_query = {
            url: url,
            method: method_sand,
            headers: headers
        }

        if (method_sand !== 'get') {
            object_query["url"] = process.env.VK_END_POINT + method_api;
            data["access_token"] = process.env.VK_ACCESS_TOKEN;
            data["v"] = process.env.VK_VERSION;
            object_query['data'] = this.serialize(data);
            object_query['headers']["Content-Type"] = "application/x-www-form-urlencoded"
        }

        const res = await axios(object_query);
        return res.data.response;
    }
}