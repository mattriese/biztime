/** Routes for sample app. */

const express = require("express");

const db = require("../db");
const router = new express.Router();

const { NotFoundError } = require("../expressError");

router.get("/", async function (req, res) {
	const result = await db.query(
		`SELECT code, name FROM companies`
	)
	return res.json({companies: result.rows});
})

router.get("/:code", async function (req, res) {
	const code = req.params.code
	const result = await db.query(
		`SELECT code, name, description
		FROM companies
		WHERE code = $1`,
		[code]
	)
	const company = result.rows[0];
	if (!company) {
		throw new NotFoundError();
	}
	return res.json({company});
})


module.exports = router;
