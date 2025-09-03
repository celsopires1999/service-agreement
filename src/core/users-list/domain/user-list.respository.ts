import { UserList } from "./user-list"

export interface UserListRepository {
    save(service: UserList): Promise<string>
    delete(serviceId: string): Promise<string>
    findById(serviceId: string): Promise<UserList | null>
}
