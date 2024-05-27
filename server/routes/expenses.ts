import { Hono } from "hono";
import type { TExpense } from "../types";
import { createExpenseValidator } from "../validation";

// fake data
const fakeExpense: TExpense[] = [
    { id: 1, title: "Groceries", amount: 150 },
    { id: 2, title: "Rent", amount: 1200 },
    { id: 3, title: "Utilities", amount: 200 },
];

export const expensesRoute = new Hono()
    // get index
    .get("/", (c) => {
        try {
            return c.json({ success: true, data: fakeExpense });
        } catch (error) {
            return c.json({
                success: false,
                message: "Internal Server Error!",
                error: error instanceof Error ? error.message : "Unexpected Error."
            }, 500);
        }
    })
    // get total spent
    .get("/total-spent", (c) => {
        try {
            const total = fakeExpense.reduce((acc, expense) => acc + expense.amount, 0);
            return c.json({ success: true, data: total });
        } catch (error) {
            return c.json({
                success: false,
                message: "Internal Server Error!",
                error: error instanceof Error ? error.message : "Unexpected Error."
            }, 500);
        }
    })
    // post expense
    .post("/", createExpenseValidator, (c) => {
        try {
            const data = c.req.valid("json");
            fakeExpense.push({ id: fakeExpense.length + 1, ...data });
            return c.json({ success: true, data }, 201);
        } catch (error) {
            return c.json({
                success: false,
                message: "Internal Server Error!",
                error: error instanceof Error ? error.message : "Unexpected Error."
            }, 500);
        }
    })
    // get expense by id
    .get("/:id{[0-9]+}", (c) => {
        try {
            const id = Number.parseInt(c.req.param("id"));
            const data = fakeExpense.find(expense => expense.id === id);
            if (!data) return c.json({ success: false, message: `Resource not found with id ${id}` }, 404);
            return c.json({ success: true, data });
        } catch (error) {
            return c.json({
                success: false,
                message: "Internal Server Error!",
                error: error instanceof Error ? error.message : "Unexpected Error."
            }, 500);
        }
    })
    // delete expense by id
    .delete("/:id{[0-9]+}", (c) => {
        try {
            const id = Number.parseInt(c.req.param("id"));
            const index = fakeExpense.findIndex(expense => expense.id === id);
            if (index === -1) return c.json({ success: false, message: `Resource not found with id ${id}` }, 404);
            const data = fakeExpense.splice(index, 1)[0];
            return c.json({ success: true, data });
        } catch (error) {
            return c.json({
                success: false,
                message: "Internal Server Error!",
                error: error instanceof Error ? error.message : "Unexpected Error."
            }, 500);
        }
    });