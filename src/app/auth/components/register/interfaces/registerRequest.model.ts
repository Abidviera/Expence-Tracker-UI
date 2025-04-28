import { UserRole } from "../../../../enums/UserRole.enum";

export interface RegisterRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: UserRole;
}