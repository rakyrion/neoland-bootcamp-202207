import './InvoiceCreatorPanel.css'
import { useState, useRef, useEffect } from 'react'
import { toaster } from 'evergreen-ui'
import { updateInvoice, retrieveStock, roundTo } from '../../logic'
function InvoiceEditPanel({ invoice, handleSetViewList, onSubmitEstimate }) {
    
    let initialTotal = 0
    invoice.products.forEach((product, index) => {
        product.index = index
        initialTotal += ((product.price * product.amount) * (product.tax / 100 + 1))
    })

    const [rows, setRows] = useState(invoice)
    const [totalAmount, setTotalAmount] = useState(roundTo(initialTotal, 2))
    const formRef = useRef(null)
    const [stock, setStock] = useState([])

    useEffect(() => {
        ; (async () => {
            try {
                const stock = await retrieveStock(sessionStorage.UserToken)
                setStock(stock)

            } catch (error) {
                toaster.warning('Something went wrong', { duration: 2.5, description: error.message })
            }
        })()
    }, [])

    function printRows() {
        return rows.products.map(row =>
            <div className="invoiceCreator__productRow" key={row.index}>
                <input type='text' className="form__invoiceProductName" name={`productName${row.index}`} placeholder='Select product' list='productsList' defaultValue={row.name}></input>
                <datalist id='productsList'>
                    {stock && stock.map(({ name }) => <option value={name}>{name}</option>)}
                </datalist >
                <input type='text' className="form__invoiceProductDescription" name={`productDescription${row.index}`} placeholder='Item/Service description...' defaultValue={row.description}></input>
                <input type='number' className="form__invoiceProductQty" name={`productQty${row.index}`} onChange={(event) => handleChangeQty(event, row.index)} defaultValue={row.amount}></input>
                <input type='number' className="form__invoiceProductUnitPrice" name={`productUnitPrice${row.index}`} onChange={(event) => handleChangeUnitPrice(event, row.index)} defaultValue={row.price}></input>
                <input type='text' className="form__invoiceProductTax" name={`productTax${row.index}`} onChange={(event) => handleChangeTax(event, row.index)} defaultValue={row.tax}></input>
                <input type='number' className="form__invoiceProductTotal" name={`productTotal${row.index}`} value={roundTo((row.price * row.amount) * (row.tax / 100 + 1), 2)} readOnly></input>
                <span className="material-symbols-outlined deleteRow" onClick={() => handleDeleteRow(row.index)}>delete_forever</span>
            </div>
        )
    }

    const handleChangeUnitPrice = (event, index) => {
        const _rows = { ...rows }
        const product = _rows.products.find(row => index === row.index)
        product.price = event.target.value
        setRows(_rows)
        handleTotalAmount()
    }

    const handleChangeQty = (event, index) => {
        const _rows = { ...rows }
        const product = _rows.products.find(row => index === row.index)
        product.amount = event.target.value
        setRows(_rows)
        handleTotalAmount()
    }

    const handleChangeTax = (event, index) => {
        let _rows = { ...rows }
        const product = _rows.products.find(row => index === row.index)
        product.tax = event.target.value
        setRows(_rows)
        handleTotalAmount()
    }

    const handleTotalAmount = () => {
        let amount = 0
        rows.products.forEach(row => amount += (row.price * row.amount) * (row.tax / 100 + 1))

        setTotalAmount(roundTo(amount, 2))
    }


    const handleAddRow = event => {
        event.preventDefault()

        const updatedInvoice = { ...rows }

        const lastRow = updatedInvoice.products[updatedInvoice.products.length - 1]

        const newRow = {
            name: '',
            description: '',
            index: lastRow.index + 1,
            price: 0,
            amount: 0,
            tax: 0
        }

        updatedInvoice.products.push(newRow)
        setRows(updatedInvoice)
    }

    const handleDeleteRow = index => {
        
        if (rows.products.length > 1) {
            const updatedInvoice = { ...rows }
            const updatedProducts = []
            updatedInvoice.products.forEach(product => {
                if (product.index !== index) updatedProducts.push(product)
            })

            updatedInvoice.products = updatedProducts

            setRows(updatedInvoice)
        }
    }

    const handleEditInvoiceSubmit = event => {
        event.preventDefault()
        try {
            const { target: form,
                target: {
                    invoiceNumber: { value: invoiceNumber },
                    customer: { value: customerName },
                    customerEmail: { value: customerEmail },
                    billingAddressStreet: { value: billingAddressStreet },
                    billingAddressTown: { value: billingAddressTown },
                    billingAddressState: { value: billingAddressState },
                    billingAddressPC: { value: billingAddressPC },
                    billingAddressCountry: { value: billingAddressCountry },
                    shippingAddressStreet: { value: shippingAddressStreet },
                    shippingAddressTown: { value: shippingAddressTown },
                    shippingAddressState: { value: shippingAddressState },
                    shippingAddressPC: { value: shippingAddressPC },
                    shippingAddressCountry: { value: shippingAddressCountry },
                    terms: { value: terms },
                    invoiceDate: { value: invoiceDate },
                    dueDate: {value : dueDate}
                } } = event

            // TODO CREATE PRODUCT TAX ON DB MODEL (DO I NEED PRODUCT TOTAL??)
            const billingAddress = { street: billingAddressStreet, town: billingAddressTown, state: billingAddressState, zipCode: billingAddressPC, country: billingAddressCountry }
            const shippingAddress = { shippingStreet: shippingAddressStreet, shippingTown: shippingAddressTown, shippingState: shippingAddressState, shippingZipCode: shippingAddressPC, shippingCountry: shippingAddressCountry }
            const customer = { name: customerName, email: customerEmail, billingAddress, shippingAddress }
            
            const products = []
            rows.products.forEach(row => {
                const { target: form,
                    target: {
                        [`productName${row.index}`]: { value: productName },
                        [`productDescription${row.index}`]: { value: description },
                        [`productQty${row.index}`]: { value: productQty },
                        [`productUnitPrice${row.index}`]: { value: productUnitPrice },
                        [`productTax${row.index}`]: { value: tax },
                        [`productTotal${row.index}`]: { value: productTotal }
                    } } = event

                if (productName || description || productQty > 0 || productUnitPrice > 0 || tax > 0) {

                    if (productName && productQty && productUnitPrice) {
                        let id
                        let item = stock.find(_item => _item.name === productName)
                        if (!item) throw new Error(`Product ${productName} is not an valid option`)

                        id = item.id
                        let amount = parseInt(productQty)
                        let price = parseInt(productUnitPrice)
                        let total = parseInt(productTotal)

                        products.push({ id, name: productName, description, amount, price, tax, total })
                    }
                    else throw new Error('All products need Name, QTY and Unit Price')
                }
            })
            if (!products.length) throw new Error("Products can't be empty")

                ; (async () => {
                    try {
                        await updateInvoice(sessionStorage.UserToken, rows.id, { customer, invoiceNumber, terms, invoiceDate, dueDate, products, totalAmount })

                        toaster.success(`Invoice ${invoiceNumber} updated successfully`)
                        onSubmitEstimate()
                    } catch (error) {
                        toaster.warning(error.message, { duration: 3 })
                    }

                })()

        } catch (error) {
            toaster.warning(error.message, { duration: 3 })
        }
    }

    return (
        <div className="invoiceCreator__container">
            <form className="invoiceCreator__form" onSubmit={handleEditInvoiceSubmit} ref={formRef}>
                <div className="invoiceCreator__customerAndEmail">
                    <div className='invoiceCreator__inputContainer w25'>
                        <label className="form__label" htmlFor="customer" >Customer</label>
                        <input type='text' className='invoiceCreator__inputCustomer' name="customer" defaultValue={invoice.customer.name} readOnly></input>

                    </div>
                    <div className="invoiceCreator__inputContainer w25">
                        <label className="form__label" htmlFor="customerEmail">Customer email</label>
                        <input type='email' className='invoiceCreator__inputCustomerEmail' name="customerEmail" defaultValue={invoice.customer.email}></input>
                    </div>
                    <div className='separator30'></div>
                    <div className='invoiceCreator__invoiceNumber'>
                        <label className="form__label" htmlFor="invoiceNumber">Invoice N#</label>
                        <input type='text' className='invoiceCreator__inputCustomer' name="invoiceNumber" defaultValue={invoice.invoiceNumber}></input>
                    </div>
                </div>
                <div className="invoiceCreator__section2">
                    <div className="invoiceCreator__address">
                        <label className="form__label" htmlFor="billingAddressStreet">Customer billing street</label>
                        <textarea className='invoiceCreator__AddressInput' name='billingAddressStreet' defaultValue={invoice.customer.billingAddress.street}></textarea>
                        <div className='invoiceCreator__AddressDetails'>
                            <div className='AddressDetailsWraper'>
                                <label className='form__label' htmlFor='billingAddressTown'>Town</label>
                                <input className='invoiceCreator_AddressTownInput' name='billingAddressTown' defaultValue={invoice.customer.billingAddress.town}></input>
                            </div>
                            <div className='AddressDetailsWraper'>
                                <label className='form__label' htmlFor='billingAddressState'>State</label>
                                <input className='invoiceCreator_AddressStateInput' name='billingAddressState' defaultValue={invoice.customer.billingAddress.state}></input>
                            </div>
                            <div className='AddressDetailsWraper'>
                                <label className='form__label' htmlFor='billingAddressPC'>PC</label>
                                <input className='invoiceCreator_AddressPCInput' name='billingAddressPC' defaultValue={invoice.customer.billingAddress.zipCode}></input>
                            </div>
                            <div className='AddressDetailsWraper'>
                                <label className='form__label' htmlFor='billingAddressCountry'>Country</label>
                                <input className='invoiceCreator_AddressCountryInput' name='billingAddressCountry' defaultValue={invoice.customer.billingAddress.country}></input>
                            </div>
                        </div>
                    </div>
                    <div className="invoiceCreator__address">
                        <label className="form__label" htmlFor="shippingAddressStreet">Customer shipping street</label>
                        <textarea className='invoiceCreator__AddressInput' name='shippingAddressStreet' defaultValue={invoice.customer.shippingAddress.shippingStreet}></textarea>
                        <div className='invoiceCreator__AddressDetails'>
                            <div className='AddressDetailsWraper'>
                                <label className='form__label' htmlFor='shippingAddressTown'>Town</label>
                                <input className='invoiceCreator_AddressTownInput' name='shippingAddressTown' defaultValue={invoice.customer.shippingAddress.shippingTown}></input>
                            </div>
                            <div className='AddressDetailsWraper'>
                                <label className='form__label' htmlFor='shippingAddressState'>State</label>
                                <input className='invoiceCreator_AddressStateInput' name='shippingAddressState' defaultValue={invoice.customer.shippingAddress.shippingState}></input>
                            </div>
                            <div className='AddressDetailsWraper'>
                                <label className='form__label' htmlFor='shippingAddressPC'>PC</label>
                                <input className='invoiceCreator_AddressPCInput' name='shippingAddressPC' defaultValue={invoice.customer.shippingAddress.shippingZipCode}></input>
                            </div>
                            <div className='AddressDetailsWraper'>
                                <label className='form__label' htmlFor='shippingAddressCountry'>Country</label>
                                <input className='invoiceCreator_AddressCountryInput' name='shippingAddressCountry' defaultValue={invoice.customer.shippingAddress.shippingCountry}></input>
                            </div>
                        </div>
                    </div>
                    <div className="invoiceCreator__section2__row1">
                        <label className="form__label" htmlFor="terms" >Terms</label>
                        <input type='text' className="form__input" name='terms' defaultValue={invoice.terms}></input>
                        <label className="form__label" htmlFor="invoiceDate">Invoice date</label>
                        <input type='date' className="form__input" name='invoiceDate' defaultValue={invoice.invoiceDate} ></input>
                        <label className="form__label" htmlFor="dueDate">Due date</label>
                        <input type='date' className="form__input" name='dueDate' defaultValue={invoice.dueDate}></input>
                    </div>
                    <div className='invoiceCreator__totalAmount'>
                        <h2 className='totalAmount__title'>Total <br></br>Amount</h2>
                        <h2 className='totalAmount__amount' name='totalAmount'>{totalAmount} €</h2>
                    </div>
                </div>
                <div className="invoiceCreator__productsContainer">
                    <div className="invoiceCreator__productsHeader">
                        <div className='w30'>
                            <h2>Product name</h2>
                        </div>
                        <div className="w30">
                            <h2>Description</h2>
                        </div>
                        <div className="w10">
                            <h2>QTY</h2>
                        </div>
                        <div className="w10">
                            <h2>Unit price</h2>
                        </div>
                        <div className="w10">
                            <h2>TAX</h2>
                        </div>
                        <div className="w10">
                            <h2>Total</h2>
                        </div>

                    </div>
                    {printRows()}
                    <div className='invoiceCreator__addRow'>
                        <button className='noButton' onClick={handleAddRow}>
                            <span className="material-symbols-outlined blue">add_box</span>
                        </button>
                    </div>


                </div>
                <div className='invoiceCreator__footer'>
                    <button type='button' className='invoiceCreator__cancelButton' onClick={handleSetViewList}>Cancel</button>
                    <button type='submit' className='invoiceCreator__newInvoiceButton'>Update</button>


                </div>
            </form>


        </div>
    )
}

export default InvoiceEditPanel