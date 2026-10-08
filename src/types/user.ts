export interface Permission {
    id: number;
    name: string;
    description: string;
    createdAt: string;
    deletedAt: string | null;
}

export interface Module {
    id: number;
    name: string;
    description: string;
    createdAt: string;
    deletedAt: string | null;
}

export interface Role {
    name: string;
}

export interface TUser {
    id: number;
    fullName: string;
    email: string;
    profileImage: string | null;
    roles: Role;
    modules: Module[];
    permissions: Permission[];
    orgName: string;
    hotel?: {
        id: number;
        name: string;
    };
}
