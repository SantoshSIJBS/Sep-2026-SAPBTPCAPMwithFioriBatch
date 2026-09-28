using {poapplication.db as databae} from '../db/schema';

using {Currency} from '@sap/cds/common';
using {poapplication.common as common} from '../db/common';

type createEmployeeIP : array of {
    Currency_code : String(3);
    ID            : UUID;
    accountNumber : common.String32;
    bankId        : String(16);
    bankName      : common.String64;
    email         : common.Email;
    gender        : common.Gender;
    language      : String(2);
    loginName     : String(16);
    nameFirst     : common.String64;
    nameInitials  : common.String64;
    nameLast      : common.String64;
    nameMiddle    : common.String64;
    phoneNumber   : common.PhoneNumber;
    salaryAmount  : common.AmountT;
}

service CatalogService {

    @Capabilities: {
        InsertRestrictions.Insertable: true,
        UpdateRestrictions.Updatable : true,
        DeleteRestrictions.Deletable : true,
        ReadRestrictions.Readable    : false
    }
    entity EmployeeSrv        as projection on databae.master.Employees;

    entity ProductSrv         as
        projection on databae.master.Products {
            *
        }
        actions {
            action   increasePrice() returns array of ProductSrv;

            function top20product()  returns array of ProductSrv;
        };

    entity BusinessPartnerSrv as projection on databae.master.BusinessPartners;

    entity AddressSrv         as projection on databae.master.Addresses;

    // Transactional data which is in Transaction context
    entity PurchaseOrderSrv   as
        projection on databae.transaction.PurchaseOrders {
            *
        }
        actions {
            // Declare instance bounded action
            action   discountPrice() returns array of PurchaseOrderSrv;

            // Declare instance bounded function
            function largestOrder()  returns array of PurchaseOrderSrv;
        };

    entity PurchaseItemSrv    as projection on databae.transaction.PurchaseItems;


    action   createEmployee(input: createEmployeeIP)  returns String;

    action   updateEmployee(ID: UUID,
                            salaryAmount: common.AmountT,
                            Currency_code: String(3)) returns String;

    action   deleteEmployee(ID: UUID)                 returns String;


    // Custom Function Declaration
    function getHighestSalariedEmployees()            returns array of EmployeeSrv;

    function getUtilities() returns String;

}
