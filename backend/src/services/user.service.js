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