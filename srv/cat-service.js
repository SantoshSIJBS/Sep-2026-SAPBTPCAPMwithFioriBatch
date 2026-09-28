const { foreach } = require("@sap/cds");

const{  uuid, decodeURI, exists, isdir, read, mkdirp } = cds.utils;

module.exports = cds.service.impl(async function () {
    // Step-1 : Declare Employee Service from Entities
    const { EmployeeSrv, PurchaseOrderSrv, ProductSrv } = this.entities;

    // Implemenation of an action
    // There are 3 generic handlers
    // .before() : Pre-check and validation
    // .on() : Performing DB operations
    // .after() : To save / close connections

    this.before('UPDATE', EmployeeSrv, async (request, response) => {
        const salaryAmt = request.data.salaryAmount;

        console.log('My Salary : ', salaryAmt);
        if (salaryAmt > 100000) {
            request.error(500, 'Please get the approval from your line manager.');
        }
    })
    this.on('createEmployee', async (request, response) => {
        // Step-2 : Get the data which is coming form the API
        const empData = request.data.input;

        // Step - 3 : Instantiate the transaction object
        const objTransaction = cds.tx(request);
        // Step - 4 : Insert the record into database
        let returnData = await objTransaction.run([
            INSERT.into(EmployeeSrv).entries(empData)
        ]).then((resolve, reject) => {
            if (typeof (resolve) !== undefined) {
                return request.data.input;
            } else {
                request.error(500, "Error in inserting data into the database")
            }
        }).catch(err => {
            request.error("There is an error : ", err.toString())
        })

        // Step - 5 : Return the data
        return request.data.input;
    })

    this.on('updateEmployee', async (request, response) => {
        const {
            ID,
            salaryAmount,
            Currency_code
        } = request.data;

        try {
            const objTransaction = cds.tx(request);

            await objTransaction.update(EmployeeSrv).with({
                salaryAmount: salaryAmount,
                Currency_code: Currency_code
            }).where({
                ID: ID
            })

            return "Successfully updated.";
        } catch (error) {
            request.error("Error : ", error)
        }
    })

    this.on('discountPrice', async (request, response) => {
        try {
            // Step-1 : Get the parameter form the entity
            const ID = request.params[0];

            // Step-2 : Creating object for transaction service using request
            const transaction = cds.tx(request);

            // Step-3 : Update the purchase order service
            await transaction.update(PurchaseOrderSrv).with({
                GROSS_AMOUNT: {
                    '-=': 1000
                },
                NET_AMOUNT: {
                    '-=': 800
                },
                TAX_AMOUNT: {
                    '-=': 200
                }
            }).where(ID)


            const updatePOInfo = await transaction.read(PurchaseOrderSrv);

            return updatePOInfo;
        } catch (error) {
            return "Error : " + error.toString();
        }
    })


    this.on('largestOrder', async (request, response) => {
        try {

            // Step-2 : Creating object for transaction service using request
            const transaction = cds.tx(request);

            const reply = await transaction.read(PurchaseOrderSrv).orderBy({
                GROSS_AMOUNT: 'desc'
            }).limit(5);

            return reply;
        } catch (error) {
            return "Error : " + error.toString();
        }
    })
    this.on('increasePrice', async (request, response) => {
        try {

            const { NODE_KEY } = request.params[0];

            const transaction = cds.tx(request);

            const product = await transaction.read(ProductSrv)
                .where({ NODE_KEY });

            if (!product.length) {
                return request.error(404, "Product not found");
            }

            const newPrice = Number(product[0].PRICE) * 1.10;

            await transaction.update(ProductSrv)
                .with({
                    PRICE: newPrice
                })
                .where({ NODE_KEY });

            const updatedProductPrice = await transaction.read(ProductSrv)
                .where({ NODE_KEY });

            return updatedProductPrice;

        } catch (error) {
            return "Error : " + error.toString();
        }
    })
    this.on('deleteEmployee', async (request, response) => {
        const {
            ID
        } = request.data;

        try {
            const objTransaction = cds.tx(request);

            await objTransaction.delete(EmployeeSrv).where({
                ID: ID
            })

            return "Successfully deleted.";
        } catch (error) {
            request.error("Error : ", error)
        }
    })

    // Implementation of custom function
    this.on('getHighestSalariedEmployees', async (request, response) => {
        try {
            // Step - 1 : Create an object for the transaction
            const transastion = cds.tx(request);

            // Step - 2 : Get salaries of an employe using Transaction object
            const response = await transastion.read(EmployeeSrv).orderBy({
                salaryAmount: 'desc'
            }).limit(10);

            // Step - 3 : Display the employee salaries
            return response;

        } catch (error) {
            request.error("Error : ", error)
        }
    })

    // Utility Variables
    this.on('getUtilities', async (request, response) => {
        let vUUID = uuid(), vPackageContent = null, vInput = "%E%A4%A", uri, dirExists = false, isFileExists = false;

        // Exists
        if (exists('srv/request.http')) {
            isFileExists = true;
        }

        // Is directory exists or not
        if(isdir('app'))
        {
            dirExists = true;
        }
        // Decode URI
        try{
            uri = decodeURI(vInput);
            // Make Directory
            await mkdirp('srv/lib')
        } catch {
            uri = vInput;
        }
        vPackageContent = await read('package.json');
        // Final Value
        var finalVallue = {
            uuid : vUUID,
            uri : uri,
            isFileExists : isFileExists,
            dirExists : dirExists,
            packageInfo : vPackageContent
        }

        return finalVallue;
    })

})