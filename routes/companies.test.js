"use strict";

// npm packages
const request = require("supertest");

// app imports
const app = require("../app");
const db = require("../db");

let testCompany;

beforeEach(async function() {
	await db.query(
		`DELETE FROM companies`
	);
	let result = await db.query(
		`INSERT INTO companies (code, name, description)
		VALUES ('apple', 'apple computers', 'maker of the iphone')
		RETURNING code, name, description`
	);
	console.log("result.rows = ", result.rows);
	testCompany = result.rows[0];
});

/** GET /companies - returns `{companies: [company, ...]} */
describe("GET /companies", function () {
	test("Gets list of companies", async function () {
		const resp = await request(app).get(`/companies`);
		console.log("testCompany = ", testCompany);
		expect(resp.body).toEqual({
			companies: [{code: testCompany.code, name : testCompany.name }],
		});
	});
});
// end

describe("GET /companies/:code", function () {
	test("Gets info on single company", async function () {
		const resp = await request(app).get(`/companies/${testCompany.code}`);
		expect(resp.body).toEqual({ company: {code: testCompany.code,
												name : testCompany.name,
												description: testCompany.description,
											invoices: [] } });
	});

	test("Respond with 404 if not found", async function () {
		const resp = await request(app).get(`/cats/0`);
		expect(resp.statusCode).toEqual(404);
	});
});
// end

describe("POST /companies", function() {
	test("Create a new company", async function() {
		const resp = await request(app)
		.post(`/companies`)
		.send({ code: "Lyft", name: "Lyft, Inc.", description: "your friend with a car" });
		expect(resp.statusCode).toEqual(201);
		expect(resp.body).toEqual({
			company: { code: "Lyft", name: "Lyft, Inc.", description: "your friend with a car" }
		});
	});
});
