const axios = require("axios");

const deriveExpression = async (req, res) => {

    try {

        const { expression } = req.body;

        if (!expression) {
            return res.status(400).json({
                error: "Expression is required"
            });
        }

        const response = await axios.post(
            "http://127.0.0.1:5001/derive",
            {
                expression
            }
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