/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import { request as __request } from '../core/request';

export class InitService {

    /**
     * @result string Ok
     * @throws ApiError
     */
    public static async getValue(): Promise<string> {
        const result = await __request({
            method: 'GET',
            path: `/init`,
        });
        return result.body;
    }

}