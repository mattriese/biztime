/** Routes for sample app. */

const { Router } = require("express");
const express = require("express");
// const { delete } = require("../app");   MAGICALLY ADDED LINE??????

const db = require("../db");
const router = new express.Router();

const { NotFoundError } = require("../expressError");

/** Return info on all invoices: like {invoices: [{id, comp_code}, ...]} */
router.get("/", async function (req, res) {
	const result = await db.query(
		`SELECT id, comp_code FROM invoices`
	)
	return res.json({ invoices: result.rows });
})


/**
 Returns obj on given invoice.
 Returns {invoice: {id, amt, paid, add_date, paid_date, company: {code, name, description}}
 If invoice cannot be found, returns 404.
 */
router.get("/:id", async function (req, res) {
	const id = req.params.id;
	const invoiceResult = await db.query(
		`SELECT id, comp_code, amt, paid, add_date, paid_date
		FROM invoices
		WHERE id = $1`,
		[id]);

	const invoice = invoiceResult.rows[0];
	if (!invoice) {
		throw new NotFoundError();
	}
	const companyResult = await db.query(
		`SELECT code, name, description
		FROM companies
		WHERE code = $1`, [invoice.comp_code]
	)
	const company = companyResult.rows[0];
	delete invoice.comp_code;
	invoice["company"] = company;

	return res.json({ invoice });
})


/**
 Adds an invoice.
 Needs to be passed in JSON body of: {comp_code, amt}
 Returns: {invoice: {id, comp_code, amt, paid, add_date, paid_date}}
 */
router.post("/", async function (req, res) {
	const result = await db.query(
		`INSERT INTO invoices (comp_code, amt)
		VALUES ($1, $2)
		RETURNING id, comp_code, amt, paid, add_date, paid_date`,
		[req.body.comp_code, req.body.amt]);

	const invoice = result.rows[0];

	return res.status(201).json({ invoice });
})


module.exports = router;
