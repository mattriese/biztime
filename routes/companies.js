/** Routes for sample app. */

const express = require("express");

const db = require("../db");
const router = new express.Router();

const { NotFoundError } = require("../expressError");


/** Returns list of companies, like {companies: [{code, name}, ...]} */
router.get("/", async function (req, res) {
	const result = await db.query(
		`SELECT code, name FROM companies`
	)
	return res.json({ companies: result.rows });
})

/** Looks up information about one company
Return obj of company: {company: {code, name, description}}. Returns a 404
if not found. */
router.get("/:code", async function (req, res) {
	const code = req.params.code;
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
	return res.json({ company });
})

/** Creates a new company
Needs to be given JSON like: {code, name, description}
Returns obj of new company: {company: {code, name, description}} */
router.post("/", async function (req, res) {
	const {code, name, description} = req.body;
	const result = await db.query(
		`INSERT INTO companies(code, name, description)
			VALUES ($1, $2, $3)
			RETURNING code, name, description`,
		[code, name, description]
	);
	const company = result.rows[0];

	return res.status(201).json({ company });
})


/** Edit exisiting company
Needs to be given JSON like: {name, description}
Returns update company object: {company: {code, name, description}}
Should return 404 if company cannot be found. */
router.put("/:code", async function (req, res) {
	const code = req.params.code;
	const {name, description} = req.body;
	const result = await db.query(
		`UPDATE companies
			SET name = $1,
				description = $2
			WHERE code = $3
			RETURNING code, name, description`,
		[name, description, code]
	);
	const company = result.rows[0];

	if (!company) {
		throw new NotFoundError();
	}
	return res.json({ company });
});

/** Deletes company.
Returns {status: "deleted"}
Should return 404 if company cannot be found. */
Deletes company.
Returns {status: "deleted"}
Should return 404 if company cannot be found.
router.delete("/:code", async function (req, res) {
	const code = req.params.code;
	const result = await db.query(
		`DELETE FROM companies
			WHERE code = $1
			RETURNING code`,
		[code]
	);
	const company = result.rows[0];

	if (!company) throw new NotFoundError();

	return res.json({ message: "deleted" });
})


module.exports = router;
