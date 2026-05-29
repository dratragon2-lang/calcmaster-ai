const axios = require("axios");

async function testMath() {

    try {

        const response = await axios.post(
            "http://localhost:5000/api/math/derive",
            {
                expression: "x^2 + sin(x)"
            }
        );

        console.log(response.data);

    } catch (error) {

        console.error(error.response?.data || error.message);
    }
}

testMath();