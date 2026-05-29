const express = require("express");

const router = express.Router();

const {
    deriveExpression
} = require("../controllers/mathController");

router.post("/derive", deriveExpression);

module.exports = router;