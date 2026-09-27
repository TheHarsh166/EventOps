import {
    updateUserRoleService
} from "../services/user.service.js";

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