import { AxiosResponse } from 'axios';
import $api from "../API";
import { IUser } from "../models/IUser";

export default class UserService {
    static fetchUsers(): Promise<AxiosResponse<IUser[]>> {
        return $api.get<IUser[]>('/users');
    };
}
