const express = require('express')
const { Router, json } = express
const jsonBodyParser = json()
const { registerUserHandler, authenticateUserHandler, retrieveUserHandler, updateUserEmailHandler, updateUserPasswordHandler, deleteUserHandler } = require('./users')
const { registerCompanyHandler, updateCompanyDetailsHandler, deleteCompanyHandler } = require('./companies')
const { createInventoryItemHandler, updateInventoryItemHandler, deleteInventoryItemHandler, retrieveStockHandler } = require('./inventory')
const { createEstimateHandler, deleteEstimateHandler, retrieveEstimatesHandler, updateEstimateHandler } = require('./estimates')
const { createCustomerHandler, updateCustomerHandler, deleteCustomerHandler, retrieveCustomersHandler } = require('./customers')
const { createInvoiceHandler, deleteInvoiceHandler, retrieveInvoicesHandler, updateInvoiceHandler } = require('./invoices')

const companiesRouter = Router()

companiesRouter.post('/companies', jsonBodyParser, registerCompanyHandler)

companiesRouter.patch('/companies', jsonBodyParser, updateCompanyDetailsHandler)

companiesRouter.delete('/companies', jsonBodyParser, deleteCompanyHandler)

const usersRouter = Router()

usersRouter.post('/users', jsonBodyParser, registerUserHandler)

usersRouter.post('/users/auth', jsonBodyParser, authenticateUserHandler)

usersRouter.get('/users', retrieveUserHandler)

usersRouter.patch('/users/email', jsonBodyParser, updateUserEmailHandler)

usersRouter.patch('/users/password', jsonBodyParser, updateUserPasswordHandler)

usersRouter.delete('/users/:userId', deleteUserHandler)

const inventoryRouter = Router()

inventoryRouter.post('/items', jsonBodyParser, createInventoryItemHandler)

inventoryRouter.get('/items', retrieveStockHandler)

inventoryRouter.patch('/items/:itemId', jsonBodyParser, updateInventoryItemHandler)

inventoryRouter.delete('/items/:itemId', deleteInventoryItemHandler)

const estimatesRouter = Router()

estimatesRouter.post('/estimates', jsonBodyParser, createEstimateHandler)

estimatesRouter.get('/estimates', retrieveEstimatesHandler)

estimatesRouter.patch('/estimates/:estimateId', jsonBodyParser, updateEstimateHandler)

estimatesRouter.delete('/estimates/:estimateId', deleteEstimateHandler)

const customersRouter = Router()

customersRouter.post('/customers', jsonBodyParser, createCustomerHandler)

customersRouter.get('/customers', retrieveCustomersHandler)

customersRouter.patch('/customers/:customerId', jsonBodyParser, updateCustomerHandler)

customersRouter.delete('/customers/:customerId', deleteCustomerHandler)

const invoicesRouter = Router()

invoicesRouter.post('/invoices', jsonBodyParser, createInvoiceHandler)

invoicesRouter.get('/invoices', retrieveInvoicesHandler)

invoicesRouter.patch('/invoices/:invoiceId', jsonBodyParser, updateInvoiceHandler)

invoicesRouter.delete('/invoices/:invoiceId', deleteInvoiceHandler)

module.exports = {
    usersRouter,
    companiesRouter,
    inventoryRouter,
    estimatesRouter,
    customersRouter,
    invoicesRouter
}