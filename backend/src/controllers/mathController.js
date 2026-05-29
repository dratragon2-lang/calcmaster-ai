const axios = require("axios");

const deriveExpression = async (req, res) => {

    try {

        const { expression } = req.body;

        if (!expression) {
            return res.status(400).json({
                error: "Expression is required"
            });
        }

        const mathServiceUrl = process.env.MATH_SERVICE_URL || "http://127.0.0.1:5001";
        const response = await axios.post(
            `${mathServiceUrl}/derive`,
            { expression }
        );

        return res.json(response.data);

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            error: "Math service error"
        });
    }
};

module.exports = {
    deriveExpression
};