namespace poapplication.db;

using { cuid, Currency } from '@sap/cds/common';
using { poapplication.common as common } from './common';

context master {

    entity BusinessPartners {
        key NODE_KEY : common.Guid;
            BP_ROLE : common.Role;
            EMAIL : common.Email;
            MOBILE : common.PhoneNumber;
            FAX : common.String32;
            WEB : common.String255;
            BP_ID : common.Guid;
            COMPANY_NAME : common.String255;
            // Managed Association
            AD : Association to Addresses;
    }

    entity Addresses : common.Address {
        key NODE_KEY : common.Guid;
        ADDRESS_TYPE : common.String32;
        VAL_START : Date;
        VAL_END : Date;
        LATITUDE : Decimal;
        LONGITUDE : Decimal;
        // Unmanaged Association
        BP : Association to one BusinessPartners on BP.AD = $self;
    }

    entity Products {
        key NODE_KEY : common.Guid;
        PRODUCT_ID : common.String32;
        TYPE_CODE : String(2);
        CATEGORY : common.String32;
        DESCRIPTION: common.String255;
        TAX_TARIF_CODE : Integer;
        MEASURE_UNIT: String(2);
        WEIGHT_MEASURE : Decimal(5,2);
        WEIGHT_UNIT : String(2);
        PRICE : Decimal(15,2);
        CURRENCY_CODE : String(5);
        WIDTH : Decimal(5,2);
        DEPTH : Decimal(5,2);
        HEIGHT : Decimal(5,2);
        DIM_UNIT : String(2);
        // Managed Association
        SUPPLIERS : Association to BusinessPartners;
    }

    entity Employees : cuid {
        nameFirst : common.String64;
        nameLast : common.String64;
        nameInitials : common.String64;
        nameMiddle : common.String64;
        gender : common.Gender;
        language : String(2);
        loginName : String(16);
        phoneNumber : common.PhoneNumber;
        email : common.Email;
        Currency : Currency;
        salaryAmount : common.AmountT;
        accountNumber : common.String32;
        bankId : String(16);
        bankName : common.String64;
    }
}


context transaction {
    entity PurchaseOrders : common.Amount {
        key NODE_KEY : common.Guid;
        PO_ID : common.Guid;
        // Managed Association
        PARTNER : Association to master.BusinessPartners;
        LIFECYCLE_STATUS : String(1);
        OVERALL_STATUS : String(1);
        // Unmanaged Association
        Items : Association to many PurchaseItems on Items.PARENT = $self ;
    }

    entity PurchaseItems : common.Amount {
        key NODE_KEY : common.Guid;
        // Parent Key
        PARENT : Association to PurchaseOrders;
        PO_ITEM_POS : Integer;
        // Managed Association
        PRODUCT : Association to master.Products;
    }
}
