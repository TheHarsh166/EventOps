import {
    updateUserRoleService,
    getAllUsersService
} from "../services/user.service.js";

export const getAllUsers = async (req, res) => {
    try {
        const { search, role, page, limit } = req.query;
        const result = await getAllUsersService({ search, role, page, limit });
        return res.status(200).json({
            success: true,
            ...result
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch users"
        });
    }
};

export const updateUserRole = async (req, res) => {
    try {

        const user = await updateUserRoleService({
            userId: req.params.userId,
            role: req.body.role
        });

        return res.status(200).json({
            message: "User role updated successfully",
            user
        });

    } catch (error) {

        return res.status(400).json({
            message: error.message
        });
    }
};