import prisma from "../config/prisma.js";

const allowedRoles = [
    "ATTENDEE",
    "ORGANIZER",
    "ADMIN"
];


export const updateUserRoleService = async ({
    userId,
    role
}) => {

    if (!allowedRoles.includes(role)) {
        throw new Error(
            "Invalid role"
        );
    }


    const user = await prisma.user.findUnique({
        where: {
            id: userId
        }
    });


    if (!user) {
        throw new Error(
            "User not found"
        );
    }


    return await prisma.user.update({
        where: {
            id: userId
        },

        data: {
            role
        },

        select: {
            id: true,
            name: true,
            email: true,
            role: true
        }
    });
};

export const getAllUsersService = async ({ search = "", role, page = 1, limit = 20 }) => {
    const where = {};
    if (role && allowedRoles.includes(role)) {
        where.role = role;
    }
    if (search && search.trim().length > 0) {
        where.OR = [
            { name: { contains: search.trim(), mode: "insensitive" } },
            { email: { contains: search.trim(), mode: "insensitive" } }
        ];
    }

    const take = Math.max(1, Math.min(100, Number(limit) || 20));
    const skip = (Math.max(1, Number(page) || 1) - 1) * take;

    const [users, total] = await Promise.all([
        prisma.user.findMany({
            where,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phone: true,
                createdAt: true,
                _count: {
                    select: {
                        events: true,
                        registrations: true
                    }
                }
            },
            orderBy: { createdAt: "desc" },
            skip,
            take
        }),
        prisma.user.count({ where })
    ]);

    return {
        users,
        pagination: {
            total,
            page: Number(page) || 1,
            limit: take,
            pages: Math.ceil(total / take)
        }
    };
};