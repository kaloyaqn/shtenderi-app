--
-- PostgreSQL database dump
--

-- Dumped from database version 16.8 (Debian 16.8-1.pgdg120+1)
-- Dumped by pg_dump version 16.9 (Homebrew)

-- Started on 2025-08-13 13:08:21 EEST

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY public."UserStorage" DROP CONSTRAINT IF EXISTS "UserStorage_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."UserStorage" DROP CONSTRAINT IF EXISTS "UserStorage_storageId_fkey";
ALTER TABLE IF EXISTS ONLY public."UserStand" DROP CONSTRAINT IF EXISTS "UserStand_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."UserStand" DROP CONSTRAINT IF EXISTS "UserStand_standId_fkey";
ALTER TABLE IF EXISTS ONLY public."UserPartner" DROP CONSTRAINT IF EXISTS "UserPartner_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."UserPartner" DROP CONSTRAINT IF EXISTS "UserPartner_partnerId_fkey";
ALTER TABLE IF EXISTS ONLY public."Transfer" DROP CONSTRAINT IF EXISTS "Transfer_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."TransferProduct" DROP CONSTRAINT IF EXISTS "TransferProduct_transferId_fkey";
ALTER TABLE IF EXISTS ONLY public."TransferProduct" DROP CONSTRAINT IF EXISTS "TransferProduct_productId_fkey";
ALTER TABLE IF EXISTS ONLY public."Store" DROP CONSTRAINT IF EXISTS "Store_partnerId_fkey";
ALTER TABLE IF EXISTS ONLY public."StoreSchedule" DROP CONSTRAINT IF EXISTS "StoreSchedule_storeId_fkey";
ALTER TABLE IF EXISTS ONLY public."StorageProduct" DROP CONSTRAINT IF EXISTS "StorageProduct_storageId_fkey";
ALTER TABLE IF EXISTS ONLY public."StorageProduct" DROP CONSTRAINT IF EXISTS "StorageProduct_productId_fkey";
ALTER TABLE IF EXISTS ONLY public."Stand" DROP CONSTRAINT IF EXISTS "Stand_storeId_fkey";
ALTER TABLE IF EXISTS ONLY public."StandProduct" DROP CONSTRAINT IF EXISTS "StandProduct_standId_fkey";
ALTER TABLE IF EXISTS ONLY public."StandProduct" DROP CONSTRAINT IF EXISTS "StandProduct_productId_fkey";
ALTER TABLE IF EXISTS ONLY public."Revision" DROP CONSTRAINT IF EXISTS "Revision_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."Revision" DROP CONSTRAINT IF EXISTS "Revision_storageId_fkey";
ALTER TABLE IF EXISTS ONLY public."Revision" DROP CONSTRAINT IF EXISTS "Revision_standId_fkey";
ALTER TABLE IF EXISTS ONLY public."Revision" DROP CONSTRAINT IF EXISTS "Revision_partnerId_fkey";
ALTER TABLE IF EXISTS ONLY public."Revision" DROP CONSTRAINT IF EXISTS "Revision_checkId_fkey";
ALTER TABLE IF EXISTS ONLY public."Refund" DROP CONSTRAINT IF EXISTS "Refund_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."RefundProduct" DROP CONSTRAINT IF EXISTS "RefundProduct_refundId_fkey";
ALTER TABLE IF EXISTS ONLY public."RefundProduct" DROP CONSTRAINT IF EXISTS "RefundProduct_productId_fkey";
ALTER TABLE IF EXISTS ONLY public."Payment" DROP CONSTRAINT IF EXISTS "Payment_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."Payment" DROP CONSTRAINT IF EXISTS "Payment_revisionId_fkey";
ALTER TABLE IF EXISTS ONLY public."Payment" DROP CONSTRAINT IF EXISTS "Payment_invoiceId_fkey";
ALTER TABLE IF EXISTS ONLY public."Payment" DROP CONSTRAINT IF EXISTS "Payment_cashRegisterId_fkey";
ALTER TABLE IF EXISTS ONLY public."MissingProduct" DROP CONSTRAINT IF EXISTS "MissingProduct_revisionId_fkey";
ALTER TABLE IF EXISTS ONLY public."MissingProduct" DROP CONSTRAINT IF EXISTS "MissingProduct_productId_fkey";
ALTER TABLE IF EXISTS ONLY public."Import" DROP CONSTRAINT IF EXISTS "Import_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."Import" DROP CONSTRAINT IF EXISTS "Import_storageId_fkey";
ALTER TABLE IF EXISTS ONLY public."Import" DROP CONSTRAINT IF EXISTS "Import_standId_fkey";
ALTER TABLE IF EXISTS ONLY public."ImportProduct" DROP CONSTRAINT IF EXISTS "ImportProduct_productId_fkey";
ALTER TABLE IF EXISTS ONLY public."ImportProduct" DROP CONSTRAINT IF EXISTS "ImportProduct_importId_fkey";
ALTER TABLE IF EXISTS ONLY public."CreditNote" DROP CONSTRAINT IF EXISTS "CreditNote_refundId_fkey";
ALTER TABLE IF EXISTS ONLY public."CreditNote" DROP CONSTRAINT IF EXISTS "CreditNote_invoiceId_fkey";
ALTER TABLE IF EXISTS ONLY public."CheckedProduct" DROP CONSTRAINT IF EXISTS "CheckedProduct_productId_fkey";
ALTER TABLE IF EXISTS ONLY public."CheckedProduct" DROP CONSTRAINT IF EXISTS "CheckedProduct_checkId_fkey";
ALTER TABLE IF EXISTS ONLY public."Check" DROP CONSTRAINT IF EXISTS "Check_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."Check" DROP CONSTRAINT IF EXISTS "Check_standId_fkey";
ALTER TABLE IF EXISTS ONLY public."CashRegister" DROP CONSTRAINT IF EXISTS "CashRegister_storageId_fkey";
ALTER TABLE IF EXISTS ONLY public."CashMovement" DROP CONSTRAINT IF EXISTS "CashMovement_userId_fkey";
ALTER TABLE IF EXISTS ONLY public."CashMovement" DROP CONSTRAINT IF EXISTS "CashMovement_cashRegisterId_fkey";
DROP TRIGGER IF EXISTS trg_update_active_on_client_price ON public."Product";
DROP TRIGGER IF EXISTS payment_revision_status_update ON public."Payment";
DROP INDEX IF EXISTS public.users_email_key;
DROP INDEX IF EXISTS public."UserStorage_userId_storageId_key";
DROP INDEX IF EXISTS public."UserStand_userId_standId_key";
DROP INDEX IF EXISTS public."UserPartner_userId_partnerId_key";
DROP INDEX IF EXISTS public."Transfer_userId_idx";
DROP INDEX IF EXISTS public."Transfer_sourceStorageId_idx";
DROP INDEX IF EXISTS public."Transfer_destinationStorageId_idx";
DROP INDEX IF EXISTS public."TransferProduct_transferId_productId_key";
DROP INDEX IF EXISTS public."StoreSchedule_storeId_date_key";
DROP INDEX IF EXISTS public."Storage_name_key";
DROP INDEX IF EXISTS public."StorageProduct_storageId_productId_key";
DROP INDEX IF EXISTS public."Stand_barcode_key";
DROP INDEX IF EXISTS public."StandProduct_standId_productId_key";
DROP INDEX IF EXISTS public."Revision_number_key";
DROP INDEX IF EXISTS public."Product_barcode_key";
DROP INDEX IF EXISTS public."Invoice_invoiceNumber_key";
DROP INDEX IF EXISTS public."Import_fileName_key";
DROP INDEX IF EXISTS public."CreditNote_creditNoteNumber_key";
DROP INDEX IF EXISTS public."CashRegister_storageId_key";
ALTER TABLE IF EXISTS ONLY public.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY public._prisma_migrations DROP CONSTRAINT IF EXISTS _prisma_migrations_pkey;
ALTER TABLE IF EXISTS ONLY public."UserStorage" DROP CONSTRAINT IF EXISTS "UserStorage_pkey";
ALTER TABLE IF EXISTS ONLY public."UserStand" DROP CONSTRAINT IF EXISTS "UserStand_pkey";
ALTER TABLE IF EXISTS ONLY public."UserPartner" DROP CONSTRAINT IF EXISTS "UserPartner_pkey";
ALTER TABLE IF EXISTS ONLY public."Transfer" DROP CONSTRAINT IF EXISTS "Transfer_pkey";
ALTER TABLE IF EXISTS ONLY public."TransferProduct" DROP CONSTRAINT IF EXISTS "TransferProduct_pkey";
ALTER TABLE IF EXISTS ONLY public."Store" DROP CONSTRAINT IF EXISTS "Store_pkey";
ALTER TABLE IF EXISTS ONLY public."StoreSchedule" DROP CONSTRAINT IF EXISTS "StoreSchedule_pkey";
ALTER TABLE IF EXISTS ONLY public."Storage" DROP CONSTRAINT IF EXISTS "Storage_pkey";
ALTER TABLE IF EXISTS ONLY public."StorageProduct" DROP CONSTRAINT IF EXISTS "StorageProduct_pkey";
ALTER TABLE IF EXISTS ONLY public."Stand" DROP CONSTRAINT IF EXISTS "Stand_pkey";
ALTER TABLE IF EXISTS ONLY public."StandProduct" DROP CONSTRAINT IF EXISTS "StandProduct_pkey";
ALTER TABLE IF EXISTS ONLY public."Revision" DROP CONSTRAINT IF EXISTS "Revision_pkey";
ALTER TABLE IF EXISTS ONLY public."Refund" DROP CONSTRAINT IF EXISTS "Refund_pkey";
ALTER TABLE IF EXISTS ONLY public."RefundProduct" DROP CONSTRAINT IF EXISTS "RefundProduct_pkey";
ALTER TABLE IF EXISTS ONLY public."Product" DROP CONSTRAINT IF EXISTS "Product_pkey";
ALTER TABLE IF EXISTS ONLY public."Payment" DROP CONSTRAINT IF EXISTS "Payment_pkey";
ALTER TABLE IF EXISTS ONLY public."Partner" DROP CONSTRAINT IF EXISTS "Partner_pkey";
ALTER TABLE IF EXISTS ONLY public."MissingProduct" DROP CONSTRAINT IF EXISTS "MissingProduct_pkey";
ALTER TABLE IF EXISTS ONLY public."Invoice" DROP CONSTRAINT IF EXISTS "Invoice_pkey";
ALTER TABLE IF EXISTS ONLY public."Import" DROP CONSTRAINT IF EXISTS "Import_pkey";
ALTER TABLE IF EXISTS ONLY public."ImportProduct" DROP CONSTRAINT IF EXISTS "ImportProduct_pkey";
ALTER TABLE IF EXISTS ONLY public."CreditNote" DROP CONSTRAINT IF EXISTS "CreditNote_pkey";
ALTER TABLE IF EXISTS ONLY public."CheckedProduct" DROP CONSTRAINT IF EXISTS "CheckedProduct_pkey";
ALTER TABLE IF EXISTS ONLY public."Check" DROP CONSTRAINT IF EXISTS "Check_pkey";
ALTER TABLE IF EXISTS ONLY public."CashRegister" DROP CONSTRAINT IF EXISTS "CashRegister_pkey";
ALTER TABLE IF EXISTS ONLY public."CashMovement" DROP CONSTRAINT IF EXISTS "CashMovement_pkey";
DROP TABLE IF EXISTS public.users;
DROP TABLE IF EXISTS public._prisma_migrations;
DROP TABLE IF EXISTS public."UserStorage";
DROP TABLE IF EXISTS public."UserStand";
DROP TABLE IF EXISTS public."UserPartner";
DROP TABLE IF EXISTS public."TransferProduct";
DROP TABLE IF EXISTS public."Transfer";
DROP TABLE IF EXISTS public."StoreSchedule";
DROP TABLE IF EXISTS public."Store";
DROP TABLE IF EXISTS public."StorageProduct";
DROP TABLE IF EXISTS public."Storage";
DROP TABLE IF EXISTS public."StandProduct";
DROP TABLE IF EXISTS public."Stand";
DROP TABLE IF EXISTS public."Revision";
DROP TABLE IF EXISTS public."RefundProduct";
DROP TABLE IF EXISTS public."Refund";
DROP TABLE IF EXISTS public."Product";
DROP TABLE IF EXISTS public."Payment";
DROP TABLE IF EXISTS public."Partner";
DROP TABLE IF EXISTS public."MissingProduct";
DROP TABLE IF EXISTS public."Invoice";
DROP TABLE IF EXISTS public."ImportProduct";
DROP TABLE IF EXISTS public."Import";
DROP TABLE IF EXISTS public."CreditNote";
DROP TABLE IF EXISTS public."CheckedProduct";
DROP TABLE IF EXISTS public."Check";
DROP TABLE IF EXISTS public."CashRegister";
DROP TABLE IF EXISTS public."CashMovement";
DROP FUNCTION IF EXISTS public.update_revision_status();
DROP FUNCTION IF EXISTS public.update_active_based_on_client_price();
DROP TYPE IF EXISTS public."Role";
DROP TYPE IF EXISTS public."RevisionStatus";
DROP TYPE IF EXISTS public."RefundSourceType";
DROP TYPE IF EXISTS public."PaymentMethod";
DROP TYPE IF EXISTS public."CashMovementType";
-- *not* dropping schema, since initdb creates it
--
-- TOC entry 5 (class 2615 OID 37901)
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- TOC entry 3652 (class 0 OID 0)
-- Dependencies: 5
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


--
-- TOC entry 878 (class 1247 OID 43887)
-- Name: CashMovementType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."CashMovementType" AS ENUM (
    'DEPOSIT',
    'WITHDRAWAL'
);


--
-- TOC entry 881 (class 1247 OID 43898)
-- Name: PaymentMethod; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PaymentMethod" AS ENUM (
    'CASH',
    'BANK'
);


--
-- TOC entry 896 (class 1247 OID 37926)
-- Name: RefundSourceType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."RefundSourceType" AS ENUM (
    'STAND',
    'STORAGE'
);


--
-- TOC entry 884 (class 1247 OID 43929)
-- Name: RevisionStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."RevisionStatus" AS ENUM (
    'PAID',
    'NOT_PAID'
);


--
-- TOC entry 893 (class 1247 OID 37915)
-- Name: Role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."Role" AS ENUM (
    'ADMIN',
    'USER'
);


--
-- TOC entry 243 (class 1255 OID 43815)
-- Name: update_active_based_on_client_price(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_active_based_on_client_price() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF NEW."clientPrice" = 0 THEN
    NEW.active := FALSE;
  ELSE
    NEW.active := TRUE;
  END IF;
  RETURN NEW;
END;
$$;


--
-- TOC entry 244 (class 1255 OID 43934)
-- Name: update_revision_status(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_revision_status() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    total_payments NUMERIC;
    total_due NUMERIC;
BEGIN
    -- Calculate the sum of all payments for this revision
    SELECT COALESCE(SUM(amount), 0) INTO total_payments
    FROM "Payment"
    WHERE "revisionId" = NEW."revisionId";

    -- Calculate the total due for this revision (sum of missingProducts * priceAtSale)
    SELECT COALESCE(SUM("missingQuantity" * COALESCE("priceAtSale", 0)), 0) INTO total_due
    FROM "MissingProduct"
    WHERE "revisionId" = NEW."revisionId";

    -- Update the status in the Revision table
    UPDATE "Revision"
    SET "status" = CASE
        WHEN total_payments >= total_due AND total_due > 0 THEN 'PAID'::"RevisionStatus"
        ELSE 'NOT_PAID'::"RevisionStatus"
    END
    WHERE id = NEW."revisionId";

    RETURN NULL;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 241 (class 1259 OID 43842)
-- Name: CashMovement; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CashMovement" (
    id text NOT NULL,
    "cashRegisterId" text NOT NULL,
    type public."CashMovementType" NOT NULL,
    amount double precision NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "userId" text NOT NULL,
    reason text
);


--
-- TOC entry 239 (class 1259 OID 43827)
-- Name: CashRegister; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CashRegister" (
    id text NOT NULL,
    "storageId" text NOT NULL,
    "cashBalance" double precision DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


--
-- TOC entry 219 (class 1259 OID 37956)
-- Name: Check; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Check" (
    id text NOT NULL,
    "standId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "userId" text NOT NULL
);


--
-- TOC entry 220 (class 1259 OID 37964)
-- Name: CheckedProduct; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CheckedProduct" (
    id text NOT NULL,
    "checkId" text NOT NULL,
    "productId" text NOT NULL,
    quantity integer NOT NULL,
    status text NOT NULL,
    "originalQuantity" integer,
    "standQuantityAtCheck" integer
);


--
-- TOC entry 229 (class 1259 OID 38035)
-- Name: CreditNote; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."CreditNote" (
    id text NOT NULL,
    "creditNoteNumber" integer NOT NULL,
    "issuedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "partnerName" text NOT NULL,
    "partnerBulstat" text,
    "partnerMol" text,
    "partnerAddress" text,
    "preparedBy" text NOT NULL,
    products jsonb NOT NULL,
    "totalValue" double precision NOT NULL,
    "vatBase" double precision NOT NULL,
    "vatAmount" double precision NOT NULL,
    "paymentMethod" public."PaymentMethod" DEFAULT 'CASH'::public."PaymentMethod" NOT NULL,
    "invoiceId" text NOT NULL,
    "partnerCity" text,
    "partnerCountry" text,
    "refundId" text
);


--
-- TOC entry 237 (class 1259 OID 38096)
-- Name: Import; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Import" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "standId" text,
    "storageId" text,
    "fileName" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 238 (class 1259 OID 39001)
-- Name: ImportProduct; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."ImportProduct" (
    id text NOT NULL,
    "importId" text NOT NULL,
    "productId" text NOT NULL,
    quantity integer NOT NULL
);


--
-- TOC entry 228 (class 1259 OID 38026)
-- Name: Invoice; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Invoice" (
    id text NOT NULL,
    "invoiceNumber" integer NOT NULL,
    "issuedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "partnerName" text NOT NULL,
    "partnerBulstat" text,
    "partnerMol" text,
    "partnerAddress" text,
    "preparedBy" text NOT NULL,
    products jsonb NOT NULL,
    "totalValue" double precision NOT NULL,
    "vatBase" double precision NOT NULL,
    "vatAmount" double precision NOT NULL,
    "paymentMethod" public."PaymentMethod" DEFAULT 'CASH'::public."PaymentMethod" NOT NULL,
    "revisionNumber" integer,
    "partnerCity" text,
    "partnerCountry" text
);


--
-- TOC entry 225 (class 1259 OID 38004)
-- Name: MissingProduct; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."MissingProduct" (
    id text NOT NULL,
    "revisionId" text NOT NULL,
    "productId" text NOT NULL,
    "missingQuantity" integer NOT NULL,
    "priceAtSale" double precision,
    "givenQuantity" integer
);


--
-- TOC entry 222 (class 1259 OID 37980)
-- Name: Partner; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Partner" (
    id text NOT NULL,
    name text NOT NULL,
    bulstat text,
    "contactPerson" text,
    phone text,
    address text,
    mol text,
    city text,
    country text,
    "percentageDiscount" double precision
);


--
-- TOC entry 240 (class 1259 OID 43834)
-- Name: Payment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Payment" (
    id text NOT NULL,
    "cashRegisterId" text NOT NULL,
    "revisionId" text NOT NULL,
    "invoiceId" text,
    amount double precision NOT NULL,
    method public."PaymentMethod" NOT NULL,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 217 (class 1259 OID 37939)
-- Name: Product; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Product" (
    id text NOT NULL,
    name text NOT NULL,
    barcode text NOT NULL,
    "clientPrice" double precision NOT NULL,
    pcd text,
    quantity integer DEFAULT 0 NOT NULL,
    active boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "deliveryPrice" double precision DEFAULT 0 NOT NULL,
    image text
);


--
-- TOC entry 230 (class 1259 OID 38044)
-- Name: Refund; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Refund" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "sourceType" public."RefundSourceType" NOT NULL,
    "sourceId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "returnedToStorageId" text,
    "returnedAt" timestamp(3) without time zone,
    note text
);


--
-- TOC entry 231 (class 1259 OID 38052)
-- Name: RefundProduct; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."RefundProduct" (
    id text NOT NULL,
    "refundId" text NOT NULL,
    "productId" text NOT NULL,
    quantity integer NOT NULL,
    "priceAtRefund" double precision
);


--
-- TOC entry 224 (class 1259 OID 37995)
-- Name: Revision; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Revision" (
    id text NOT NULL,
    number integer NOT NULL,
    "standId" text,
    "storageId" text,
    "partnerId" text,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    type text DEFAULT 'manual'::text NOT NULL,
    status public."RevisionStatus" DEFAULT 'NOT_PAID'::public."RevisionStatus" NOT NULL,
    "checkId" text
);


--
-- TOC entry 216 (class 1259 OID 37931)
-- Name: Stand; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Stand" (
    id text NOT NULL,
    name text NOT NULL,
    "storeId" text NOT NULL,
    rows integer,
    barcode text,
    columns integer,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    email text
);


--
-- TOC entry 218 (class 1259 OID 37949)
-- Name: StandProduct; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."StandProduct" (
    id text NOT NULL,
    "standId" text NOT NULL,
    "productId" text NOT NULL,
    quantity integer NOT NULL,
    "row" integer,
    "column" integer
);


--
-- TOC entry 226 (class 1259 OID 38011)
-- Name: Storage; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Storage" (
    id text NOT NULL,
    name text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 227 (class 1259 OID 38019)
-- Name: StorageProduct; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."StorageProduct" (
    id text NOT NULL,
    "storageId" text NOT NULL,
    "productId" text NOT NULL,
    quantity integer NOT NULL
);


--
-- TOC entry 223 (class 1259 OID 37987)
-- Name: Store; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Store" (
    id text NOT NULL,
    name text,
    address text NOT NULL,
    contact text,
    phone text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "partnerId" text NOT NULL
);


--
-- TOC entry 242 (class 1259 OID 45539)
-- Name: StoreSchedule; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."StoreSchedule" (
    id text NOT NULL,
    "storeId" text NOT NULL,
    date timestamp(3) without time zone NOT NULL,
    type text,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- TOC entry 235 (class 1259 OID 38080)
-- Name: Transfer; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."Transfer" (
    id text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "sourceStorageId" text NOT NULL,
    "destinationStorageId" text NOT NULL,
    "userId" text NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    "confirmedById" text,
    "confirmedAt" timestamp(3) without time zone
);


--
-- TOC entry 236 (class 1259 OID 38089)
-- Name: TransferProduct; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."TransferProduct" (
    id text NOT NULL,
    "transferId" text NOT NULL,
    "productId" text NOT NULL,
    quantity integer NOT NULL
);


--
-- TOC entry 232 (class 1259 OID 38059)
-- Name: UserPartner; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."UserPartner" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "partnerId" text NOT NULL
);


--
-- TOC entry 233 (class 1259 OID 38066)
-- Name: UserStand; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."UserStand" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "standId" text NOT NULL
);


--
-- TOC entry 234 (class 1259 OID 38073)
-- Name: UserStorage; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."UserStorage" (
    id text NOT NULL,
    "userId" text NOT NULL,
    "storageId" text NOT NULL
);


--
-- TOC entry 215 (class 1259 OID 37902)
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- TOC entry 221 (class 1259 OID 37971)
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id text NOT NULL,
    name text,
    email text NOT NULL,
    password text NOT NULL,
    role public."Role" DEFAULT 'USER'::public."Role" NOT NULL,
    "emailVerified" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone
);


--
-- TOC entry 3645 (class 0 OID 43842)
-- Dependencies: 241
-- Data for Name: CashMovement; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."CashMovement" (id, "cashRegisterId", type, amount, "createdAt", "userId", reason) FROM stdin;
\.


--
-- TOC entry 3643 (class 0 OID 43827)
-- Dependencies: 239
-- Data for Name: CashRegister; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."CashRegister" (id, "storageId", "cashBalance", "createdAt", "updatedAt") FROM stdin;
afecdfd0-3271-4efe-9bf5-6e32df4bc47e	6b5f66af-bd69-492f-8ee3-5ca726b5b8cc	0	2025-08-01 14:44:17.863	2025-08-01 14:44:17.863
dc5fe187-9d7b-4512-9fa7-a2efceb50d68	ab9a3b7d-5cfd-4d1e-94f3-f1ce655854b4	169.55	2025-08-01 14:44:16.521	2025-08-11 11:35:39.883
\.


--
-- TOC entry 3623 (class 0 OID 37956)
-- Dependencies: 219
-- Data for Name: Check; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Check" (id, "standId", "createdAt", "updatedAt", "userId") FROM stdin;
51bef962-70ed-430d-ad5b-0f2fc1de48b0	90b3cae4-e222-4463-aa5a-2bdfdbee08e8	2025-08-07 06:08:43.954	2025-08-07 06:08:43.954	68b9923d-7800-4662-905e-a906d131314b
2c43c164-d698-409c-bdf1-ed3dfcfa161c	158bf47a-1079-4ecb-b58d-0e5c88e05588	2025-08-07 06:25:41.546	2025-08-07 06:25:41.546	68b9923d-7800-4662-905e-a906d131314b
c2b63a00-cffc-4795-b1e7-3ab8ea20c51b	722957e4-24b4-4fef-a9de-eb3dfddadb3f	2025-08-07 11:32:12.205	2025-08-07 11:32:12.205	74a1cd5c-8ae8-40c4-b117-c7530a461026
633ae343-b2a1-49b1-a0cd-f3436c6b8390	48ddc9fc-b2da-4efa-a1ab-89b261ed4c22	2025-08-11 09:33:40.367	2025-08-11 09:33:40.367	68b9923d-7800-4662-905e-a906d131314b
d032bf86-d881-4a45-ba3c-a64adb563667	024c0bb9-769a-4ba3-8a6b-adf8eadb9886	2025-08-11 10:55:31.194	2025-08-11 10:55:31.194	68b9923d-7800-4662-905e-a906d131314b
dfffec83-6155-4568-9bcc-573f086dc9d1	73e62de1-16b3-4025-aa1c-d08eb91e0b54	2025-08-12 07:11:09.92	2025-08-12 07:11:09.92	74a1cd5c-8ae8-40c4-b117-c7530a461026
a0d2c5cc-5882-4770-878b-aa48bfe0977b	73e62de1-16b3-4025-aa1c-d08eb91e0b54	2025-08-12 08:29:24.334	2025-08-12 08:29:24.334	74a1cd5c-8ae8-40c4-b117-c7530a461026
27d549b6-d74f-4008-a059-83c3e530171f	73e62de1-16b3-4025-aa1c-d08eb91e0b54	2025-08-12 08:33:07.298	2025-08-12 08:33:07.298	74a1cd5c-8ae8-40c4-b117-c7530a461026
\.


--
-- TOC entry 3624 (class 0 OID 37964)
-- Dependencies: 220
-- Data for Name: CheckedProduct; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."CheckedProduct" (id, "checkId", "productId", quantity, status, "originalQuantity", "standQuantityAtCheck") FROM stdin;
acfd2abb-8b54-414f-a721-61ac795c64e4	51bef962-70ed-430d-ad5b-0f2fc1de48b0	a8707b5a-a41c-4bc8-a0fe-c823c45ab014	1	missing	3	3
b88551c4-84ca-4e2c-bc7d-a846b4795659	51bef962-70ed-430d-ad5b-0f2fc1de48b0	57090686-76e3-4ef8-83fb-e9f27c159566	1	missing	1	1
2a3b66e8-5fd6-4ff3-85d4-efe747c9023b	51bef962-70ed-430d-ad5b-0f2fc1de48b0	8d75a2da-c502-444e-a242-297fe3497d10	0	ok	2	2
8a0539a6-5b56-491f-9d1f-726c33dee346	51bef962-70ed-430d-ad5b-0f2fc1de48b0	210351fc-7e9c-42ef-923d-8226fc8d2911	0	ok	0	0
009c61eb-0073-46fe-a5ce-29ae2de57c78	51bef962-70ed-430d-ad5b-0f2fc1de48b0	0bbc5bd9-7485-4ca7-90bc-98b4fc4a7d43	0	ok	3	3
55bbc111-7a0f-4fd9-b7d7-aa919e4789a0	51bef962-70ed-430d-ad5b-0f2fc1de48b0	bb855a25-83cd-4164-a896-0c417609d1a0	0	ok	2	2
23d5925c-5329-4625-ba02-7a15057d92c5	51bef962-70ed-430d-ad5b-0f2fc1de48b0	fd6d75ec-ec9d-45b2-a7d8-e61240070374	0	ok	4	4
b2724a5a-2798-4dda-b348-19a824294dc6	51bef962-70ed-430d-ad5b-0f2fc1de48b0	be2a2b08-621e-41b8-8d55-0d68cc8d4445	0	ok	4	4
d25a0daa-e9b5-49aa-a675-1607b4d43171	51bef962-70ed-430d-ad5b-0f2fc1de48b0	c17ea773-f608-4bb6-a71f-d41ee7ea3882	1	missing	4	4
a3445f3e-a44c-4971-9df7-e9cd2f7d2601	51bef962-70ed-430d-ad5b-0f2fc1de48b0	427d7f32-a75f-440e-adf0-f96201d0bc5b	0	ok	2	2
649275c1-8398-4da3-a02f-a0366d5ae1bf	51bef962-70ed-430d-ad5b-0f2fc1de48b0	294ca3f1-937d-4efa-aa8c-864c644fe24b	2	missing	3	3
9fe5877f-317d-4c5f-9e76-eb184ee21de4	51bef962-70ed-430d-ad5b-0f2fc1de48b0	4edfafe5-16d2-4b03-b375-f771eec43ebe	1	missing	2	2
817c24a7-ab39-4e70-ae34-e6a42d0b2446	51bef962-70ed-430d-ad5b-0f2fc1de48b0	cc9be182-5d90-4abf-9976-823b4e61cd33	0	ok	4	4
c003fe37-b164-4f64-8b29-e5d481199b49	51bef962-70ed-430d-ad5b-0f2fc1de48b0	1fe347d2-0396-4f21-89e0-5a7bb19f3756	0	ok	4	4
d252a301-3922-411b-a2cf-44de218b26b2	51bef962-70ed-430d-ad5b-0f2fc1de48b0	8def029f-c4b6-4e44-bbd8-24a3798eaf46	1	missing	4	4
e44403de-08ba-4db6-b9d6-bf870f239bc9	51bef962-70ed-430d-ad5b-0f2fc1de48b0	ac5b9720-e600-41ec-b0ce-e7108feb387d	0	ok	2	2
550db44b-8acc-4a36-a654-265ca8db1ba8	51bef962-70ed-430d-ad5b-0f2fc1de48b0	d0e59e48-079d-442a-920d-ca5b5741b66f	1	missing	2	2
2a6f214c-2ff3-40d9-9ecd-59bf6c1f04d6	51bef962-70ed-430d-ad5b-0f2fc1de48b0	43487f82-6bad-489c-b0a4-dc03cd5a5e8d	0	ok	3	3
8369b4f7-1e35-4720-a887-6e49a44970f7	51bef962-70ed-430d-ad5b-0f2fc1de48b0	daf2f120-5608-4f62-a056-45249b1cc0f4	0	ok	0	0
781f1008-2b7e-4b5e-a5ef-2b683a259bb6	51bef962-70ed-430d-ad5b-0f2fc1de48b0	0e7eb525-b5e0-443d-81e9-1e8a0c59ca11	0	ok	5	5
08825174-c9f8-4673-ac04-b0d74160a981	51bef962-70ed-430d-ad5b-0f2fc1de48b0	0db8a4ea-09fa-4f1f-99f4-b17a3b2e24ad	0	ok	3	3
fa42c56d-7e4c-4ceb-bb31-e84b2cc00db7	51bef962-70ed-430d-ad5b-0f2fc1de48b0	05f013ba-9ba8-465b-a9e9-4fa68f95f009	0	ok	1	1
9d3a6bb9-d668-4cb5-bd27-165b1f3abdf9	51bef962-70ed-430d-ad5b-0f2fc1de48b0	7d469886-3b4c-4ac7-8062-d42330c9c8d7	0	ok	2	2
35f94c6e-2569-4667-9b2c-e574516a2972	51bef962-70ed-430d-ad5b-0f2fc1de48b0	92864630-c64f-4863-8a36-c2b51ea035e8	0	ok	2	2
5180476a-a727-46d2-a29b-5622a39902f5	51bef962-70ed-430d-ad5b-0f2fc1de48b0	80d5432b-878d-4b40-abef-ca31f83db88c	0	ok	2	2
97a5088d-2dc5-4bbb-b84e-644892e90970	51bef962-70ed-430d-ad5b-0f2fc1de48b0	9014815a-340b-4092-88ea-208e3c3a5e49	0	ok	4	4
55d2dfdd-6672-44fe-8587-ed868dd6e103	51bef962-70ed-430d-ad5b-0f2fc1de48b0	9993ceda-cbff-467e-ba33-c9ec45cc4545	0	ok	2	2
7b009834-9c1c-4639-97d0-6b3222d0b41b	51bef962-70ed-430d-ad5b-0f2fc1de48b0	0e4a534f-44ff-4008-863a-a3bbd336fc93	1	missing	1	1
69e858dc-7944-4a11-b0b5-1d892ee50cf7	51bef962-70ed-430d-ad5b-0f2fc1de48b0	7ef35b0c-e2f2-4d87-b9d9-c9a29703b129	0	ok	0	0
8116afcf-33e6-4fee-87e8-e0809963edd7	51bef962-70ed-430d-ad5b-0f2fc1de48b0	8c5d3590-8de1-49eb-852b-5b00a2d95d65	2	missing	2	2
3019a23b-7f34-4771-b6d9-f064ee03a394	51bef962-70ed-430d-ad5b-0f2fc1de48b0	06e735dc-80bf-40c6-ac32-f8e8235350a4	1	missing	3	3
48e4bb8d-00c9-4058-84cf-55df9d627c52	51bef962-70ed-430d-ad5b-0f2fc1de48b0	09473aa4-91ba-4ac6-b421-0131b27668f4	0	ok	3	3
1db447cb-48f5-49f6-abff-ec0cceb89429	51bef962-70ed-430d-ad5b-0f2fc1de48b0	9e5e6bce-ec92-4ed8-ba16-b8c2e3b60fe4	1	missing	4	4
1fa532b7-1c96-4002-95b4-48366d91ff84	51bef962-70ed-430d-ad5b-0f2fc1de48b0	e69c6728-01d9-4d07-8561-3d967b0f3594	0	ok	3	3
4d24a25e-b654-428c-a9f2-ba2b86f55a4c	51bef962-70ed-430d-ad5b-0f2fc1de48b0	93b1106e-24ce-4df3-8df8-ba4d21013a0a	0	ok	4	4
6be9e6b2-d772-42bd-8bab-827b64f47a13	51bef962-70ed-430d-ad5b-0f2fc1de48b0	4ee3536c-5f11-49e4-aa4c-f8a786a7b990	2	missing	6	6
54258876-66f4-49c5-b5b4-fcb4a0789cbf	51bef962-70ed-430d-ad5b-0f2fc1de48b0	eb2a677a-a7d0-41a4-b985-ff96a3788362	3	missing	4	4
347fc1b4-184f-4605-925a-fbc12a201744	51bef962-70ed-430d-ad5b-0f2fc1de48b0	3c47788d-21bc-4263-a1f0-a062a6e51a9b	3	missing	3	3
192b0f8e-c5b9-45da-842e-fc40d4e9e47c	2c43c164-d698-409c-bdf1-ed3dfcfa161c	00bceb45-abcb-4fef-9851-591f6f7e601d	0	ok	3	3
03274882-25eb-4a57-a8ad-4fece0f4cf8e	2c43c164-d698-409c-bdf1-ed3dfcfa161c	32935f08-2ba8-4ed0-9a52-e5cb55848f78	0	ok	3	3
7b4e54b3-2958-44c4-b80c-fd30c5670e51	2c43c164-d698-409c-bdf1-ed3dfcfa161c	b8c7adc6-a08b-43cf-8caa-7c29c42f9f1a	1	missing	3	3
4edb1af9-7e5e-4c52-84d8-5cf9dcd46c9f	2c43c164-d698-409c-bdf1-ed3dfcfa161c	ba3b4d18-4a3a-42ff-ba3a-f4e64e162978	1	missing	3	3
e770ef33-e05e-4718-98f9-b06950191c4b	2c43c164-d698-409c-bdf1-ed3dfcfa161c	023384be-4b4b-4b70-9105-b34a33b303a7	0	ok	3	3
47b1d12e-7830-4246-9d8d-42a6ca88b9aa	2c43c164-d698-409c-bdf1-ed3dfcfa161c	56ace9b9-6f96-4d5e-bba7-70f04c7c2681	0	ok	3	3
e5e0807b-ba81-4b78-9837-18a8f0d66fd8	2c43c164-d698-409c-bdf1-ed3dfcfa161c	17fa3d84-4419-40ef-b7a7-f144387d913c	1	missing	2	2
1a88d13e-14d9-4ecf-8f50-391dd2096ab4	2c43c164-d698-409c-bdf1-ed3dfcfa161c	109d7a24-8924-4c07-9e00-f83363fc21d3	0	ok	5	5
bc83f6ee-db2e-441b-a9c7-ec4a73c7076f	2c43c164-d698-409c-bdf1-ed3dfcfa161c	c24fab55-98f3-4bc3-85af-1b820fd61bdb	0	ok	4	4
2ba5b0ce-8634-4e71-a48d-e9475db4ba7c	2c43c164-d698-409c-bdf1-ed3dfcfa161c	99b64b5b-93e5-4ae1-bbd0-f02b709c82b6	0	ok	4	4
69e666ab-0497-4f4d-b6b0-4d700eaeea96	2c43c164-d698-409c-bdf1-ed3dfcfa161c	f030fd91-27fd-442b-8853-d7fd2e926f5a	0	ok	3	3
c37a4e09-f756-4387-88bc-156c9e43c487	2c43c164-d698-409c-bdf1-ed3dfcfa161c	aee4c76b-b63e-4f5b-89f2-04a1111de40d	0	ok	2	2
7420b9a1-88ac-466c-8837-9c19a4a3c789	2c43c164-d698-409c-bdf1-ed3dfcfa161c	53ea0278-453f-4df0-9272-7e55da9b5ecb	1	missing	3	3
0448d6d1-47a1-4f2a-9b21-2b3cec463311	2c43c164-d698-409c-bdf1-ed3dfcfa161c	deee6c6c-b5d4-47ee-b253-86beaa0ff763	0	ok	3	3
4a81f6d7-42d1-454d-8986-693693300923	2c43c164-d698-409c-bdf1-ed3dfcfa161c	9dca60ee-f6a5-4910-84f2-9b504dc7601d	0	ok	2	2
ecf5f991-e6d3-4248-8bed-7aace9778e6f	2c43c164-d698-409c-bdf1-ed3dfcfa161c	4caa71b4-3266-4796-bb04-6f1474b67288	0	ok	4	4
81bb6071-5ec6-4df6-ac23-58474c263762	2c43c164-d698-409c-bdf1-ed3dfcfa161c	83f830e9-5f80-4dce-a5ce-254247e5d736	0	ok	3	3
26cae578-f643-4ba0-9519-f36f0235d6fe	2c43c164-d698-409c-bdf1-ed3dfcfa161c	42acfe5b-87a9-4ec5-a5ee-6ed12b788a99	0	ok	2	2
331c6e1d-89d7-4ae8-806f-6cc91fb33fb1	2c43c164-d698-409c-bdf1-ed3dfcfa161c	7b85853e-d909-413e-8c27-9003ca34f047	0	ok	2	2
3a13b6de-11ea-450e-b52c-de0e207a39f4	2c43c164-d698-409c-bdf1-ed3dfcfa161c	ae504b55-4776-4560-b106-febe842d47b7	0	ok	2	2
f301509f-3692-4ff2-a7d8-e22a9186b008	2c43c164-d698-409c-bdf1-ed3dfcfa161c	ab733dec-baaa-479e-9583-2cf13c7131ec	0	ok	2	2
d447697d-c25d-447b-9542-33479f7b3fb0	2c43c164-d698-409c-bdf1-ed3dfcfa161c	3a563d70-1d3b-44ea-aafa-c849430bd9d2	0	ok	2	2
c5dd5563-ff9e-406b-96f0-d75826e09a9b	2c43c164-d698-409c-bdf1-ed3dfcfa161c	57121c57-0f01-4c92-afe3-26ae0d30c968	0	ok	2	2
de20ef65-8f6c-409f-9ed1-ce3ae323b1b4	2c43c164-d698-409c-bdf1-ed3dfcfa161c	86d79e90-029d-4fdf-96a0-84dc8d5f000a	0	ok	4	4
18a92b2d-1361-408d-aded-4fa1201d9ca8	2c43c164-d698-409c-bdf1-ed3dfcfa161c	83347115-152a-4229-ab10-1a54f258bef1	0	ok	2	2
0ec5e8be-7479-4aa5-861c-a96630c0ad67	2c43c164-d698-409c-bdf1-ed3dfcfa161c	6ba14854-edaa-4b99-bbfe-8ab18842cfd7	0	ok	2	2
981fc6e0-3a07-4ca6-bdba-d2934922fe08	2c43c164-d698-409c-bdf1-ed3dfcfa161c	fe9db831-2d58-4511-af1f-926092ba02e2	0	ok	1	1
dfc2278a-1e45-4c3e-a427-281e598ec685	2c43c164-d698-409c-bdf1-ed3dfcfa161c	8fdc320a-d74d-4760-8743-31ae9ddba850	0	ok	1	1
a3a65381-ba1d-45d7-8ef6-b884f4af7171	2c43c164-d698-409c-bdf1-ed3dfcfa161c	d376a251-cfa6-4aee-af3d-3c14f5098704	0	ok	4	4
4e95a65b-d52a-469c-939e-0bb451a19775	2c43c164-d698-409c-bdf1-ed3dfcfa161c	c54f156c-8483-4b77-9745-04661d47e82f	0	ok	1	1
f786c61c-ccc3-4869-af2e-543ccedd95ff	2c43c164-d698-409c-bdf1-ed3dfcfa161c	85e801eb-c962-423d-a7ce-02bf518a18ed	0	ok	3	3
1ad796a6-8c37-4667-bba1-7cf4f5585d00	2c43c164-d698-409c-bdf1-ed3dfcfa161c	1af30ab3-53c1-4a69-9649-4e5f8935087b	0	ok	4	4
56b189bd-3e53-4dc1-8777-f3b689890c8b	2c43c164-d698-409c-bdf1-ed3dfcfa161c	c6eacdb6-5f77-49a6-b3f7-3befef4e9881	1	missing	2	2
9be3d904-96ad-4a01-b4df-c82a3e12ee12	2c43c164-d698-409c-bdf1-ed3dfcfa161c	fd2ecaf7-e2ad-4906-9571-0820eaf39fd4	0	ok	0	0
b5970b5a-2ed7-4256-b5f5-7b88a4229e69	2c43c164-d698-409c-bdf1-ed3dfcfa161c	5f983a66-48aa-4419-8951-33bc52217916	0	ok	2	2
88b1a935-f0de-42eb-a2d2-a4174393f2b6	2c43c164-d698-409c-bdf1-ed3dfcfa161c	a2f70fa6-9483-4535-ad27-fd9c0864098e	0	ok	2	2
aabb392f-f3d7-4a41-b74d-02eabaea0685	c2b63a00-cffc-4795-b1e7-3ab8ea20c51b	9e5e6bce-ec92-4ed8-ba16-b8c2e3b60fe4	0	ok	4	4
17aaf290-4f82-4633-8b67-9dacfd3ed8f2	c2b63a00-cffc-4795-b1e7-3ab8ea20c51b	fd6d75ec-ec9d-45b2-a7d8-e61240070374	0	ok	6	6
14f18163-9cd7-4088-8cbe-de43bbf64196	c2b63a00-cffc-4795-b1e7-3ab8ea20c51b	9fac21e5-a8bc-4204-bb35-7dde2cc211e9	1	missing	6	6
4d4f2872-d04e-4b3c-be14-fa3c0577330a	c2b63a00-cffc-4795-b1e7-3ab8ea20c51b	51c9a455-1506-4887-ae1d-0f775899174d	0	ok	9	9
5c7ef034-78bb-490f-9f79-58e6218abcbd	c2b63a00-cffc-4795-b1e7-3ab8ea20c51b	fab4c8b8-6e83-431c-b784-ad3346759365	0	ok	9	9
a53d6101-39e8-4df1-bcaa-cdb989abd60f	c2b63a00-cffc-4795-b1e7-3ab8ea20c51b	e1d608d8-f769-4ef7-bae8-5b48aa46f832	2	missing	4	4
1d559375-b198-4a67-8885-e390c27ee32d	c2b63a00-cffc-4795-b1e7-3ab8ea20c51b	cc9be182-5d90-4abf-9976-823b4e61cd33	0	ok	4	4
3e760742-4e8e-4666-bdad-afb744ebb8e2	c2b63a00-cffc-4795-b1e7-3ab8ea20c51b	1fe347d2-0396-4f21-89e0-5a7bb19f3756	0	ok	4	4
bbd04214-d32c-4c24-bfbf-984cbb60f872	c2b63a00-cffc-4795-b1e7-3ab8ea20c51b	51c5fbd4-d14c-4297-8ee6-32da2fbf65de	4	missing	4	4
640657ef-c7dc-410e-94ce-19007ca93518	c2b63a00-cffc-4795-b1e7-3ab8ea20c51b	9fdde592-74f0-466a-b65b-51c73a356c4f	3	missing	4	4
2a90c3d1-46ef-4592-8169-5116a9a9212a	c2b63a00-cffc-4795-b1e7-3ab8ea20c51b	6c2bd3f8-a725-4c6a-bc96-487b8512f477	0	ok	3	3
1b994ed9-f895-46e2-a8a6-62489d56f1a7	c2b63a00-cffc-4795-b1e7-3ab8ea20c51b	806b7339-7303-414d-8966-d49f02fa804f	0	ok	1	1
571902fb-2cf8-4198-9368-9f499e3c8897	c2b63a00-cffc-4795-b1e7-3ab8ea20c51b	080e1bc6-2e5b-485b-a369-99b53586eda3	0	ok	3	3
5caa5e9f-d27c-42e5-863b-69c2b9b88f46	c2b63a00-cffc-4795-b1e7-3ab8ea20c51b	2b5872eb-4998-4d04-a96d-338e6e4d9165	0	ok	3	3
39132cd7-f0a7-4061-8ed7-991b8b9bfd0e	c2b63a00-cffc-4795-b1e7-3ab8ea20c51b	c747c326-8331-4ec4-b19a-ee3912f4bbec	0	ok	3	3
d4ea57ef-7aa8-4409-9a8e-6766f916611d	c2b63a00-cffc-4795-b1e7-3ab8ea20c51b	5b685926-58cb-49cb-a629-c5238a00740a	1	missing	3	3
d908dfcf-c112-439d-b14c-5752f4d74a9d	c2b63a00-cffc-4795-b1e7-3ab8ea20c51b	0dccea72-e417-4381-b430-0854dc98fd2b	0	ok	2	2
ff1a1016-0d5d-44d5-ada6-0af1b9a16497	c2b63a00-cffc-4795-b1e7-3ab8ea20c51b	3d61be70-f89f-4d27-8b49-1ae3ab2a802c	1	missing	1	1
05631a19-595f-499c-ac1a-e5852b4dc50a	c2b63a00-cffc-4795-b1e7-3ab8ea20c51b	e00843fb-fedb-434a-ae73-f9d8e554151e	2	missing	8	8
6f8c635f-93ca-4e35-90ba-724ba2c239c7	c2b63a00-cffc-4795-b1e7-3ab8ea20c51b	3c29b236-58cf-4201-a171-4750ee76a5c5	1	missing	6	6
e71300b1-e16e-43ea-9d86-ea4232f2dc44	c2b63a00-cffc-4795-b1e7-3ab8ea20c51b	1cea990b-852a-41cc-9216-fa3e3006f2d6	0	ok	6	6
1aae6a53-f186-4a60-a764-7f0888b0bace	c2b63a00-cffc-4795-b1e7-3ab8ea20c51b	2b052187-883e-43a4-bed1-523771b663e0	0	ok	6	6
06e59494-e99d-45e8-af0e-fe870c5e05ac	c2b63a00-cffc-4795-b1e7-3ab8ea20c51b	e3685b83-25e1-4679-a9d0-5fcaa8be1b29	2	missing	4	4
b41d0486-a56a-4a92-9121-034847d88dd2	c2b63a00-cffc-4795-b1e7-3ab8ea20c51b	9f2beabc-2da0-4a15-9a98-5192ddbe714b	0	ok	2	2
956877c1-7488-45ec-9906-128e1ea5f0d6	c2b63a00-cffc-4795-b1e7-3ab8ea20c51b	8890477e-792f-4ccc-bfa4-efa5d19cbba3	0	ok	2	2
f82a0a13-651a-4777-aa90-86831920e41c	c2b63a00-cffc-4795-b1e7-3ab8ea20c51b	0cf6ae53-d9ae-4269-ac96-f19b8dbdbcb2	0	ok	4	4
c8fb451e-69dd-414d-a312-42d4ca9a4e4d	c2b63a00-cffc-4795-b1e7-3ab8ea20c51b	4bee824c-e816-4b4a-9027-7c6cb4e495da	0	ok	4	4
7f088118-999e-4001-8a0c-6ea28dd091bb	c2b63a00-cffc-4795-b1e7-3ab8ea20c51b	f62e9a15-d8a7-4781-a2fc-6df46b37e381	0	ok	2	2
30037b3a-79ee-4c3e-97d7-695cbfd866dc	c2b63a00-cffc-4795-b1e7-3ab8ea20c51b	4ff4bc90-9ec6-4ef8-b00b-0ea0346642f3	0	ok	2	2
3b124002-82a9-43a4-a411-2b215a921d6d	633ae343-b2a1-49b1-a0cd-f3436c6b8390	fd6d75ec-ec9d-45b2-a7d8-e61240070374	3	missing	6	6
45b01c88-b9b2-4892-994e-8dd3d7e22ecd	633ae343-b2a1-49b1-a0cd-f3436c6b8390	9fac21e5-a8bc-4204-bb35-7dde2cc211e9	0	ok	6	6
a600ec95-c627-4ae0-973a-44803b7cbd1b	633ae343-b2a1-49b1-a0cd-f3436c6b8390	e00843fb-fedb-434a-ae73-f9d8e554151e	1	missing	8	8
c55f6e06-8cdf-44ed-9f42-919283b26f0d	633ae343-b2a1-49b1-a0cd-f3436c6b8390	3c29b236-58cf-4201-a171-4750ee76a5c5	1	missing	6	6
311cfd4b-dd1d-49f8-83ad-a3407cc60ccd	633ae343-b2a1-49b1-a0cd-f3436c6b8390	1cea990b-852a-41cc-9216-fa3e3006f2d6	2	missing	6	6
f1d0f7eb-ffca-490e-aff9-70b1c0372846	633ae343-b2a1-49b1-a0cd-f3436c6b8390	2b052187-883e-43a4-bed1-523771b663e0	0	ok	6	6
8a5f0eaf-a264-451b-9b5c-c0cc92393e81	633ae343-b2a1-49b1-a0cd-f3436c6b8390	51c9a455-1506-4887-ae1d-0f775899174d	4	missing	9	9
d5e5413b-324c-4ef6-872a-de07e22efeaf	633ae343-b2a1-49b1-a0cd-f3436c6b8390	294ca3f1-937d-4efa-aa8c-864c644fe24b	0	ok	4	4
d8a53eb7-f237-4e69-8200-3853c015923b	633ae343-b2a1-49b1-a0cd-f3436c6b8390	fab4c8b8-6e83-431c-b784-ad3346759365	3	missing	9	9
103c0963-fd93-487a-b5bc-c5dc979f3f45	633ae343-b2a1-49b1-a0cd-f3436c6b8390	cc9be182-5d90-4abf-9976-823b4e61cd33	2	missing	8	8
1dde6cc8-9a9a-4bb9-8df8-c0c116e14980	633ae343-b2a1-49b1-a0cd-f3436c6b8390	51c5fbd4-d14c-4297-8ee6-32da2fbf65de	1	missing	4	4
bf80219b-2866-4024-a969-883f43743f39	633ae343-b2a1-49b1-a0cd-f3436c6b8390	9fdde592-74f0-466a-b65b-51c73a356c4f	2	missing	4	4
990071f6-10b6-436c-8b1c-6793585b034d	633ae343-b2a1-49b1-a0cd-f3436c6b8390	6c2bd3f8-a725-4c6a-bc96-487b8512f477	0	ok	3	3
195a24a8-5f44-4f01-a40e-9052e19b6883	633ae343-b2a1-49b1-a0cd-f3436c6b8390	806b7339-7303-414d-8966-d49f02fa804f	0	ok	1	1
8dad6007-27b1-47cb-81df-f637c88c4a16	633ae343-b2a1-49b1-a0cd-f3436c6b8390	080e1bc6-2e5b-485b-a369-99b53586eda3	0	ok	3	3
bab5e147-4290-4c54-952e-adfd5c86697d	633ae343-b2a1-49b1-a0cd-f3436c6b8390	2b5872eb-4998-4d04-a96d-338e6e4d9165	1	missing	3	3
76740226-2374-4886-b5a6-9bba31eba030	633ae343-b2a1-49b1-a0cd-f3436c6b8390	c747c326-8331-4ec4-b19a-ee3912f4bbec	0	ok	3	3
ea2a850d-85b2-4320-b79d-31ac9ef122b9	633ae343-b2a1-49b1-a0cd-f3436c6b8390	5b685926-58cb-49cb-a629-c5238a00740a	1	missing	3	3
30c2e665-a47c-4101-a767-9a0557a7d327	633ae343-b2a1-49b1-a0cd-f3436c6b8390	3d61be70-f89f-4d27-8b49-1ae3ab2a802c	0	ok	3	3
10dea3ce-4b5b-4f4b-82a8-c621ad54a01a	633ae343-b2a1-49b1-a0cd-f3436c6b8390	9e5e6bce-ec92-4ed8-ba16-b8c2e3b60fe4	2	missing	4	4
c6f8b287-fa33-404e-b59d-4ef28e055f47	633ae343-b2a1-49b1-a0cd-f3436c6b8390	e3685b83-25e1-4679-a9d0-5fcaa8be1b29	1	missing	4	4
35c58783-c539-4c49-9978-9b48dc0d0e9d	633ae343-b2a1-49b1-a0cd-f3436c6b8390	9f2beabc-2da0-4a15-9a98-5192ddbe714b	0	ok	2	2
d48e78a2-5f49-4fe4-a447-4f0a699efd80	633ae343-b2a1-49b1-a0cd-f3436c6b8390	8890477e-792f-4ccc-bfa4-efa5d19cbba3	0	ok	2	2
985dae0e-225a-464a-a8cc-a6cd917ebdd8	633ae343-b2a1-49b1-a0cd-f3436c6b8390	0cf6ae53-d9ae-4269-ac96-f19b8dbdbcb2	1	missing	4	4
2a5c51a5-3e95-4be9-9940-2096b5e026a3	633ae343-b2a1-49b1-a0cd-f3436c6b8390	4bee824c-e816-4b4a-9027-7c6cb4e495da	0	ok	4	4
b8fa3006-adbd-4f07-b04a-c4b5cef0d3aa	633ae343-b2a1-49b1-a0cd-f3436c6b8390	f62e9a15-d8a7-4781-a2fc-6df46b37e381	0	ok	2	2
684f7241-9cb7-493d-9483-b8eafe884c29	633ae343-b2a1-49b1-a0cd-f3436c6b8390	4ff4bc90-9ec6-4ef8-b00b-0ea0346642f3	2	missing	2	2
4aeec7a8-cf23-481b-b9aa-cb42d60f93af	d032bf86-d881-4a45-ba3c-a64adb563667	9fac21e5-a8bc-4204-bb35-7dde2cc211e9	5	missing	6	6
fc5e3572-8c36-4a72-8079-4df5f7ad8a2e	d032bf86-d881-4a45-ba3c-a64adb563667	fd6d75ec-ec9d-45b2-a7d8-e61240070374	1	missing	6	6
53d76d37-4d15-45e9-8a39-d001619d61d4	d032bf86-d881-4a45-ba3c-a64adb563667	e00843fb-fedb-434a-ae73-f9d8e554151e	4	missing	8	8
316868eb-9928-44c9-9811-4a2a8acfbbd9	d032bf86-d881-4a45-ba3c-a64adb563667	2b052187-883e-43a4-bed1-523771b663e0	1	missing	6	6
9c2000fd-8ed1-4e0d-83b9-a16819c2659f	d032bf86-d881-4a45-ba3c-a64adb563667	3c29b236-58cf-4201-a171-4750ee76a5c5	0	ok	6	6
fef43b45-9220-44da-8f20-7fc2d44b9391	d032bf86-d881-4a45-ba3c-a64adb563667	1cea990b-852a-41cc-9216-fa3e3006f2d6	2	missing	6	6
48c10939-0c52-4714-970c-3294b6e21e2d	d032bf86-d881-4a45-ba3c-a64adb563667	3d61be70-f89f-4d27-8b49-1ae3ab2a802c	0	ok	1	1
8b7a52a7-4a4c-4ce3-897c-2fd6186a374a	d032bf86-d881-4a45-ba3c-a64adb563667	0dccea72-e417-4381-b430-0854dc98fd2b	0	ok	2	2
07c2e3b1-6738-4618-8895-1f192769dc25	d032bf86-d881-4a45-ba3c-a64adb563667	5b685926-58cb-49cb-a629-c5238a00740a	1	missing	3	3
ad3507a3-9ee9-4738-aa32-1f9de199f3ea	d032bf86-d881-4a45-ba3c-a64adb563667	c747c326-8331-4ec4-b19a-ee3912f4bbec	0	ok	3	3
eb6ad950-c05f-44e4-b1d3-a75d75632b13	d032bf86-d881-4a45-ba3c-a64adb563667	2b5872eb-4998-4d04-a96d-338e6e4d9165	0	ok	3	3
452413c1-e2cb-45e4-a6ff-e84c7a93fa70	d032bf86-d881-4a45-ba3c-a64adb563667	4ff4bc90-9ec6-4ef8-b00b-0ea0346642f3	2	missing	2	2
f768484c-6d12-4aeb-a89a-271eb2e108a5	d032bf86-d881-4a45-ba3c-a64adb563667	f62e9a15-d8a7-4781-a2fc-6df46b37e381	2	missing	2	2
0f1c07ad-8c7a-42b5-ab86-7465d667acc3	d032bf86-d881-4a45-ba3c-a64adb563667	6c2bd3f8-a725-4c6a-bc96-487b8512f477	2	missing	3	3
5037477c-21f4-4e02-a535-4ed05e645478	d032bf86-d881-4a45-ba3c-a64adb563667	080e1bc6-2e5b-485b-a369-99b53586eda3	2	missing	3	3
9d8cd002-796f-48cf-8921-306be35a34b1	d032bf86-d881-4a45-ba3c-a64adb563667	806b7339-7303-414d-8966-d49f02fa804f	0	ok	1	1
4dc5a108-da3e-4aca-824f-8d2af77bb797	d032bf86-d881-4a45-ba3c-a64adb563667	fab4c8b8-6e83-431c-b784-ad3346759365	2	missing	9	9
9cda1f68-a809-45e8-bfe7-308d64a7b0a9	d032bf86-d881-4a45-ba3c-a64adb563667	51c9a455-1506-4887-ae1d-0f775899174d	1	missing	9	9
3ebe46a0-106e-422c-92b1-48974dc19f0a	d032bf86-d881-4a45-ba3c-a64adb563667	294ca3f1-937d-4efa-aa8c-864c644fe24b	2	missing	4	4
b01e5a9a-f4ba-4a52-99d5-e617a109a09f	d032bf86-d881-4a45-ba3c-a64adb563667	cc9be182-5d90-4abf-9976-823b4e61cd33	1	missing	4	4
40e55d13-ed5d-4f32-8923-2a3279200721	d032bf86-d881-4a45-ba3c-a64adb563667	1fe347d2-0396-4f21-89e0-5a7bb19f3756	1	missing	4	4
4e4fcfed-4541-46dd-a842-50ea99f7b2c2	d032bf86-d881-4a45-ba3c-a64adb563667	9fdde592-74f0-466a-b65b-51c73a356c4f	2	missing	4	4
6e608955-7578-4f7a-982c-9cadbb3f0b47	d032bf86-d881-4a45-ba3c-a64adb563667	51c5fbd4-d14c-4297-8ee6-32da2fbf65de	2	missing	4	4
4261b15c-d0d6-4f3b-bb73-488540876227	d032bf86-d881-4a45-ba3c-a64adb563667	9e5e6bce-ec92-4ed8-ba16-b8c2e3b60fe4	0	ok	4	4
c2a7a348-bf93-4711-8bef-28079c21cbd3	d032bf86-d881-4a45-ba3c-a64adb563667	e3685b83-25e1-4679-a9d0-5fcaa8be1b29	0	ok	4	4
e1809d07-56ca-434c-a76b-e5ba2104d4e1	d032bf86-d881-4a45-ba3c-a64adb563667	9f2beabc-2da0-4a15-9a98-5192ddbe714b	1	missing	2	2
ab765c75-3391-4914-9ab5-d1ccec1bb965	d032bf86-d881-4a45-ba3c-a64adb563667	8890477e-792f-4ccc-bfa4-efa5d19cbba3	0	ok	2	2
a234c0e1-2b3c-4a9d-800e-5f8592c59912	d032bf86-d881-4a45-ba3c-a64adb563667	0cf6ae53-d9ae-4269-ac96-f19b8dbdbcb2	1	missing	4	4
1a37b3fc-e46c-4411-b498-89790aa57072	d032bf86-d881-4a45-ba3c-a64adb563667	4bee824c-e816-4b4a-9027-7c6cb4e495da	1	missing	4	4
44979e2d-bdbe-4852-9710-28ff89a900d1	dfffec83-6155-4568-9bcc-573f086dc9d1	9fac21e5-a8bc-4204-bb35-7dde2cc211e9	0	ok	6	6
b845b574-79d8-4bbc-a5b4-25c09227d53d	dfffec83-6155-4568-9bcc-573f086dc9d1	fd6d75ec-ec9d-45b2-a7d8-e61240070374	0	ok	6	6
1d47f8d7-21a6-4ee8-b136-68871f596c19	dfffec83-6155-4568-9bcc-573f086dc9d1	e00843fb-fedb-434a-ae73-f9d8e554151e	0	ok	0	0
75a22c3d-bea5-49e6-9cb0-be309ca0f915	dfffec83-6155-4568-9bcc-573f086dc9d1	2b052187-883e-43a4-bed1-523771b663e0	0	ok	6	6
de053487-e996-4194-85a3-df6948f26126	dfffec83-6155-4568-9bcc-573f086dc9d1	3c29b236-58cf-4201-a171-4750ee76a5c5	0	ok	0	0
37e3f2e4-327b-4b88-a7b2-c5fe00684c87	dfffec83-6155-4568-9bcc-573f086dc9d1	1cea990b-852a-41cc-9216-fa3e3006f2d6	0	ok	0	0
9ba8615a-2967-4960-9c22-ed5f01218f0d	dfffec83-6155-4568-9bcc-573f086dc9d1	3d61be70-f89f-4d27-8b49-1ae3ab2a802c	0	ok	0	0
3804001d-ece0-4770-b628-2742213d8744	dfffec83-6155-4568-9bcc-573f086dc9d1	0dccea72-e417-4381-b430-0854dc98fd2b	0	ok	0	0
24b34380-9e1d-4a45-a04c-2d6bf88ab238	dfffec83-6155-4568-9bcc-573f086dc9d1	5b685926-58cb-49cb-a629-c5238a00740a	0	ok	0	0
074480db-90ab-4d69-8fc8-70cd3f2cc4f8	dfffec83-6155-4568-9bcc-573f086dc9d1	c747c326-8331-4ec4-b19a-ee3912f4bbec	0	ok	0	0
4ff1c410-b5c0-46e6-b51a-4d3f30a5963f	dfffec83-6155-4568-9bcc-573f086dc9d1	2b5872eb-4998-4d04-a96d-338e6e4d9165	0	ok	3	3
f68e8bed-4574-4bb4-8308-da6ef0e27d31	dfffec83-6155-4568-9bcc-573f086dc9d1	4ff4bc90-9ec6-4ef8-b00b-0ea0346642f3	0	ok	0	0
1268dca0-5928-4a53-a80b-3fd33f2397f6	dfffec83-6155-4568-9bcc-573f086dc9d1	f62e9a15-d8a7-4781-a2fc-6df46b37e381	0	ok	2	2
0d321a95-7900-426c-bd6c-994511d46ce5	dfffec83-6155-4568-9bcc-573f086dc9d1	6c2bd3f8-a725-4c6a-bc96-487b8512f477	0	ok	0	0
7a82d5fc-c247-4f59-9665-3f7224773af6	dfffec83-6155-4568-9bcc-573f086dc9d1	080e1bc6-2e5b-485b-a369-99b53586eda3	0	ok	0	0
7f6fa5ad-9689-494b-ab43-0095aa108677	dfffec83-6155-4568-9bcc-573f086dc9d1	806b7339-7303-414d-8966-d49f02fa804f	0	ok	0	0
b254cbd9-d90a-40db-97cb-62e56ee4a1df	dfffec83-6155-4568-9bcc-573f086dc9d1	fab4c8b8-6e83-431c-b784-ad3346759365	0	ok	0	0
f40391a9-0954-4f50-b27c-cd2571104011	dfffec83-6155-4568-9bcc-573f086dc9d1	51c9a455-1506-4887-ae1d-0f775899174d	0	ok	0	0
815d1725-a096-49af-bc6a-72aa525db80b	dfffec83-6155-4568-9bcc-573f086dc9d1	294ca3f1-937d-4efa-aa8c-864c644fe24b	0	ok	0	0
c47f3420-5859-492e-b64a-84446d6c1f9a	dfffec83-6155-4568-9bcc-573f086dc9d1	cc9be182-5d90-4abf-9976-823b4e61cd33	0	ok	0	0
f1f7af85-bfc0-4fb8-b1d5-2cf589bf31be	dfffec83-6155-4568-9bcc-573f086dc9d1	1fe347d2-0396-4f21-89e0-5a7bb19f3756	0	ok	0	0
543d45d8-f827-4718-a5bd-8a33e15e00b6	dfffec83-6155-4568-9bcc-573f086dc9d1	9fdde592-74f0-466a-b65b-51c73a356c4f	0	ok	0	0
8ad3c7bf-ab84-46bd-99ca-712265acde90	dfffec83-6155-4568-9bcc-573f086dc9d1	51c5fbd4-d14c-4297-8ee6-32da2fbf65de	0	ok	0	0
33369da3-8096-4d35-b17a-aba81e236a8a	dfffec83-6155-4568-9bcc-573f086dc9d1	9e5e6bce-ec92-4ed8-ba16-b8c2e3b60fe4	0	ok	4	4
dcc69719-1c71-437a-8924-8741fc97817f	dfffec83-6155-4568-9bcc-573f086dc9d1	e3685b83-25e1-4679-a9d0-5fcaa8be1b29	0	ok	0	0
d5623224-4a87-438c-ae49-d90db48c8cc3	dfffec83-6155-4568-9bcc-573f086dc9d1	9f2beabc-2da0-4a15-9a98-5192ddbe714b	0	ok	2	2
88fa0560-50ec-4b33-b7c6-878ce4646f98	dfffec83-6155-4568-9bcc-573f086dc9d1	8890477e-792f-4ccc-bfa4-efa5d19cbba3	2	missing	2	2
2380a436-8aab-48be-9e3e-e9056f848f43	dfffec83-6155-4568-9bcc-573f086dc9d1	0cf6ae53-d9ae-4269-ac96-f19b8dbdbcb2	0	ok	0	0
414a95d1-d456-4a7b-8a44-410e62cc0a64	dfffec83-6155-4568-9bcc-573f086dc9d1	4bee824c-e816-4b4a-9027-7c6cb4e495da	0	ok	4	4
e926a383-6afc-4a95-b8e7-1b9b64c24e28	a0d2c5cc-5882-4770-878b-aa48bfe0977b	9fac21e5-a8bc-4204-bb35-7dde2cc211e9	0	ok	5	5
c5b89dd6-eddf-47ac-be8f-e3cbff2d1c8c	a0d2c5cc-5882-4770-878b-aa48bfe0977b	fd6d75ec-ec9d-45b2-a7d8-e61240070374	0	ok	6	6
3b9a10e6-f1ba-4ed9-8d9e-0bfd5ba82c2c	a0d2c5cc-5882-4770-878b-aa48bfe0977b	e00843fb-fedb-434a-ae73-f9d8e554151e	0	ok	0	0
12d746e0-4f96-4885-af35-8f2a3643e648	a0d2c5cc-5882-4770-878b-aa48bfe0977b	2b052187-883e-43a4-bed1-523771b663e0	0	ok	6	6
6b0b9c4f-331f-43c1-87ba-ce49a51177f0	a0d2c5cc-5882-4770-878b-aa48bfe0977b	3c29b236-58cf-4201-a171-4750ee76a5c5	0	ok	0	0
9119c484-ba6a-4e12-943a-97cc88126636	a0d2c5cc-5882-4770-878b-aa48bfe0977b	1cea990b-852a-41cc-9216-fa3e3006f2d6	0	ok	0	0
16bde15c-447f-4c1e-98d1-bd61e7f98e71	a0d2c5cc-5882-4770-878b-aa48bfe0977b	3d61be70-f89f-4d27-8b49-1ae3ab2a802c	0	ok	0	0
39e65074-6cab-4612-9c0f-09b7c32c4322	a0d2c5cc-5882-4770-878b-aa48bfe0977b	0dccea72-e417-4381-b430-0854dc98fd2b	0	ok	0	0
f8c30a9b-7ccc-4ef1-a9fd-3c8da0550917	a0d2c5cc-5882-4770-878b-aa48bfe0977b	5b685926-58cb-49cb-a629-c5238a00740a	0	ok	0	0
52ede737-b07c-4e0f-b4a0-89d43e875916	a0d2c5cc-5882-4770-878b-aa48bfe0977b	c747c326-8331-4ec4-b19a-ee3912f4bbec	0	ok	0	0
a54e18df-6180-4027-b528-e23112314259	a0d2c5cc-5882-4770-878b-aa48bfe0977b	2b5872eb-4998-4d04-a96d-338e6e4d9165	0	ok	3	3
2cc7ba9e-e51d-4ca3-b85c-7c6725c7f16d	a0d2c5cc-5882-4770-878b-aa48bfe0977b	4ff4bc90-9ec6-4ef8-b00b-0ea0346642f3	0	ok	0	0
1f4f186d-a0cb-421b-877e-34634d1145ff	a0d2c5cc-5882-4770-878b-aa48bfe0977b	f62e9a15-d8a7-4781-a2fc-6df46b37e381	0	ok	2	2
b7ddc2ab-4872-473f-bace-aae61e81cf81	a0d2c5cc-5882-4770-878b-aa48bfe0977b	6c2bd3f8-a725-4c6a-bc96-487b8512f477	0	ok	0	0
52788dca-fc72-46e2-8c77-6403501872c1	a0d2c5cc-5882-4770-878b-aa48bfe0977b	080e1bc6-2e5b-485b-a369-99b53586eda3	0	ok	0	0
bc9f34f2-5aeb-4c8e-8b6e-b9f1782c3a61	a0d2c5cc-5882-4770-878b-aa48bfe0977b	806b7339-7303-414d-8966-d49f02fa804f	0	ok	0	0
27372de1-a5a7-4e78-aef4-2e0e8a7a2f95	a0d2c5cc-5882-4770-878b-aa48bfe0977b	fab4c8b8-6e83-431c-b784-ad3346759365	0	ok	0	0
8c502fe9-a9cf-4fba-9957-11f544cfd153	a0d2c5cc-5882-4770-878b-aa48bfe0977b	51c9a455-1506-4887-ae1d-0f775899174d	0	ok	0	0
aa94cf58-4200-4594-bc8b-c30f88dc87ac	a0d2c5cc-5882-4770-878b-aa48bfe0977b	294ca3f1-937d-4efa-aa8c-864c644fe24b	0	ok	0	0
54ae37e7-6a97-4134-9320-07606476bfc9	a0d2c5cc-5882-4770-878b-aa48bfe0977b	cc9be182-5d90-4abf-9976-823b4e61cd33	0	ok	0	0
b827eaf6-3aab-4b3b-96b9-aece5888547c	a0d2c5cc-5882-4770-878b-aa48bfe0977b	1fe347d2-0396-4f21-89e0-5a7bb19f3756	0	ok	0	0
cd6df5d5-b4ad-48d9-a585-d96caa0d48f6	a0d2c5cc-5882-4770-878b-aa48bfe0977b	9fdde592-74f0-466a-b65b-51c73a356c4f	0	ok	0	0
165188d0-8092-4302-a4cd-5e44338c312b	a0d2c5cc-5882-4770-878b-aa48bfe0977b	51c5fbd4-d14c-4297-8ee6-32da2fbf65de	0	ok	0	0
a126f6b0-7989-481d-9352-b33b3cf6e1dd	a0d2c5cc-5882-4770-878b-aa48bfe0977b	9e5e6bce-ec92-4ed8-ba16-b8c2e3b60fe4	0	ok	4	4
dacc9245-129f-47c2-976b-0ad3b20dadd5	a0d2c5cc-5882-4770-878b-aa48bfe0977b	e3685b83-25e1-4679-a9d0-5fcaa8be1b29	0	ok	0	0
4d18af42-2102-439b-b505-c369f3856337	a0d2c5cc-5882-4770-878b-aa48bfe0977b	9f2beabc-2da0-4a15-9a98-5192ddbe714b	0	ok	2	2
6a6b4de3-78fc-412d-8b8a-94a8b1e022f1	a0d2c5cc-5882-4770-878b-aa48bfe0977b	8890477e-792f-4ccc-bfa4-efa5d19cbba3	1	missing	1	1
c2129811-e47c-46e6-bef9-cadf396776df	a0d2c5cc-5882-4770-878b-aa48bfe0977b	0cf6ae53-d9ae-4269-ac96-f19b8dbdbcb2	0	ok	0	0
c7a5a7aa-b3ec-4fc0-8a12-f55b8f6d2dfc	a0d2c5cc-5882-4770-878b-aa48bfe0977b	4bee824c-e816-4b4a-9027-7c6cb4e495da	0	ok	4	4
7af317be-093f-4094-ac65-4fdbdd8621ae	27d549b6-d74f-4008-a059-83c3e530171f	9fac21e5-a8bc-4204-bb35-7dde2cc211e9	1	missing	5	5
72db0ec3-f138-48eb-bc2d-8e5d487d78de	27d549b6-d74f-4008-a059-83c3e530171f	fd6d75ec-ec9d-45b2-a7d8-e61240070374	0	ok	6	6
03ff299c-3749-454b-9d8d-e8bd94067e94	27d549b6-d74f-4008-a059-83c3e530171f	e00843fb-fedb-434a-ae73-f9d8e554151e	0	ok	0	0
66b714da-b7b6-4cfd-b7f4-b7f488f2dd3a	27d549b6-d74f-4008-a059-83c3e530171f	2b052187-883e-43a4-bed1-523771b663e0	0	ok	6	6
da2478ad-5793-431b-b546-1bac1a9bff6e	27d549b6-d74f-4008-a059-83c3e530171f	3c29b236-58cf-4201-a171-4750ee76a5c5	0	ok	0	0
855b09fb-b48a-48cf-a416-a4b5a78e4f0f	27d549b6-d74f-4008-a059-83c3e530171f	1cea990b-852a-41cc-9216-fa3e3006f2d6	0	ok	0	0
bd31ed67-9e5a-4d25-91ea-760ea6e36568	27d549b6-d74f-4008-a059-83c3e530171f	3d61be70-f89f-4d27-8b49-1ae3ab2a802c	0	ok	0	0
1ff3be26-301b-4d28-bfe0-b53716e16e2e	27d549b6-d74f-4008-a059-83c3e530171f	0dccea72-e417-4381-b430-0854dc98fd2b	0	ok	0	0
ee8652d6-df6a-42c6-aeb6-01a3b7c78f38	27d549b6-d74f-4008-a059-83c3e530171f	5b685926-58cb-49cb-a629-c5238a00740a	0	ok	0	0
1315e52c-ee4a-40dc-82e7-7fdc824feaf5	27d549b6-d74f-4008-a059-83c3e530171f	c747c326-8331-4ec4-b19a-ee3912f4bbec	0	ok	0	0
85aacd15-a0fe-404f-ac25-8018fe16318b	27d549b6-d74f-4008-a059-83c3e530171f	2b5872eb-4998-4d04-a96d-338e6e4d9165	0	ok	3	3
fa473060-9ac9-4131-8163-eacfa6d647ef	27d549b6-d74f-4008-a059-83c3e530171f	4ff4bc90-9ec6-4ef8-b00b-0ea0346642f3	0	ok	0	0
31f9e920-63d3-482c-a9fa-6b799e51f59a	27d549b6-d74f-4008-a059-83c3e530171f	f62e9a15-d8a7-4781-a2fc-6df46b37e381	0	ok	2	2
b6b858e6-bcbd-44de-8a09-e1ce53c75562	27d549b6-d74f-4008-a059-83c3e530171f	6c2bd3f8-a725-4c6a-bc96-487b8512f477	0	ok	0	0
33ab4917-04fb-4322-bcf3-8ca194d8676e	27d549b6-d74f-4008-a059-83c3e530171f	080e1bc6-2e5b-485b-a369-99b53586eda3	0	ok	0	0
b661fe64-8e2c-4c5e-981e-563669a046a3	27d549b6-d74f-4008-a059-83c3e530171f	806b7339-7303-414d-8966-d49f02fa804f	0	ok	0	0
13314837-e64f-448d-9160-799f085731a3	27d549b6-d74f-4008-a059-83c3e530171f	fab4c8b8-6e83-431c-b784-ad3346759365	0	ok	0	0
641ea58c-b128-40c1-98a4-890c44733f4f	27d549b6-d74f-4008-a059-83c3e530171f	51c9a455-1506-4887-ae1d-0f775899174d	0	ok	0	0
8594a907-1b28-41e9-81b6-978f1d574f93	27d549b6-d74f-4008-a059-83c3e530171f	294ca3f1-937d-4efa-aa8c-864c644fe24b	0	ok	0	0
f27b3bfb-a9fe-497f-8c24-06ae820bd334	27d549b6-d74f-4008-a059-83c3e530171f	cc9be182-5d90-4abf-9976-823b4e61cd33	0	ok	0	0
ad2d9c6d-f604-4307-b587-67214aeb97b2	27d549b6-d74f-4008-a059-83c3e530171f	1fe347d2-0396-4f21-89e0-5a7bb19f3756	0	ok	0	0
e396f0c2-666e-442d-a0d0-ae6e4e9c75b0	27d549b6-d74f-4008-a059-83c3e530171f	9fdde592-74f0-466a-b65b-51c73a356c4f	0	ok	0	0
0b08e616-841c-4252-bcee-70cfdc728d1e	27d549b6-d74f-4008-a059-83c3e530171f	51c5fbd4-d14c-4297-8ee6-32da2fbf65de	0	ok	0	0
1f789f87-2cf6-42c9-b696-6deaba4d233f	27d549b6-d74f-4008-a059-83c3e530171f	9e5e6bce-ec92-4ed8-ba16-b8c2e3b60fe4	0	ok	4	4
b8cae42e-68a4-4133-add7-426216b9a130	27d549b6-d74f-4008-a059-83c3e530171f	e3685b83-25e1-4679-a9d0-5fcaa8be1b29	0	ok	0	0
ad5345ce-e3e8-4d50-ae5d-5beac8dfd4fe	27d549b6-d74f-4008-a059-83c3e530171f	9f2beabc-2da0-4a15-9a98-5192ddbe714b	0	ok	2	2
4326d7c7-67f5-429c-8d65-cee03abf32ab	27d549b6-d74f-4008-a059-83c3e530171f	8890477e-792f-4ccc-bfa4-efa5d19cbba3	1	missing	1	1
7dc200a9-56c2-43b2-ad6c-edbfa1a49b92	27d549b6-d74f-4008-a059-83c3e530171f	0cf6ae53-d9ae-4269-ac96-f19b8dbdbcb2	0	ok	0	0
981cb4f3-53e7-47d7-90ab-e88f95f59712	27d549b6-d74f-4008-a059-83c3e530171f	4bee824c-e816-4b4a-9027-7c6cb4e495da	0	ok	4	4
\.


--
-- TOC entry 3633 (class 0 OID 38035)
-- Dependencies: 229
-- Data for Name: CreditNote; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."CreditNote" (id, "creditNoteNumber", "issuedAt", "partnerName", "partnerBulstat", "partnerMol", "partnerAddress", "preparedBy", products, "totalValue", "vatBase", "vatAmount", "paymentMethod", "invoiceId", "partnerCity", "partnerCountry", "refundId") FROM stdin;
\.


--
-- TOC entry 3641 (class 0 OID 38096)
-- Dependencies: 237
-- Data for Name: Import; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Import" (id, "userId", "standId", "storageId", "fileName", "createdAt") FROM stdin;
649eef68-9a28-4128-9384-858d920bedeb	74a1cd5c-8ae8-40c4-b117-c7530a461026	\N	ab9a3b7d-5cfd-4d1e-94f3-f1ce655854b4	Мобилен склад.xml	2025-08-01 14:11:40.58
11fe0393-77af-43ef-874f-a50e234466b5	74a1cd5c-8ae8-40c4-b117-c7530a461026	73e62de1-16b3-4025-aa1c-d08eb91e0b54	\N	Верде XO.xml	2025-08-01 14:13:24.982
2eb00f2b-bfc4-4962-b576-f64d367b887a	74a1cd5c-8ae8-40c4-b117-c7530a461026	48ddc9fc-b2da-4efa-a1ab-89b261ed4c22	\N	Енев ХО.xml	2025-08-01 14:13:40.42
09a349ae-3817-41c0-abf2-057cfcada423	74a1cd5c-8ae8-40c4-b117-c7530a461026	722957e4-24b4-4fef-a9de-eb3dfddadb3f	\N	Килера ХО.xml	2025-08-01 14:14:03.775
6311a4ba-7b2e-4f72-98e0-08f970285791	74a1cd5c-8ae8-40c4-b117-c7530a461026	90b3cae4-e222-4463-aa5a-2bdfdbee08e8	\N	Хаско XO.xml	2025-08-01 14:14:52.707
5ae98337-f780-4d45-88fe-b3d2f3404efb	74a1cd5c-8ae8-40c4-b117-c7530a461026	158bf47a-1079-4ecb-b58d-0e5c88e05588	\N	Хаско Басеус.xml	2025-08-01 14:15:26.172
3058e91c-c4e3-49e9-9861-d5a62134bdb5	74a1cd5c-8ae8-40c4-b117-c7530a461026	\N	6b5f66af-bd69-492f-8ee3-5ca726b5b8cc	524769.xml	2025-08-07 08:30:50.184
0193e70a-1660-4e46-adb7-9a8442df8693	74a1cd5c-8ae8-40c4-b117-c7530a461026	\N	6b5f66af-bd69-492f-8ee3-5ca726b5b8cc	524770.xml	2025-08-07 08:31:52.458
5e946da4-c505-44ff-931f-0aee4a7efbaa	74a1cd5c-8ae8-40c4-b117-c7530a461026	2f25fae7-08eb-4216-824c-c89be08bbd88	\N	524916.xml	2025-08-07 13:56:26.396
ee4ccb33-e6c6-4c97-95c2-bc95605c3883	74a1cd5c-8ae8-40c4-b117-c7530a461026	4f976fe5-ee51-4942-a437-a8e5d27fcee5	\N	ГРАНДЕ 15 ЕООД.xml	2025-08-08 08:33:22.873
583eb23e-7495-40a6-95d5-d574bdecc370	74a1cd5c-8ae8-40c4-b117-c7530a461026	0e6710a8-51ef-40c1-aedb-b39eff5db3ff	\N	524945.xml	2025-08-11 06:01:28.578
82baa98c-9032-4b79-bc27-67dac7f06e6b	74a1cd5c-8ae8-40c4-b117-c7530a461026	\N	ab9a3b7d-5cfd-4d1e-94f3-f1ce655854b4	525230.xml	2025-08-11 07:17:39.697
72aab9d5-4334-4e9c-a6f4-18965878f850	74a1cd5c-8ae8-40c4-b117-c7530a461026	024c0bb9-769a-4ba3-8a6b-adf8eadb9886	\N	520735-new.xml	2025-08-11 10:49:50.907
c1f7893b-c842-4adc-aab7-0140c0cd52d9	74a1cd5c-8ae8-40c4-b117-c7530a461026	\N	6b5f66af-bd69-492f-8ee3-5ca726b5b8cc	525572.xml	2025-08-12 07:12:20.379
7758cfab-b25c-40e8-9bdc-75253d20296d	74a1cd5c-8ae8-40c4-b117-c7530a461026	\N	6b5f66af-bd69-492f-8ee3-5ca726b5b8cc	5255721.xml	2025-08-12 08:30:12.563
81962ffe-cf15-48d1-8a1a-af3bc90ace5f	74a1cd5c-8ae8-40c4-b117-c7530a461026	\N	6b5f66af-bd69-492f-8ee3-5ca726b5b8cc	525609.xml	2025-08-12 08:33:31.03
545bb8e7-a5d1-43d1-b8a8-559d69230e17	74a1cd5c-8ae8-40c4-b117-c7530a461026	\N	6b5f66af-bd69-492f-8ee3-5ca726b5b8cc	5256091.xml	2025-08-12 09:40:12.688
27c7dc5b-291a-4007-8d4d-84ad67b82de9	74a1cd5c-8ae8-40c4-b117-c7530a461026	73e62de1-16b3-4025-aa1c-d08eb91e0b54	\N	52560911.xml	2025-08-12 09:42:50.439
c0c1ac7d-5997-4dcc-ba96-c21a7d46c645	74a1cd5c-8ae8-40c4-b117-c7530a461026	b2355503-10ba-4b46-9e64-1f8ed51a6012	\N	523628.xml	2025-08-13 07:36:39.179
\.


--
-- TOC entry 3642 (class 0 OID 39001)
-- Dependencies: 238
-- Data for Name: ImportProduct; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."ImportProduct" (id, "importId", "productId", quantity) FROM stdin;
78f745b3-3d63-4cc5-bf01-b5ad1f24ba16	649eef68-9a28-4128-9384-858d920bedeb	9fac21e5-a8bc-4204-bb35-7dde2cc211e9	12
6250d620-27a0-4dfc-b9a9-a07e9ecd6c22	649eef68-9a28-4128-9384-858d920bedeb	fd6d75ec-ec9d-45b2-a7d8-e61240070374	12
e8904173-0071-448d-af97-5c936b941ae0	649eef68-9a28-4128-9384-858d920bedeb	2b052187-883e-43a4-bed1-523771b663e0	12
7dd13670-3575-4c2e-a217-0ed585638773	649eef68-9a28-4128-9384-858d920bedeb	2b5872eb-4998-4d04-a96d-338e6e4d9165	6
38b9bf0a-cc6c-41a5-8b37-739fb63ea3b5	649eef68-9a28-4128-9384-858d920bedeb	f62e9a15-d8a7-4781-a2fc-6df46b37e381	4
ff0516c7-b104-47fb-b4aa-fa49cc9c4f16	649eef68-9a28-4128-9384-858d920bedeb	9e5e6bce-ec92-4ed8-ba16-b8c2e3b60fe4	8
1aa8db32-f442-482e-8ac0-c40a9313c11c	649eef68-9a28-4128-9384-858d920bedeb	9f2beabc-2da0-4a15-9a98-5192ddbe714b	4
20b4f593-333a-4808-a39c-f535c7488f77	649eef68-9a28-4128-9384-858d920bedeb	8890477e-792f-4ccc-bfa4-efa5d19cbba3	4
df5afc16-d56d-44cd-961a-69da5cfb8884	649eef68-9a28-4128-9384-858d920bedeb	e00843fb-fedb-434a-ae73-f9d8e554151e	12
2d4b9e87-a0c9-47ab-84bd-8cf064c3da5f	649eef68-9a28-4128-9384-858d920bedeb	c747c326-8331-4ec4-b19a-ee3912f4bbec	4
9dce8c3b-d89e-4679-b43c-2314ec761995	649eef68-9a28-4128-9384-858d920bedeb	5b685926-58cb-49cb-a629-c5238a00740a	4
b704fb5d-dd4d-46b2-9ea5-30668af24802	649eef68-9a28-4128-9384-858d920bedeb	1cea990b-852a-41cc-9216-fa3e3006f2d6	10
81dd90b4-9308-4613-9f76-bbba9f8703ff	649eef68-9a28-4128-9384-858d920bedeb	3c29b236-58cf-4201-a171-4750ee76a5c5	11
ee74db3a-d516-4981-9f17-bbf5710cbe38	649eef68-9a28-4128-9384-858d920bedeb	e3685b83-25e1-4679-a9d0-5fcaa8be1b29	5
1d41402b-a67f-46c9-a052-19f8a6cd897d	649eef68-9a28-4128-9384-858d920bedeb	0cf6ae53-d9ae-4269-ac96-f19b8dbdbcb2	7
271f5893-eee1-46cb-85b8-ba5a522a2f11	649eef68-9a28-4128-9384-858d920bedeb	4ff4bc90-9ec6-4ef8-b00b-0ea0346642f3	2
f760423c-b0a1-41a6-aa0a-55c4a8322863	649eef68-9a28-4128-9384-858d920bedeb	fab4c8b8-6e83-431c-b784-ad3346759365	17
d2cdce7f-5ca2-4773-9f02-759b6ac72dcb	649eef68-9a28-4128-9384-858d920bedeb	51c9a455-1506-4887-ae1d-0f775899174d	16
54d941b3-573a-4db3-9a15-38d33b26a63e	649eef68-9a28-4128-9384-858d920bedeb	080e1bc6-2e5b-485b-a369-99b53586eda3	4
67f23a4b-0a28-445c-a5d7-f7536b2d42a8	649eef68-9a28-4128-9384-858d920bedeb	806b7339-7303-414d-8966-d49f02fa804f	5
03941c71-39b6-4f62-8051-89739625cb38	649eef68-9a28-4128-9384-858d920bedeb	0dccea72-e417-4381-b430-0854dc98fd2b	3
86ab96e0-fc29-4e40-bee2-ea8b19ede3db	649eef68-9a28-4128-9384-858d920bedeb	3d61be70-f89f-4d27-8b49-1ae3ab2a802c	1
7a449e02-1391-4d95-90e2-77ca612c8e26	649eef68-9a28-4128-9384-858d920bedeb	cc9be182-5d90-4abf-9976-823b4e61cd33	15
16169eb7-3a46-40f6-a3b2-62bc4140c11a	649eef68-9a28-4128-9384-858d920bedeb	9fdde592-74f0-466a-b65b-51c73a356c4f	4
c941b875-46c5-46e4-8749-05d94b458825	649eef68-9a28-4128-9384-858d920bedeb	294ca3f1-937d-4efa-aa8c-864c644fe24b	11
eaab25f8-d096-4eb7-b5b9-34e8afdbca5e	649eef68-9a28-4128-9384-858d920bedeb	51c5fbd4-d14c-4297-8ee6-32da2fbf65de	7
c803ea10-76f7-4744-ae6c-bd86890854e7	649eef68-9a28-4128-9384-858d920bedeb	6c2bd3f8-a725-4c6a-bc96-487b8512f477	5
e747cdc2-a2e7-4b10-940b-b6b8f533a1ef	649eef68-9a28-4128-9384-858d920bedeb	4bee824c-e816-4b4a-9027-7c6cb4e495da	8
061a9875-bfa9-460c-b464-45822263a5a8	11fe0393-77af-43ef-874f-a50e234466b5	9fdde592-74f0-466a-b65b-51c73a356c4f	0
4e3948fc-58d7-426b-b1f1-f208eef31b43	11fe0393-77af-43ef-874f-a50e234466b5	51c5fbd4-d14c-4297-8ee6-32da2fbf65de	0
9d34d469-f23b-4f0a-97e2-40bd6ade48a3	11fe0393-77af-43ef-874f-a50e234466b5	9fac21e5-a8bc-4204-bb35-7dde2cc211e9	6
114ca960-326c-4862-8e3e-1dd2ce185f4b	11fe0393-77af-43ef-874f-a50e234466b5	fd6d75ec-ec9d-45b2-a7d8-e61240070374	6
3df0144e-5700-4959-9502-139ed8afc971	11fe0393-77af-43ef-874f-a50e234466b5	2b052187-883e-43a4-bed1-523771b663e0	6
b560266f-40df-44ba-a817-cab766bde5e1	11fe0393-77af-43ef-874f-a50e234466b5	e00843fb-fedb-434a-ae73-f9d8e554151e	0
f348264a-1fc6-4fbd-ab5e-33b603badb0e	11fe0393-77af-43ef-874f-a50e234466b5	3c29b236-58cf-4201-a171-4750ee76a5c5	0
5bab7d1b-b9d3-4fb8-a701-963d227bb7b0	11fe0393-77af-43ef-874f-a50e234466b5	2b5872eb-4998-4d04-a96d-338e6e4d9165	3
fda4c33f-f696-4373-9bdf-6433b91cf4ac	11fe0393-77af-43ef-874f-a50e234466b5	f62e9a15-d8a7-4781-a2fc-6df46b37e381	2
fc8fd59c-1f7f-409b-988a-a3488e7b7e3a	11fe0393-77af-43ef-874f-a50e234466b5	1cea990b-852a-41cc-9216-fa3e3006f2d6	0
987755b3-6dbf-41ae-b9ec-e6df87c67f05	11fe0393-77af-43ef-874f-a50e234466b5	5b685926-58cb-49cb-a629-c5238a00740a	0
d4683497-10c6-41c3-b002-6592c759b4aa	11fe0393-77af-43ef-874f-a50e234466b5	c747c326-8331-4ec4-b19a-ee3912f4bbec	0
47dff5bd-33a0-4061-83f4-b247ef4d09b1	11fe0393-77af-43ef-874f-a50e234466b5	4ff4bc90-9ec6-4ef8-b00b-0ea0346642f3	0
cbe9c975-9ed1-491a-badb-6097dc523358	11fe0393-77af-43ef-874f-a50e234466b5	1fe347d2-0396-4f21-89e0-5a7bb19f3756	0
f6ed6e12-c816-4b72-a05d-e6a1eb69296c	11fe0393-77af-43ef-874f-a50e234466b5	e3685b83-25e1-4679-a9d0-5fcaa8be1b29	0
45b4badc-5dd3-4b06-b6a4-5ff6545952c0	11fe0393-77af-43ef-874f-a50e234466b5	0cf6ae53-d9ae-4269-ac96-f19b8dbdbcb2	0
76260e79-dfb7-434b-bef4-d539af9f41a2	11fe0393-77af-43ef-874f-a50e234466b5	9e5e6bce-ec92-4ed8-ba16-b8c2e3b60fe4	4
73587377-2fa0-44d8-8776-6c1d99dab947	11fe0393-77af-43ef-874f-a50e234466b5	9f2beabc-2da0-4a15-9a98-5192ddbe714b	2
0d1ef0fe-f788-4c34-a57d-eb0fd8cd389d	11fe0393-77af-43ef-874f-a50e234466b5	8890477e-792f-4ccc-bfa4-efa5d19cbba3	2
4a052674-6ac6-4f37-a998-1f7c0fbeddf6	11fe0393-77af-43ef-874f-a50e234466b5	4bee824c-e816-4b4a-9027-7c6cb4e495da	4
13eacd1e-b9ca-45db-8947-eae0f6ab37b8	11fe0393-77af-43ef-874f-a50e234466b5	3d61be70-f89f-4d27-8b49-1ae3ab2a802c	0
2144d31a-37ca-40e7-a335-f47fd678eca7	11fe0393-77af-43ef-874f-a50e234466b5	0dccea72-e417-4381-b430-0854dc98fd2b	0
35e56b22-c6ab-4f9c-807a-e20943699683	11fe0393-77af-43ef-874f-a50e234466b5	6c2bd3f8-a725-4c6a-bc96-487b8512f477	0
5b412923-d003-4dda-8cd5-0063eb8ceddc	11fe0393-77af-43ef-874f-a50e234466b5	080e1bc6-2e5b-485b-a369-99b53586eda3	0
73c6a635-8257-4731-91d3-ca2d8fce4a24	11fe0393-77af-43ef-874f-a50e234466b5	806b7339-7303-414d-8966-d49f02fa804f	0
cf454138-2bed-4cae-8d4c-7009bf3b44e4	11fe0393-77af-43ef-874f-a50e234466b5	fab4c8b8-6e83-431c-b784-ad3346759365	0
9abfc698-5367-40b7-916d-7ef24803d236	11fe0393-77af-43ef-874f-a50e234466b5	51c9a455-1506-4887-ae1d-0f775899174d	0
3f8b17bf-446e-4937-a4f2-7364a2981dba	11fe0393-77af-43ef-874f-a50e234466b5	294ca3f1-937d-4efa-aa8c-864c644fe24b	0
61ff6717-5a9e-41a0-94ef-952708b52201	11fe0393-77af-43ef-874f-a50e234466b5	cc9be182-5d90-4abf-9976-823b4e61cd33	0
44b3f8df-341e-4041-84df-0a7eb55278aa	2eb00f2b-bfc4-4962-b576-f64d367b887a	9fac21e5-a8bc-4204-bb35-7dde2cc211e9	6
285b341e-1d06-4798-92b7-9c3cb323db2d	2eb00f2b-bfc4-4962-b576-f64d367b887a	fd6d75ec-ec9d-45b2-a7d8-e61240070374	6
c712be56-6c5a-4ab7-90d3-9dfe81f8043d	2eb00f2b-bfc4-4962-b576-f64d367b887a	e00843fb-fedb-434a-ae73-f9d8e554151e	8
425140e0-5c65-4723-834e-63b635533155	2eb00f2b-bfc4-4962-b576-f64d367b887a	2b052187-883e-43a4-bed1-523771b663e0	6
4c1eaf66-c493-4764-bf0f-4bedc097ce83	2eb00f2b-bfc4-4962-b576-f64d367b887a	3c29b236-58cf-4201-a171-4750ee76a5c5	6
fd58dc0f-3911-4581-aa08-568793dd8aaf	2eb00f2b-bfc4-4962-b576-f64d367b887a	1cea990b-852a-41cc-9216-fa3e3006f2d6	6
73bfd80a-ba59-4384-9822-c5d165f634a8	2eb00f2b-bfc4-4962-b576-f64d367b887a	3d61be70-f89f-4d27-8b49-1ae3ab2a802c	3
a5fea58d-c24d-4fb6-a68d-2c2da4c71f95	2eb00f2b-bfc4-4962-b576-f64d367b887a	5b685926-58cb-49cb-a629-c5238a00740a	3
7ef6885e-4ae1-4509-83fb-4bbf776b70eb	2eb00f2b-bfc4-4962-b576-f64d367b887a	c747c326-8331-4ec4-b19a-ee3912f4bbec	3
771d16cd-395f-4e71-8bd6-23344eab30c4	2eb00f2b-bfc4-4962-b576-f64d367b887a	2b5872eb-4998-4d04-a96d-338e6e4d9165	3
4a9d3518-9b7b-4c83-9cff-690a756fc3b7	2eb00f2b-bfc4-4962-b576-f64d367b887a	4ff4bc90-9ec6-4ef8-b00b-0ea0346642f3	2
872e2ae6-4e28-40ac-8a40-0d901cc205b3	2eb00f2b-bfc4-4962-b576-f64d367b887a	f62e9a15-d8a7-4781-a2fc-6df46b37e381	2
0977eddb-88e5-481a-b58b-54eba203ab6e	2eb00f2b-bfc4-4962-b576-f64d367b887a	6c2bd3f8-a725-4c6a-bc96-487b8512f477	3
e8ab4628-b02c-4db6-8821-09b195fe45e7	2eb00f2b-bfc4-4962-b576-f64d367b887a	080e1bc6-2e5b-485b-a369-99b53586eda3	3
0afe6c14-86a4-49d3-af0e-748d4ca53a82	2eb00f2b-bfc4-4962-b576-f64d367b887a	806b7339-7303-414d-8966-d49f02fa804f	1
cb44cac3-fa1e-4794-a29d-2b063ceba03f	2eb00f2b-bfc4-4962-b576-f64d367b887a	fab4c8b8-6e83-431c-b784-ad3346759365	9
c4075e16-7c64-4b79-b77c-3d76e8647dd1	2eb00f2b-bfc4-4962-b576-f64d367b887a	51c9a455-1506-4887-ae1d-0f775899174d	9
c188a56c-a173-409e-8e25-e85eab41dcd4	2eb00f2b-bfc4-4962-b576-f64d367b887a	cc9be182-5d90-4abf-9976-823b4e61cd33	8
dd7094e9-ad27-463c-9dd4-437997e44993	2eb00f2b-bfc4-4962-b576-f64d367b887a	9fdde592-74f0-466a-b65b-51c73a356c4f	4
da6e97bd-6a18-4071-98a2-746899a9897b	2eb00f2b-bfc4-4962-b576-f64d367b887a	51c5fbd4-d14c-4297-8ee6-32da2fbf65de	4
18065aef-601a-4452-ae84-5df0e93d751f	2eb00f2b-bfc4-4962-b576-f64d367b887a	9e5e6bce-ec92-4ed8-ba16-b8c2e3b60fe4	4
2cdab401-354b-4b35-afdf-35e9e4be0776	2eb00f2b-bfc4-4962-b576-f64d367b887a	e3685b83-25e1-4679-a9d0-5fcaa8be1b29	4
543a6cbb-4b6f-4ec0-abb4-33ac58cbab8c	2eb00f2b-bfc4-4962-b576-f64d367b887a	9f2beabc-2da0-4a15-9a98-5192ddbe714b	2
014149e5-e342-4fba-b655-94f958d5fcaf	2eb00f2b-bfc4-4962-b576-f64d367b887a	8890477e-792f-4ccc-bfa4-efa5d19cbba3	2
804af37c-e3f2-42dd-af67-ddc72966c1b0	2eb00f2b-bfc4-4962-b576-f64d367b887a	0cf6ae53-d9ae-4269-ac96-f19b8dbdbcb2	4
575c30bd-e529-459d-bfd5-b5dcda81aa24	2eb00f2b-bfc4-4962-b576-f64d367b887a	4bee824c-e816-4b4a-9027-7c6cb4e495da	4
6131505f-6ff9-4820-b233-38a6a67f7931	2eb00f2b-bfc4-4962-b576-f64d367b887a	294ca3f1-937d-4efa-aa8c-864c644fe24b	4
d094c495-43e3-4e84-a221-cbeedb8b5a28	09a349ae-3817-41c0-abf2-057cfcada423	9fac21e5-a8bc-4204-bb35-7dde2cc211e9	6
32e9c29b-5ecc-4652-977c-ea09d8887160	09a349ae-3817-41c0-abf2-057cfcada423	fd6d75ec-ec9d-45b2-a7d8-e61240070374	6
6aa51d0e-3f9e-40da-8120-ff16fc066382	09a349ae-3817-41c0-abf2-057cfcada423	e00843fb-fedb-434a-ae73-f9d8e554151e	8
707689d2-b274-49e2-b26d-70e27ea400a3	09a349ae-3817-41c0-abf2-057cfcada423	2b052187-883e-43a4-bed1-523771b663e0	6
9896fa2b-b169-4b74-b102-cb83a7e08373	09a349ae-3817-41c0-abf2-057cfcada423	3c29b236-58cf-4201-a171-4750ee76a5c5	6
87c1ea8a-9ce1-4d20-8378-c728ab45ae5f	09a349ae-3817-41c0-abf2-057cfcada423	1cea990b-852a-41cc-9216-fa3e3006f2d6	6
837c3868-9a96-466e-8d93-b071e22a1fb2	09a349ae-3817-41c0-abf2-057cfcada423	3d61be70-f89f-4d27-8b49-1ae3ab2a802c	1
0d62e3f3-7acb-4bff-b342-69e2521ccf41	09a349ae-3817-41c0-abf2-057cfcada423	0dccea72-e417-4381-b430-0854dc98fd2b	2
914813ba-42f4-4f3f-a8e9-b567ce5d4e3b	09a349ae-3817-41c0-abf2-057cfcada423	5b685926-58cb-49cb-a629-c5238a00740a	3
3b2189cb-c3ac-4584-9471-37fa879e67ff	09a349ae-3817-41c0-abf2-057cfcada423	c747c326-8331-4ec4-b19a-ee3912f4bbec	3
8bd28e46-73fd-4f44-aa49-9ece39a83a2b	09a349ae-3817-41c0-abf2-057cfcada423	2b5872eb-4998-4d04-a96d-338e6e4d9165	3
0c681a5c-eba2-479d-930f-99d5023ca208	09a349ae-3817-41c0-abf2-057cfcada423	4ff4bc90-9ec6-4ef8-b00b-0ea0346642f3	2
812050cd-2963-447f-8ce0-271ec9c88f82	09a349ae-3817-41c0-abf2-057cfcada423	f62e9a15-d8a7-4781-a2fc-6df46b37e381	2
b7647bf8-b131-4f3f-ae9e-62ef469e74ed	09a349ae-3817-41c0-abf2-057cfcada423	6c2bd3f8-a725-4c6a-bc96-487b8512f477	3
90987ce2-d57d-4c27-9b99-22cfc0825fa1	09a349ae-3817-41c0-abf2-057cfcada423	080e1bc6-2e5b-485b-a369-99b53586eda3	3
e0a61863-010a-417c-9b9d-25422b9eb306	09a349ae-3817-41c0-abf2-057cfcada423	806b7339-7303-414d-8966-d49f02fa804f	1
a3db427d-ed80-4623-8df5-17faa8e23de0	09a349ae-3817-41c0-abf2-057cfcada423	fab4c8b8-6e83-431c-b784-ad3346759365	9
872b1d46-eacf-4f57-90f0-9c79566125df	09a349ae-3817-41c0-abf2-057cfcada423	51c9a455-1506-4887-ae1d-0f775899174d	9
87bc2ca3-607c-4d2b-996d-211c2d10db36	09a349ae-3817-41c0-abf2-057cfcada423	e1d608d8-f769-4ef7-bae8-5b48aa46f832	4
e6784019-7169-4149-bb14-50a555043c62	09a349ae-3817-41c0-abf2-057cfcada423	cc9be182-5d90-4abf-9976-823b4e61cd33	4
8e3b2306-e546-4ed1-bdf2-222e73fcbe0e	09a349ae-3817-41c0-abf2-057cfcada423	1fe347d2-0396-4f21-89e0-5a7bb19f3756	4
5fda5ca4-0649-4307-a5d5-af9dcb89fedc	09a349ae-3817-41c0-abf2-057cfcada423	9fdde592-74f0-466a-b65b-51c73a356c4f	4
5c8a4b67-cecc-4a86-a1b7-d12221baf61a	09a349ae-3817-41c0-abf2-057cfcada423	51c5fbd4-d14c-4297-8ee6-32da2fbf65de	4
a4c5dbae-6e96-43ef-a04d-d43d26bdb92b	09a349ae-3817-41c0-abf2-057cfcada423	9e5e6bce-ec92-4ed8-ba16-b8c2e3b60fe4	4
509bda11-c997-40ba-97ff-c40a0e346ef1	09a349ae-3817-41c0-abf2-057cfcada423	e3685b83-25e1-4679-a9d0-5fcaa8be1b29	4
6e08eb84-cfe8-4cb0-ae60-49f957562cc5	09a349ae-3817-41c0-abf2-057cfcada423	9f2beabc-2da0-4a15-9a98-5192ddbe714b	2
966179c4-b7ab-444c-aebf-78960610db00	09a349ae-3817-41c0-abf2-057cfcada423	8890477e-792f-4ccc-bfa4-efa5d19cbba3	2
a8daeb3a-f8c2-4620-af97-9f95bf32c977	09a349ae-3817-41c0-abf2-057cfcada423	0cf6ae53-d9ae-4269-ac96-f19b8dbdbcb2	4
c17b1400-aeb5-4998-9057-53eb70d7082d	09a349ae-3817-41c0-abf2-057cfcada423	4bee824c-e816-4b4a-9027-7c6cb4e495da	4
93f75ca1-6594-49cd-b205-e969147914f7	6311a4ba-7b2e-4f72-98e0-08f970285791	05f013ba-9ba8-465b-a9e9-4fa68f95f009	1
6ec5d2ab-e810-4d5c-99d5-3a6a6f90a21c	6311a4ba-7b2e-4f72-98e0-08f970285791	0e7eb525-b5e0-443d-81e9-1e8a0c59ca11	5
3dc2fab4-f5c9-497f-9145-7ec6486c3b0e	6311a4ba-7b2e-4f72-98e0-08f970285791	0db8a4ea-09fa-4f1f-99f4-b17a3b2e24ad	3
3a587b39-f67b-4c4e-b867-115a2a1c4369	6311a4ba-7b2e-4f72-98e0-08f970285791	ac5b9720-e600-41ec-b0ce-e7108feb387d	2
a198ccec-7797-408b-8b8a-990303264831	6311a4ba-7b2e-4f72-98e0-08f970285791	d0e59e48-079d-442a-920d-ca5b5741b66f	2
7c4fd08c-1e2b-4a8b-9536-99f4a6fcd560	6311a4ba-7b2e-4f72-98e0-08f970285791	1fe347d2-0396-4f21-89e0-5a7bb19f3756	4
2457f8df-894c-4052-ac85-9f49cf414380	6311a4ba-7b2e-4f72-98e0-08f970285791	c17ea773-f608-4bb6-a71f-d41ee7ea3882	4
cad77c79-25f3-4f74-8e7e-a9fc319ba6a2	6311a4ba-7b2e-4f72-98e0-08f970285791	427d7f32-a75f-440e-adf0-f96201d0bc5b	2
2987aaad-e7e6-4ef3-ae4a-f7ee2df3d990	6311a4ba-7b2e-4f72-98e0-08f970285791	93b1106e-24ce-4df3-8df8-ba4d21013a0a	4
a7608a48-7a0c-4106-90dc-3b45de2687ff	6311a4ba-7b2e-4f72-98e0-08f970285791	43487f82-6bad-489c-b0a4-dc03cd5a5e8d	3
27dee45d-2877-46af-953a-a21319fbc67f	6311a4ba-7b2e-4f72-98e0-08f970285791	9993ceda-cbff-467e-ba33-c9ec45cc4545	2
0557d2fa-5b3f-4799-afeb-aa0b1270fc96	6311a4ba-7b2e-4f72-98e0-08f970285791	9014815a-340b-4092-88ea-208e3c3a5e49	4
5178dbdc-5174-4ad8-969e-1ee966c590ca	6311a4ba-7b2e-4f72-98e0-08f970285791	0e4a534f-44ff-4008-863a-a3bbd336fc93	1
397c6f09-a6ae-4c45-a467-57ce2dc6b2af	6311a4ba-7b2e-4f72-98e0-08f970285791	8d75a2da-c502-444e-a242-297fe3497d10	2
1bc56de1-e4b3-47c1-a2e4-d060646c10d0	6311a4ba-7b2e-4f72-98e0-08f970285791	be2a2b08-621e-41b8-8d55-0d68cc8d4445	4
935d80d9-d728-4f41-ab9f-a537f1071eb8	6311a4ba-7b2e-4f72-98e0-08f970285791	294ca3f1-937d-4efa-aa8c-864c644fe24b	3
4a102565-a76c-42c6-acf4-dd7e676ddbe4	6311a4ba-7b2e-4f72-98e0-08f970285791	4edfafe5-16d2-4b03-b375-f771eec43ebe	2
b2c342ff-1cd4-407d-85bc-809c76c5e62b	6311a4ba-7b2e-4f72-98e0-08f970285791	daf2f120-5608-4f62-a056-45249b1cc0f4	0
2d4c9db7-374d-4e7d-ad77-959b598aeb03	6311a4ba-7b2e-4f72-98e0-08f970285791	fd6d75ec-ec9d-45b2-a7d8-e61240070374	4
c4fa5874-be47-4642-b3e8-f5d54b7e366f	6311a4ba-7b2e-4f72-98e0-08f970285791	06e735dc-80bf-40c6-ac32-f8e8235350a4	3
abaa8465-13e6-4e6b-8646-34f6a40ef209	6311a4ba-7b2e-4f72-98e0-08f970285791	cc9be182-5d90-4abf-9976-823b4e61cd33	4
48b16dbd-425c-4aaa-b784-2f126fac5c5d	6311a4ba-7b2e-4f72-98e0-08f970285791	9e5e6bce-ec92-4ed8-ba16-b8c2e3b60fe4	4
e2a3a8c4-2a61-495a-8a05-5c0353422cb2	6311a4ba-7b2e-4f72-98e0-08f970285791	57090686-76e3-4ef8-83fb-e9f27c159566	1
a00f4aac-bf18-48be-837c-16eadad10ad4	6311a4ba-7b2e-4f72-98e0-08f970285791	bb855a25-83cd-4164-a896-0c417609d1a0	2
abdb5ca4-b6dd-4edc-92a0-7f28eebc733b	6311a4ba-7b2e-4f72-98e0-08f970285791	7ef35b0c-e2f2-4d87-b9d9-c9a29703b129	0
8d18d8e7-f1b0-4071-b357-4e7a14509adf	6311a4ba-7b2e-4f72-98e0-08f970285791	3c47788d-21bc-4263-a1f0-a062a6e51a9b	3
480c56db-4e61-40cf-bb85-d7472a85f77f	6311a4ba-7b2e-4f72-98e0-08f970285791	a8707b5a-a41c-4bc8-a0fe-c823c45ab014	3
7846eca1-06cd-442a-b5e5-8fe771c1d835	6311a4ba-7b2e-4f72-98e0-08f970285791	210351fc-7e9c-42ef-923d-8226fc8d2911	0
5b0c4328-49a0-46ca-b8c6-9e5687f44e0b	6311a4ba-7b2e-4f72-98e0-08f970285791	8def029f-c4b6-4e44-bbd8-24a3798eaf46	4
6b46016a-a924-4e6b-af17-7b1019de574a	6311a4ba-7b2e-4f72-98e0-08f970285791	4ee3536c-5f11-49e4-aa4c-f8a786a7b990	6
323e54e8-6bfa-45e9-92fe-14c875c5644a	6311a4ba-7b2e-4f72-98e0-08f970285791	0bbc5bd9-7485-4ca7-90bc-98b4fc4a7d43	3
90692527-b4bb-439d-9f67-a70fbf88f8ed	6311a4ba-7b2e-4f72-98e0-08f970285791	e69c6728-01d9-4d07-8561-3d967b0f3594	3
0a25b9e6-5004-41a3-ae86-86a6524a38fa	6311a4ba-7b2e-4f72-98e0-08f970285791	eb2a677a-a7d0-41a4-b985-ff96a3788362	4
3566c694-b001-41cc-94dd-6428cec9b98e	6311a4ba-7b2e-4f72-98e0-08f970285791	7d469886-3b4c-4ac7-8062-d42330c9c8d7	2
62b4f1ea-8e22-4fb8-8c0d-3f80792011f7	6311a4ba-7b2e-4f72-98e0-08f970285791	09473aa4-91ba-4ac6-b421-0131b27668f4	3
04d1fff0-8770-4b1c-b7cf-2fcc75d5ba0e	6311a4ba-7b2e-4f72-98e0-08f970285791	8c5d3590-8de1-49eb-852b-5b00a2d95d65	2
7fd54818-99ed-4dff-8a29-ec8cb4eb2825	6311a4ba-7b2e-4f72-98e0-08f970285791	92864630-c64f-4863-8a36-c2b51ea035e8	2
2f5db857-5eea-44c9-a833-ba722d0f8bd4	6311a4ba-7b2e-4f72-98e0-08f970285791	80d5432b-878d-4b40-abef-ca31f83db88c	2
fd559172-4246-4147-92b6-893d749f1556	5ae98337-f780-4d45-88fe-b3d2f3404efb	b8c7adc6-a08b-43cf-8caa-7c29c42f9f1a	3
6554bfa9-ccaa-46b7-bf20-d0e638ed1227	5ae98337-f780-4d45-88fe-b3d2f3404efb	c54f156c-8483-4b77-9745-04661d47e82f	1
7dc3054a-8fb9-4ca6-8e10-19f7543a1ab9	5ae98337-f780-4d45-88fe-b3d2f3404efb	85e801eb-c962-423d-a7ce-02bf518a18ed	3
f8d9f7e8-e402-4e3f-842f-c4a84a94df5b	5ae98337-f780-4d45-88fe-b3d2f3404efb	57121c57-0f01-4c92-afe3-26ae0d30c968	2
805a9a05-1ea7-4ac9-9fc2-78e8a793cb13	5ae98337-f780-4d45-88fe-b3d2f3404efb	fe9db831-2d58-4511-af1f-926092ba02e2	1
8c1115ad-0de5-41de-91af-059f2b0a74f7	5ae98337-f780-4d45-88fe-b3d2f3404efb	8fdc320a-d74d-4760-8743-31ae9ddba850	1
dfeeb4a8-7a7b-48d0-a758-a807ee8d1fb3	5ae98337-f780-4d45-88fe-b3d2f3404efb	6ba14854-edaa-4b99-bbfe-8ab18842cfd7	2
bcf5f103-964f-49e1-aa9e-a8d476aa33b8	5ae98337-f780-4d45-88fe-b3d2f3404efb	a2f70fa6-9483-4535-ad27-fd9c0864098e	2
21fadf5f-29cd-490a-afb2-25a8fe130550	5ae98337-f780-4d45-88fe-b3d2f3404efb	7b85853e-d909-413e-8c27-9003ca34f047	2
260094b6-ef2f-404c-9163-57e207035163	5ae98337-f780-4d45-88fe-b3d2f3404efb	f030fd91-27fd-442b-8853-d7fd2e926f5a	3
4721b537-00cf-47f0-b2d8-c9027a8b1c45	5ae98337-f780-4d45-88fe-b3d2f3404efb	c24fab55-98f3-4bc3-85af-1b820fd61bdb	4
958b1fda-d1f2-43aa-8036-27a8074ca592	5ae98337-f780-4d45-88fe-b3d2f3404efb	42acfe5b-87a9-4ec5-a5ee-6ed12b788a99	2
9327373b-ed78-4a82-93f3-22854637bf01	5ae98337-f780-4d45-88fe-b3d2f3404efb	ab733dec-baaa-479e-9583-2cf13c7131ec	2
9c124d7e-90a9-4512-b87f-77fbd1f0de8f	5ae98337-f780-4d45-88fe-b3d2f3404efb	83f830e9-5f80-4dce-a5ce-254247e5d736	3
4d3a03e8-73bd-4e41-a5d6-957f312b196c	5ae98337-f780-4d45-88fe-b3d2f3404efb	99b64b5b-93e5-4ae1-bbd0-f02b709c82b6	4
fe54383d-81e2-49b5-99cc-e7aceac1dcfa	5ae98337-f780-4d45-88fe-b3d2f3404efb	d376a251-cfa6-4aee-af3d-3c14f5098704	4
59793b00-22f4-4e58-be0e-dafe510d94e0	5ae98337-f780-4d45-88fe-b3d2f3404efb	ae504b55-4776-4560-b106-febe842d47b7	2
5d1ac8bd-068c-4c32-8857-06770cdf0cc7	5ae98337-f780-4d45-88fe-b3d2f3404efb	56ace9b9-6f96-4d5e-bba7-70f04c7c2681	3
cbaa5fe4-6372-4b11-be5f-7f96c3b17ed6	5ae98337-f780-4d45-88fe-b3d2f3404efb	ba3b4d18-4a3a-42ff-ba3a-f4e64e162978	3
b7247139-eb22-41d1-bf09-2f1926fec9b1	5ae98337-f780-4d45-88fe-b3d2f3404efb	109d7a24-8924-4c07-9e00-f83363fc21d3	5
7573857a-2fd1-403e-abc0-c171374a3313	5ae98337-f780-4d45-88fe-b3d2f3404efb	deee6c6c-b5d4-47ee-b253-86beaa0ff763	3
75457eeb-f567-45c8-98e5-da33a9c52014	5ae98337-f780-4d45-88fe-b3d2f3404efb	53ea0278-453f-4df0-9272-7e55da9b5ecb	3
b8f5925a-4027-4323-bf49-2a06b35e55d2	5ae98337-f780-4d45-88fe-b3d2f3404efb	1af30ab3-53c1-4a69-9649-4e5f8935087b	4
7d79b57f-3f16-4e8a-9e85-307ed706a73e	5ae98337-f780-4d45-88fe-b3d2f3404efb	9dca60ee-f6a5-4910-84f2-9b504dc7601d	2
b494298d-2632-467e-9858-aa011af93b02	5ae98337-f780-4d45-88fe-b3d2f3404efb	aee4c76b-b63e-4f5b-89f2-04a1111de40d	2
e92708be-ee3c-45b3-8c89-9494da885e1b	5ae98337-f780-4d45-88fe-b3d2f3404efb	fd2ecaf7-e2ad-4906-9571-0820eaf39fd4	0
9d272266-86fd-4443-8236-ac955043dac7	5ae98337-f780-4d45-88fe-b3d2f3404efb	5f983a66-48aa-4419-8951-33bc52217916	2
82f8d2f6-bdb4-4ba6-a221-c87056189050	5ae98337-f780-4d45-88fe-b3d2f3404efb	17fa3d84-4419-40ef-b7a7-f144387d913c	2
172ac9fa-e216-47b2-aff6-9ca4a8c6a648	5ae98337-f780-4d45-88fe-b3d2f3404efb	32935f08-2ba8-4ed0-9a52-e5cb55848f78	3
6e7b4142-f9be-44e4-907b-e00f91a63b26	5ae98337-f780-4d45-88fe-b3d2f3404efb	00bceb45-abcb-4fef-9851-591f6f7e601d	3
9d869589-a826-475f-8335-68fe78b3743a	5ae98337-f780-4d45-88fe-b3d2f3404efb	3a563d70-1d3b-44ea-aafa-c849430bd9d2	2
acced3c7-d103-40fa-a266-c6fe7fe342a3	5ae98337-f780-4d45-88fe-b3d2f3404efb	83347115-152a-4229-ab10-1a54f258bef1	2
34f2953b-8e79-4519-bf2d-1e9a519c8192	5ae98337-f780-4d45-88fe-b3d2f3404efb	86d79e90-029d-4fdf-96a0-84dc8d5f000a	4
1d02c4d6-949d-4339-b2f5-8bfeea6da932	5ae98337-f780-4d45-88fe-b3d2f3404efb	4caa71b4-3266-4796-bb04-6f1474b67288	4
56f4fdde-3e1a-45b2-b0b9-a77aa319b70b	5ae98337-f780-4d45-88fe-b3d2f3404efb	023384be-4b4b-4b70-9105-b34a33b303a7	3
91a86deb-9349-4436-a102-686b1fa1cb64	5ae98337-f780-4d45-88fe-b3d2f3404efb	c6eacdb6-5f77-49a6-b3f7-3befef4e9881	2
04deaa36-edec-45f0-b546-9d7aee71ab44	3058e91c-c4e3-49e9-9861-d5a62134bdb5	06e735dc-80bf-40c6-ac32-f8e8235350a4	1
1bf8d050-66c5-411a-82fc-27e7a00a2df0	3058e91c-c4e3-49e9-9861-d5a62134bdb5	8c5d3590-8de1-49eb-852b-5b00a2d95d65	2
26016ff9-1d92-449a-8831-255340957031	3058e91c-c4e3-49e9-9861-d5a62134bdb5	3c47788d-21bc-4263-a1f0-a062a6e51a9b	3
9f12ab73-1629-4063-8298-e90386058cb9	3058e91c-c4e3-49e9-9861-d5a62134bdb5	57090686-76e3-4ef8-83fb-e9f27c159566	1
56267425-82e4-4070-a01a-766f69e1379c	3058e91c-c4e3-49e9-9861-d5a62134bdb5	a8707b5a-a41c-4bc8-a0fe-c823c45ab014	1
529b6f6c-2ee0-42b8-9e8d-1dd52ecc42c1	3058e91c-c4e3-49e9-9861-d5a62134bdb5	d0e59e48-079d-442a-920d-ca5b5741b66f	1
b1bbf752-b734-416e-bfd2-71a182bc7c4e	3058e91c-c4e3-49e9-9861-d5a62134bdb5	c17ea773-f608-4bb6-a71f-d41ee7ea3882	1
f6d12369-5b37-40ed-814d-916c0726c612	3058e91c-c4e3-49e9-9861-d5a62134bdb5	294ca3f1-937d-4efa-aa8c-864c644fe24b	2
84d8ec43-a3de-4ad9-90ba-b6004f90370b	3058e91c-c4e3-49e9-9861-d5a62134bdb5	4edfafe5-16d2-4b03-b375-f771eec43ebe	1
ee2fa926-4218-4c4b-90dc-a23496139512	3058e91c-c4e3-49e9-9861-d5a62134bdb5	8def029f-c4b6-4e44-bbd8-24a3798eaf46	1
f7140b6e-78f1-4d67-9a5a-bfb5906ed4e0	3058e91c-c4e3-49e9-9861-d5a62134bdb5	9e5e6bce-ec92-4ed8-ba16-b8c2e3b60fe4	1
a768d47f-d9a0-40fd-8216-b1afb2f26cb5	3058e91c-c4e3-49e9-9861-d5a62134bdb5	eb2a677a-a7d0-41a4-b985-ff96a3788362	3
c433e526-ea66-4794-a023-50ce37305a25	0193e70a-1660-4e46-adb7-9a8442df8693	c6eacdb6-5f77-49a6-b3f7-3befef4e9881	1
cc4a617a-e55e-447c-a7eb-1506872d802f	5e946da4-c505-44ff-931f-0aee4a7efbaa	1e27b1c6-6ac2-4396-ab9f-748c0d1d87da	3
463e12bd-d1bd-47b7-a0ed-2342d978ae76	5e946da4-c505-44ff-931f-0aee4a7efbaa	8ec7d2c3-8387-40a5-9d8d-3884689d4591	3
3fc0fd03-2329-45d9-a3b6-6a475fd8a6a6	5e946da4-c505-44ff-931f-0aee4a7efbaa	4eb84e04-a7d4-4632-b48d-37f155aefbe9	3
6dcf5b19-6f10-494f-8f48-9da12d237aeb	5e946da4-c505-44ff-931f-0aee4a7efbaa	cb879680-3df9-42ab-a917-5866bfa7b144	3
bae77c79-82d2-4cd0-a101-e7285cfcee2d	5e946da4-c505-44ff-931f-0aee4a7efbaa	5681cff4-0d71-4661-941a-4df86ccc102d	3
9f09dafe-e0e3-4a68-a7ba-1fe3ee6de2d0	5e946da4-c505-44ff-931f-0aee4a7efbaa	260618d9-421c-4801-a453-b38f601b95c7	3
5864f0a5-b3fd-4584-a91e-3c6087cb9ea1	5e946da4-c505-44ff-931f-0aee4a7efbaa	1902bd89-bcaf-4e25-9b56-cffaad95854a	6
9168f4a7-0ecc-489b-815d-2f21d474c3de	5e946da4-c505-44ff-931f-0aee4a7efbaa	d44958b7-6c19-4427-a771-3e9eb86a9f48	2
cc9d469d-3414-4e7e-b821-585f0c3fbe0f	5e946da4-c505-44ff-931f-0aee4a7efbaa	ce2807b1-b439-49be-9789-78e2124aee22	2
420ddbdc-adf7-4c8c-a748-4128abc3c06b	5e946da4-c505-44ff-931f-0aee4a7efbaa	4ccd9168-98ae-4077-a18e-8d9d034698fb	9
38290f62-b268-4ae6-95a9-73c132f430b4	5e946da4-c505-44ff-931f-0aee4a7efbaa	fd6d75ec-ec9d-45b2-a7d8-e61240070374	3
d4772834-5517-48de-b4d5-aa93cb57077d	5e946da4-c505-44ff-931f-0aee4a7efbaa	afc437a4-c6e9-48db-91c5-a5d8d34538dd	6
64d3f6d1-3941-4a57-830a-819e919cc4d6	5e946da4-c505-44ff-931f-0aee4a7efbaa	3c29b236-58cf-4201-a171-4750ee76a5c5	3
63133b89-cbcc-4681-91a9-3f05a70929e4	5e946da4-c505-44ff-931f-0aee4a7efbaa	1cea990b-852a-41cc-9216-fa3e3006f2d6	3
c0ccfc15-5888-4a14-a5ba-911ef092b6ff	5e946da4-c505-44ff-931f-0aee4a7efbaa	f25aea89-8505-4835-83a4-a302758e84a2	3
9294a6b0-e5e3-47ed-938c-14e8b0c1ea08	5e946da4-c505-44ff-931f-0aee4a7efbaa	3aa7200b-4758-4416-b145-66cc8bfc51a2	3
4376e6eb-3e67-4ce7-9877-2e8b7f61c400	5e946da4-c505-44ff-931f-0aee4a7efbaa	3d61be70-f89f-4d27-8b49-1ae3ab2a802c	1
b92cd19b-69d5-4265-9ce1-6ea146ac17fd	5e946da4-c505-44ff-931f-0aee4a7efbaa	0dccea72-e417-4381-b430-0854dc98fd2b	2
758e1292-f183-4cd8-b6cf-9c7e81a9b5e8	5e946da4-c505-44ff-931f-0aee4a7efbaa	4ff4bc90-9ec6-4ef8-b00b-0ea0346642f3	2
cdb172ef-de04-42bc-a8b2-f5458cfa31d3	5e946da4-c505-44ff-931f-0aee4a7efbaa	f62e9a15-d8a7-4781-a2fc-6df46b37e381	2
2b222255-06ba-49ab-8f9c-376b8116d222	5e946da4-c505-44ff-931f-0aee4a7efbaa	805955bc-5dde-4b98-85a4-a12e4b72f3bd	3
c7ff0938-5015-4fa3-ba83-4b17ec28f896	5e946da4-c505-44ff-931f-0aee4a7efbaa	fe55be2a-4c99-4d7a-9694-0ca8304b2809	3
d73cc5d6-fefc-4ebd-b906-f1e7584e6fbf	5e946da4-c505-44ff-931f-0aee4a7efbaa	080e1bc6-2e5b-485b-a369-99b53586eda3	3
1db0ff32-c7cc-4510-a70e-85c831f203dd	5e946da4-c505-44ff-931f-0aee4a7efbaa	806b7339-7303-414d-8966-d49f02fa804f	1
c2f0443e-06c4-46f5-a3a7-586ee226ca5a	5e946da4-c505-44ff-931f-0aee4a7efbaa	fab4c8b8-6e83-431c-b784-ad3346759365	3
98ef7522-e1cc-454e-9b1c-e36c4168662b	5e946da4-c505-44ff-931f-0aee4a7efbaa	add2d27e-1dd1-4f88-a897-897b0761003e	3
fba7231c-8abd-4ca9-a3cb-041bf7b104c9	5e946da4-c505-44ff-931f-0aee4a7efbaa	add2d27e-1dd1-4f88-a897-897b0761003e	1
f1deae38-7707-4116-8b75-b9da90f06518	5e946da4-c505-44ff-931f-0aee4a7efbaa	cc9be182-5d90-4abf-9976-823b4e61cd33	6
f86f2e5d-4129-45ac-83fa-cf8c37a27355	5e946da4-c505-44ff-931f-0aee4a7efbaa	cc9be182-5d90-4abf-9976-823b4e61cd33	2
b3dc9895-9d4b-412b-bd62-9bf776a01624	5e946da4-c505-44ff-931f-0aee4a7efbaa	9fdde592-74f0-466a-b65b-51c73a356c4f	4
c787992b-1c5d-48ac-afd8-ef455dd28f98	5e946da4-c505-44ff-931f-0aee4a7efbaa	51c5fbd4-d14c-4297-8ee6-32da2fbf65de	4
bf408c0f-fd49-4164-9309-8e4fda932c0a	5e946da4-c505-44ff-931f-0aee4a7efbaa	ce996f1c-5704-4f6a-8e6b-b407b3bd60c1	3
dd7a7b2d-23f5-41c7-857f-6351e908c914	5e946da4-c505-44ff-931f-0aee4a7efbaa	f25f15a5-b640-4243-9209-7caf329754ff	3
1b0c4d04-80c9-43b9-a2a4-ae00a5518f94	5e946da4-c505-44ff-931f-0aee4a7efbaa	b47b5b58-6aa2-46d4-a375-7f7a794f762c	3
b13f4dea-2468-41c5-b958-1ee7fdc54a4c	5e946da4-c505-44ff-931f-0aee4a7efbaa	788e8ee6-cd6e-4d45-87a1-c62dbec2bd3c	3
d34e4f34-1937-47fe-9b49-7711581497c2	5e946da4-c505-44ff-931f-0aee4a7efbaa	35803093-ba4c-4427-988c-d7fa8b6787e1	2
26601214-197e-41dd-83ad-156ff24b96e1	5e946da4-c505-44ff-931f-0aee4a7efbaa	0cf6ae53-d9ae-4269-ac96-f19b8dbdbcb2	4
25c06f51-c4fb-46bb-b8ad-ba709cab83c0	5e946da4-c505-44ff-931f-0aee4a7efbaa	93b1106e-24ce-4df3-8df8-ba4d21013a0a	2
ba830b01-f8c6-4471-bbde-51231b09270c	5e946da4-c505-44ff-931f-0aee4a7efbaa	32c3ef69-d57b-469b-ac2a-bbf3dec443b5	2
9bf5c1fc-8c15-4b1c-bd5f-5312b43ef67d	ee4ccb33-e6c6-4c97-95c2-bc95605c3883	1e27b1c6-6ac2-4396-ab9f-748c0d1d87da	3
e454870d-9cca-415d-8995-64cbba0cddaa	ee4ccb33-e6c6-4c97-95c2-bc95605c3883	8ec7d2c3-8387-40a5-9d8d-3884689d4591	3
533f8aff-fd0d-41df-9497-4c85de4c0aea	ee4ccb33-e6c6-4c97-95c2-bc95605c3883	4eb84e04-a7d4-4632-b48d-37f155aefbe9	3
f3ee622d-e6da-44b2-8c8c-3ccd62c5797e	ee4ccb33-e6c6-4c97-95c2-bc95605c3883	cb879680-3df9-42ab-a917-5866bfa7b144	3
15177b46-0c06-4a93-9809-aa0ef5bb5131	ee4ccb33-e6c6-4c97-95c2-bc95605c3883	5681cff4-0d71-4661-941a-4df86ccc102d	3
396ab471-aec8-40a3-be8a-730fcd8ec6fe	ee4ccb33-e6c6-4c97-95c2-bc95605c3883	260618d9-421c-4801-a453-b38f601b95c7	3
e00c98e5-437c-4244-be5f-6a9206c8a98f	ee4ccb33-e6c6-4c97-95c2-bc95605c3883	1902bd89-bcaf-4e25-9b56-cffaad95854a	6
e4c5f9ba-0bd0-4bbb-bcd2-55270520455a	ee4ccb33-e6c6-4c97-95c2-bc95605c3883	d44958b7-6c19-4427-a771-3e9eb86a9f48	2
6789c9ab-756f-49b5-88b0-c8b88037e4e9	ee4ccb33-e6c6-4c97-95c2-bc95605c3883	ce2807b1-b439-49be-9789-78e2124aee22	2
cb66a171-5a59-4eb5-a3bc-d36b111e8bbe	ee4ccb33-e6c6-4c97-95c2-bc95605c3883	4ccd9168-98ae-4077-a18e-8d9d034698fb	9
f9c5e1b8-afeb-4412-bc32-8ef6db6a6e25	ee4ccb33-e6c6-4c97-95c2-bc95605c3883	fd6d75ec-ec9d-45b2-a7d8-e61240070374	3
c5408c89-bba4-4492-b4ea-0a181f756ae6	ee4ccb33-e6c6-4c97-95c2-bc95605c3883	afc437a4-c6e9-48db-91c5-a5d8d34538dd	6
6d3f5c81-6344-4fe3-bf16-8f60d8ca1b39	ee4ccb33-e6c6-4c97-95c2-bc95605c3883	3c29b236-58cf-4201-a171-4750ee76a5c5	6
190e690c-74eb-4558-86b5-50f1fff101a6	ee4ccb33-e6c6-4c97-95c2-bc95605c3883	f25aea89-8505-4835-83a4-a302758e84a2	6
bc71a071-8940-4ccd-ba57-7667c88c2c97	ee4ccb33-e6c6-4c97-95c2-bc95605c3883	3d61be70-f89f-4d27-8b49-1ae3ab2a802c	1
bd1c20ef-8360-4270-b4ed-bb8c8aacea77	ee4ccb33-e6c6-4c97-95c2-bc95605c3883	0dccea72-e417-4381-b430-0854dc98fd2b	2
101bf3dc-08c6-4bc9-bb54-755c56a59255	ee4ccb33-e6c6-4c97-95c2-bc95605c3883	4ff4bc90-9ec6-4ef8-b00b-0ea0346642f3	2
d91d0ea5-7437-4d68-a429-e509fcf8a4d5	ee4ccb33-e6c6-4c97-95c2-bc95605c3883	f62e9a15-d8a7-4781-a2fc-6df46b37e381	2
1125331c-d9db-45ac-a6dc-33a31cd81f55	ee4ccb33-e6c6-4c97-95c2-bc95605c3883	805955bc-5dde-4b98-85a4-a12e4b72f3bd	3
56e2acae-5b64-4af7-89c2-81be9806ba1e	ee4ccb33-e6c6-4c97-95c2-bc95605c3883	fe55be2a-4c99-4d7a-9694-0ca8304b2809	3
5508c75c-8fe6-4792-84b9-e72fb6272d57	ee4ccb33-e6c6-4c97-95c2-bc95605c3883	080e1bc6-2e5b-485b-a369-99b53586eda3	3
5ffa0995-8dd7-4bad-988f-eae3c8de2381	ee4ccb33-e6c6-4c97-95c2-bc95605c3883	806b7339-7303-414d-8966-d49f02fa804f	1
cb0261c7-ee6f-4de6-8ac5-b958f89cfc47	ee4ccb33-e6c6-4c97-95c2-bc95605c3883	fab4c8b8-6e83-431c-b784-ad3346759365	3
8f802721-8f2c-4aad-9650-9b66502fdf20	ee4ccb33-e6c6-4c97-95c2-bc95605c3883	add2d27e-1dd1-4f88-a897-897b0761003e	4
1b8016ea-9a68-4e5f-b7bd-abf50f10d7e4	ee4ccb33-e6c6-4c97-95c2-bc95605c3883	cc9be182-5d90-4abf-9976-823b4e61cd33	8
1985ce87-f111-4044-a5fb-2028ef7df86b	ee4ccb33-e6c6-4c97-95c2-bc95605c3883	9fdde592-74f0-466a-b65b-51c73a356c4f	4
91566548-372b-49dd-9290-0375d8dd5273	ee4ccb33-e6c6-4c97-95c2-bc95605c3883	51c5fbd4-d14c-4297-8ee6-32da2fbf65de	4
60fc9852-16fa-4c1c-afe7-1ea653b8c4ee	ee4ccb33-e6c6-4c97-95c2-bc95605c3883	ce996f1c-5704-4f6a-8e6b-b407b3bd60c1	3
65ecab40-4b9e-450a-b322-c37fe002f9fb	ee4ccb33-e6c6-4c97-95c2-bc95605c3883	f25f15a5-b640-4243-9209-7caf329754ff	3
b2eb537d-8565-4b6e-8324-d4c8e27a7df8	ee4ccb33-e6c6-4c97-95c2-bc95605c3883	b47b5b58-6aa2-46d4-a375-7f7a794f762c	3
11fc9123-48ff-4c81-af9d-5058572eaddb	ee4ccb33-e6c6-4c97-95c2-bc95605c3883	788e8ee6-cd6e-4d45-87a1-c62dbec2bd3c	3
f5e1a8d6-f674-4392-abfa-2fc36a601e20	ee4ccb33-e6c6-4c97-95c2-bc95605c3883	35803093-ba4c-4427-988c-d7fa8b6787e1	2
bc756564-0af9-4a56-a8b6-ecf454821e4b	ee4ccb33-e6c6-4c97-95c2-bc95605c3883	0cf6ae53-d9ae-4269-ac96-f19b8dbdbcb2	4
718a796b-46e0-4d7c-87e2-3732647c3570	ee4ccb33-e6c6-4c97-95c2-bc95605c3883	93b1106e-24ce-4df3-8df8-ba4d21013a0a	2
339a90be-712b-49ff-ae3d-904fec5c197f	ee4ccb33-e6c6-4c97-95c2-bc95605c3883	32c3ef69-d57b-469b-ac2a-bbf3dec443b5	2
fee46408-dfc1-4761-aa83-7d784345394f	583eb23e-7495-40a6-95d5-d574bdecc370	1e27b1c6-6ac2-4396-ab9f-748c0d1d87da	3
d00d2b39-c0c8-4af2-b360-fd3981137453	583eb23e-7495-40a6-95d5-d574bdecc370	8ec7d2c3-8387-40a5-9d8d-3884689d4591	3
eac451e0-9dac-4210-99a4-a8f01e872b64	583eb23e-7495-40a6-95d5-d574bdecc370	4eb84e04-a7d4-4632-b48d-37f155aefbe9	3
627a4c37-0825-45a8-a1fa-ecccff79e5cc	583eb23e-7495-40a6-95d5-d574bdecc370	cb879680-3df9-42ab-a917-5866bfa7b144	3
5179f212-7082-496c-9d82-d275467655f7	583eb23e-7495-40a6-95d5-d574bdecc370	5681cff4-0d71-4661-941a-4df86ccc102d	3
905e1c39-42df-4d99-aa8c-e9468f2fbb41	583eb23e-7495-40a6-95d5-d574bdecc370	260618d9-421c-4801-a453-b38f601b95c7	3
30518dfd-c6dc-4829-a953-26f68d9dec97	583eb23e-7495-40a6-95d5-d574bdecc370	1902bd89-bcaf-4e25-9b56-cffaad95854a	6
6ccf873c-91c1-4bcc-8240-f8c9014372f9	583eb23e-7495-40a6-95d5-d574bdecc370	d44958b7-6c19-4427-a771-3e9eb86a9f48	2
8920aaa1-43b3-4ae7-9e92-7be91b51adf5	583eb23e-7495-40a6-95d5-d574bdecc370	ce2807b1-b439-49be-9789-78e2124aee22	2
b1e6493a-8d7b-4783-8c10-ad46e6ad2dbc	583eb23e-7495-40a6-95d5-d574bdecc370	4ccd9168-98ae-4077-a18e-8d9d034698fb	9
d1205b1d-ab81-4bb7-a763-206849968448	583eb23e-7495-40a6-95d5-d574bdecc370	fd6d75ec-ec9d-45b2-a7d8-e61240070374	3
de719fd8-e2ed-4f48-8a4c-272b1e0cdf51	583eb23e-7495-40a6-95d5-d574bdecc370	afc437a4-c6e9-48db-91c5-a5d8d34538dd	6
0291d5db-aa79-4951-8b14-8f17e37ea8eb	583eb23e-7495-40a6-95d5-d574bdecc370	3c29b236-58cf-4201-a171-4750ee76a5c5	6
470ca657-8f06-4a12-b303-cad3f3fbe3fe	583eb23e-7495-40a6-95d5-d574bdecc370	f25aea89-8505-4835-83a4-a302758e84a2	6
ba63e71d-67fc-40a0-badb-553c8f944188	583eb23e-7495-40a6-95d5-d574bdecc370	3d61be70-f89f-4d27-8b49-1ae3ab2a802c	1
6a87a313-ce62-4a3e-b7cb-6b5173861331	583eb23e-7495-40a6-95d5-d574bdecc370	0dccea72-e417-4381-b430-0854dc98fd2b	2
f2e26a6c-a01f-410b-ae90-6748b731784a	583eb23e-7495-40a6-95d5-d574bdecc370	4ff4bc90-9ec6-4ef8-b00b-0ea0346642f3	2
494b7cd5-67f9-452a-81fb-2d079edb9a09	583eb23e-7495-40a6-95d5-d574bdecc370	f62e9a15-d8a7-4781-a2fc-6df46b37e381	2
f96d4636-74a1-4a59-bb62-ba821af89dca	583eb23e-7495-40a6-95d5-d574bdecc370	805955bc-5dde-4b98-85a4-a12e4b72f3bd	3
d7707989-716f-4183-afe9-34e0756213f1	583eb23e-7495-40a6-95d5-d574bdecc370	fe55be2a-4c99-4d7a-9694-0ca8304b2809	3
bad09fc0-bc59-4e0b-928c-6feb4315938b	583eb23e-7495-40a6-95d5-d574bdecc370	080e1bc6-2e5b-485b-a369-99b53586eda3	3
ec3631fa-cc19-4a43-ba9b-3342cdfb69cf	583eb23e-7495-40a6-95d5-d574bdecc370	806b7339-7303-414d-8966-d49f02fa804f	1
b471600a-43ef-4c18-8f7c-82e3e1c84865	583eb23e-7495-40a6-95d5-d574bdecc370	fab4c8b8-6e83-431c-b784-ad3346759365	3
00dc8add-0298-4d83-b443-e2019058db1b	583eb23e-7495-40a6-95d5-d574bdecc370	add2d27e-1dd1-4f88-a897-897b0761003e	4
219208c0-cc12-4428-b5ec-ea69b2c8e8c2	583eb23e-7495-40a6-95d5-d574bdecc370	cc9be182-5d90-4abf-9976-823b4e61cd33	8
2d7c62f8-c4fb-49e2-94be-1fe3ef6a6893	583eb23e-7495-40a6-95d5-d574bdecc370	9fdde592-74f0-466a-b65b-51c73a356c4f	4
958c8fda-708d-4234-9cf7-7434055aade7	583eb23e-7495-40a6-95d5-d574bdecc370	51c5fbd4-d14c-4297-8ee6-32da2fbf65de	4
c59f4883-f746-43bb-b8f7-6c342249b712	583eb23e-7495-40a6-95d5-d574bdecc370	ce996f1c-5704-4f6a-8e6b-b407b3bd60c1	3
8a12e6f2-2f68-4605-a8d4-e541037f11e6	583eb23e-7495-40a6-95d5-d574bdecc370	f25f15a5-b640-4243-9209-7caf329754ff	3
812fcde1-6bf8-45cc-ac7b-f56ff1ee92fb	583eb23e-7495-40a6-95d5-d574bdecc370	b47b5b58-6aa2-46d4-a375-7f7a794f762c	3
88acb341-7d7b-42b5-88f0-6751f1a59e4c	583eb23e-7495-40a6-95d5-d574bdecc370	788e8ee6-cd6e-4d45-87a1-c62dbec2bd3c	3
06db69b6-0099-4c97-98c9-655a9538f495	583eb23e-7495-40a6-95d5-d574bdecc370	35803093-ba4c-4427-988c-d7fa8b6787e1	2
543568c8-ac74-4a1e-8cfc-bf8106486ef3	583eb23e-7495-40a6-95d5-d574bdecc370	0cf6ae53-d9ae-4269-ac96-f19b8dbdbcb2	4
b6869ed5-df4d-4c64-bc65-3281a3cc6882	583eb23e-7495-40a6-95d5-d574bdecc370	93b1106e-24ce-4df3-8df8-ba4d21013a0a	2
92d5cef1-95f8-49e3-b4fe-867d9849bc8b	583eb23e-7495-40a6-95d5-d574bdecc370	32c3ef69-d57b-469b-ac2a-bbf3dec443b5	2
3e802bc1-c61e-4af7-9b5d-3647d8969ae0	82baa98c-9032-4b79-bc27-67dac7f06e6b	5681cff4-0d71-4661-941a-4df86ccc102d	5
54a83897-02a3-4524-bc7e-9cd045848b94	82baa98c-9032-4b79-bc27-67dac7f06e6b	260618d9-421c-4801-a453-b38f601b95c7	5
255dc712-cb4b-4ddf-9cf5-08b13f5b6bdb	82baa98c-9032-4b79-bc27-67dac7f06e6b	1902bd89-bcaf-4e25-9b56-cffaad95854a	5
923f25a1-0dba-496f-a87a-1192f728cd12	82baa98c-9032-4b79-bc27-67dac7f06e6b	d44958b7-6c19-4427-a771-3e9eb86a9f48	2
5be678a5-d7c8-4b37-9c11-83f62e08e659	82baa98c-9032-4b79-bc27-67dac7f06e6b	ce2807b1-b439-49be-9789-78e2124aee22	2
b489d128-5ca8-47ca-910c-b09e746a760c	82baa98c-9032-4b79-bc27-67dac7f06e6b	afc437a4-c6e9-48db-91c5-a5d8d34538dd	6
36c7960a-0a59-4eb7-8f52-d5d9a0f6eb1e	82baa98c-9032-4b79-bc27-67dac7f06e6b	3c29b236-58cf-4201-a171-4750ee76a5c5	1
4054958f-f001-4f32-8973-1e5ebf1ee718	82baa98c-9032-4b79-bc27-67dac7f06e6b	1cea990b-852a-41cc-9216-fa3e3006f2d6	2
ddcde24b-ae15-4e82-af5d-d13ad68baca3	82baa98c-9032-4b79-bc27-67dac7f06e6b	3d61be70-f89f-4d27-8b49-1ae3ab2a802c	1
9c4a6499-42b1-4804-842c-0023c98e1105	82baa98c-9032-4b79-bc27-67dac7f06e6b	0dccea72-e417-4381-b430-0854dc98fd2b	1
f88124ba-c3c4-4d72-990c-bed7adcdee0a	82baa98c-9032-4b79-bc27-67dac7f06e6b	5b685926-58cb-49cb-a629-c5238a00740a	1
03d92799-ec96-4724-ab35-8428d003c83e	82baa98c-9032-4b79-bc27-67dac7f06e6b	c747c326-8331-4ec4-b19a-ee3912f4bbec	1
ceac7d62-99b4-4439-9620-0376854cb8ec	82baa98c-9032-4b79-bc27-67dac7f06e6b	4ff4bc90-9ec6-4ef8-b00b-0ea0346642f3	2
26fd26fc-81a8-46fd-abb2-3d3a6761d3d7	82baa98c-9032-4b79-bc27-67dac7f06e6b	6c2bd3f8-a725-4c6a-bc96-487b8512f477	1
dc72c458-0225-49cf-bdc3-347f64bbdf87	82baa98c-9032-4b79-bc27-67dac7f06e6b	080e1bc6-2e5b-485b-a369-99b53586eda3	2
6addb785-dc46-4100-9a41-32d4d8c822d4	82baa98c-9032-4b79-bc27-67dac7f06e6b	806b7339-7303-414d-8966-d49f02fa804f	2
b4ed1bf6-8dc5-47f1-9cce-535104179fd1	82baa98c-9032-4b79-bc27-67dac7f06e6b	fab4c8b8-6e83-431c-b784-ad3346759365	1
0cd3280a-a81a-462e-8310-bf4da11f3ea4	82baa98c-9032-4b79-bc27-67dac7f06e6b	51c9a455-1506-4887-ae1d-0f775899174d	1
fe2d0a07-278e-4c48-bb13-c2711441ed4f	82baa98c-9032-4b79-bc27-67dac7f06e6b	51c9a455-1506-4887-ae1d-0f775899174d	2
4d4c11fb-e6e3-4994-8e2b-c0c162933e98	82baa98c-9032-4b79-bc27-67dac7f06e6b	294ca3f1-937d-4efa-aa8c-864c644fe24b	1
bcaf7f09-470f-4eae-8099-a8824c340435	82baa98c-9032-4b79-bc27-67dac7f06e6b	294ca3f1-937d-4efa-aa8c-864c644fe24b	1
c8c3c21d-0241-45c4-8842-20e503ddf219	82baa98c-9032-4b79-bc27-67dac7f06e6b	cc9be182-5d90-4abf-9976-823b4e61cd33	1
bafab173-df5d-48c5-a841-533eda4cf36d	82baa98c-9032-4b79-bc27-67dac7f06e6b	9fdde592-74f0-466a-b65b-51c73a356c4f	1
7352580a-9a94-4d90-96f3-670d2ad913c8	82baa98c-9032-4b79-bc27-67dac7f06e6b	51c5fbd4-d14c-4297-8ee6-32da2fbf65de	1
1064bd1a-eefc-4b20-816c-f4e7f9c884de	82baa98c-9032-4b79-bc27-67dac7f06e6b	e3685b83-25e1-4679-a9d0-5fcaa8be1b29	3
6e71d12d-7df1-4281-8712-32eec239168a	82baa98c-9032-4b79-bc27-67dac7f06e6b	0cf6ae53-d9ae-4269-ac96-f19b8dbdbcb2	1
160c4d5a-c3a6-423a-9e75-9bfd512a10b8	72aab9d5-4334-4e9c-a6f4-18965878f850	9fac21e5-a8bc-4204-bb35-7dde2cc211e9	6
33d4dd75-3f45-4822-8b0f-58965327b975	72aab9d5-4334-4e9c-a6f4-18965878f850	fd6d75ec-ec9d-45b2-a7d8-e61240070374	6
b673f30f-5b8c-44da-b4fb-16a3e0728d16	72aab9d5-4334-4e9c-a6f4-18965878f850	e00843fb-fedb-434a-ae73-f9d8e554151e	8
9927ab9d-4767-442b-aa41-da1f67aae51c	72aab9d5-4334-4e9c-a6f4-18965878f850	2b052187-883e-43a4-bed1-523771b663e0	6
b48c2059-b4c0-4b8b-a3f1-aedcdd0b2618	72aab9d5-4334-4e9c-a6f4-18965878f850	3c29b236-58cf-4201-a171-4750ee76a5c5	6
1b19ce00-b473-4d7b-a941-fd23fbf91715	72aab9d5-4334-4e9c-a6f4-18965878f850	1cea990b-852a-41cc-9216-fa3e3006f2d6	6
ba34ac47-c131-4c57-950f-376db279cb69	72aab9d5-4334-4e9c-a6f4-18965878f850	3d61be70-f89f-4d27-8b49-1ae3ab2a802c	1
410ff8c7-07d5-4cdd-9aff-3a53aabaeb2a	72aab9d5-4334-4e9c-a6f4-18965878f850	0dccea72-e417-4381-b430-0854dc98fd2b	2
60a5881a-e47f-45c1-a5f8-83c6c89e68ec	72aab9d5-4334-4e9c-a6f4-18965878f850	5b685926-58cb-49cb-a629-c5238a00740a	3
9ae3c45b-56e9-4af2-ae75-554ecaf0f9fd	72aab9d5-4334-4e9c-a6f4-18965878f850	c747c326-8331-4ec4-b19a-ee3912f4bbec	3
fdcfb5ec-450a-4c36-af0d-c52ee220c0fe	72aab9d5-4334-4e9c-a6f4-18965878f850	2b5872eb-4998-4d04-a96d-338e6e4d9165	3
482af665-eb38-4877-a532-4d83f65afebc	72aab9d5-4334-4e9c-a6f4-18965878f850	4ff4bc90-9ec6-4ef8-b00b-0ea0346642f3	2
eb173fb7-d06b-4109-ae0b-59370fb2cd9b	72aab9d5-4334-4e9c-a6f4-18965878f850	f62e9a15-d8a7-4781-a2fc-6df46b37e381	2
7a675f62-7cbd-4c67-8f16-2fd576ebd3d7	72aab9d5-4334-4e9c-a6f4-18965878f850	6c2bd3f8-a725-4c6a-bc96-487b8512f477	3
5e08708f-6867-4a6c-8000-1353619f3087	72aab9d5-4334-4e9c-a6f4-18965878f850	080e1bc6-2e5b-485b-a369-99b53586eda3	3
509a8d01-4ab7-4be4-8005-f9e1a709dddd	72aab9d5-4334-4e9c-a6f4-18965878f850	806b7339-7303-414d-8966-d49f02fa804f	1
ef90fbe0-2d06-4fd6-8b3b-c3047d0e38b4	72aab9d5-4334-4e9c-a6f4-18965878f850	fab4c8b8-6e83-431c-b784-ad3346759365	9
39450121-9338-4a1c-ae6a-8a5eabcbdb31	72aab9d5-4334-4e9c-a6f4-18965878f850	51c9a455-1506-4887-ae1d-0f775899174d	9
1a066f08-5875-4d8c-ac72-ae49c40c5dbc	72aab9d5-4334-4e9c-a6f4-18965878f850	294ca3f1-937d-4efa-aa8c-864c644fe24b	4
6375c23a-c81b-4c81-ba47-eebebcfde3e0	72aab9d5-4334-4e9c-a6f4-18965878f850	cc9be182-5d90-4abf-9976-823b4e61cd33	4
fcddcdf3-04bc-4a3d-b080-d34166d0120d	72aab9d5-4334-4e9c-a6f4-18965878f850	1fe347d2-0396-4f21-89e0-5a7bb19f3756	4
a7ddf998-96b1-458a-b98e-8d344f098f6e	72aab9d5-4334-4e9c-a6f4-18965878f850	9fdde592-74f0-466a-b65b-51c73a356c4f	4
e967968d-2366-4faf-be04-d66a00d55023	72aab9d5-4334-4e9c-a6f4-18965878f850	51c5fbd4-d14c-4297-8ee6-32da2fbf65de	4
77067786-437f-46f2-9334-882446227323	72aab9d5-4334-4e9c-a6f4-18965878f850	9e5e6bce-ec92-4ed8-ba16-b8c2e3b60fe4	4
d7a9a7fa-7374-4519-975c-e6079f15d441	72aab9d5-4334-4e9c-a6f4-18965878f850	e3685b83-25e1-4679-a9d0-5fcaa8be1b29	4
c765e431-1910-4626-abab-e7d9109d1c5f	72aab9d5-4334-4e9c-a6f4-18965878f850	9f2beabc-2da0-4a15-9a98-5192ddbe714b	2
efcce37a-b375-4c82-b01c-28316762475f	72aab9d5-4334-4e9c-a6f4-18965878f850	8890477e-792f-4ccc-bfa4-efa5d19cbba3	2
81aac487-ac3a-4b1e-ac66-e4ba3b8ebb4d	72aab9d5-4334-4e9c-a6f4-18965878f850	0cf6ae53-d9ae-4269-ac96-f19b8dbdbcb2	4
378601b7-1bdd-447f-9884-0e0026b8899a	72aab9d5-4334-4e9c-a6f4-18965878f850	4bee824c-e816-4b4a-9027-7c6cb4e495da	4
3bf5dab3-4360-46d9-a165-fd889bfb68ee	c1f7893b-c842-4adc-aab7-0140c0cd52d9	8890477e-792f-4ccc-bfa4-efa5d19cbba3	1
4403f9a1-b466-4707-9012-707fe427475e	7758cfab-b25c-40e8-9bdc-75253d20296d	8890477e-792f-4ccc-bfa4-efa5d19cbba3	1
597d6360-6cc5-4eed-8009-1ab207cf3732	81962ffe-cf15-48d1-8a1a-af3bc90ace5f	8890477e-792f-4ccc-bfa4-efa5d19cbba3	3
f282cd71-c2a2-41ce-aa69-eb7e8163e66a	545bb8e7-a5d1-43d1-b8a8-559d69230e17	8890477e-792f-4ccc-bfa4-efa5d19cbba3	3
aae29ca6-2784-4118-abd4-58391d41b706	27c7dc5b-291a-4007-8d4d-84ad67b82de9	8890477e-792f-4ccc-bfa4-efa5d19cbba3	3
74183b5c-036f-458f-9fd8-9262cd403962	c0c1ac7d-5997-4dcc-ba96-c21a7d46c645	bad109cb-d782-461d-8e7a-323df5b02c78	17
c4ff09db-aa31-4a6a-8b70-d77c1ae88d9c	c0c1ac7d-5997-4dcc-ba96-c21a7d46c645	c7a6c45e-4a7a-4f2e-92da-1855938f9ffd	10
a1f4ecd5-5d2d-4861-89ec-a0aad0bfd839	c0c1ac7d-5997-4dcc-ba96-c21a7d46c645	92457660-b3be-4cd7-bfec-9bcc6c014972	10
56c39817-d791-4277-8ac8-0ed17bb96696	c0c1ac7d-5997-4dcc-ba96-c21a7d46c645	2c6940a2-09a5-4dc0-b333-32e55797a54e	26
c4cbeb3f-11c3-4f9b-85af-7529e0d20429	c0c1ac7d-5997-4dcc-ba96-c21a7d46c645	ae377a03-a318-482a-8fda-c11e579ae794	15
94e16de9-2010-4ab4-93e4-15e09a9bab34	c0c1ac7d-5997-4dcc-ba96-c21a7d46c645	f5241d62-3222-456c-8ebf-1df6a42a0936	12
\.


--
-- TOC entry 3632 (class 0 OID 38026)
-- Dependencies: 228
-- Data for Name: Invoice; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Invoice" (id, "invoiceNumber", "issuedAt", "partnerName", "partnerBulstat", "partnerMol", "partnerAddress", "preparedBy", products, "totalValue", "vatBase", "vatAmount", "paymentMethod", "revisionNumber", "partnerCity", "partnerCountry") FROM stdin;
\.


--
-- TOC entry 3629 (class 0 OID 38004)
-- Dependencies: 225
-- Data for Name: MissingProduct; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."MissingProduct" (id, "revisionId", "productId", "missingQuantity", "priceAtSale", "givenQuantity") FROM stdin;
03724017-d58c-496a-82e9-855b4fc40681	5513f69f-a6d1-4fea-9a06-31d5ced3fa9f	9fac21e5-a8bc-4204-bb35-7dde2cc211e9	12	7.4	\N
be94ca6b-3783-4b7f-899e-545d73672ba8	5513f69f-a6d1-4fea-9a06-31d5ced3fa9f	fd6d75ec-ec9d-45b2-a7d8-e61240070374	12	5.4	\N
1b3392e8-e305-49f0-b8a3-900f341c9772	5513f69f-a6d1-4fea-9a06-31d5ced3fa9f	2b052187-883e-43a4-bed1-523771b663e0	12	10.2	\N
4533e15e-78f3-4e91-8aa9-f313797b4182	5513f69f-a6d1-4fea-9a06-31d5ced3fa9f	2b5872eb-4998-4d04-a96d-338e6e4d9165	6	5.2	\N
077666ca-cc0d-4027-b72e-fa39ad0e3e63	5513f69f-a6d1-4fea-9a06-31d5ced3fa9f	f62e9a15-d8a7-4781-a2fc-6df46b37e381	4	11.5	\N
d2d5bc76-e64f-4c2d-8d3f-e2ce507d6509	5513f69f-a6d1-4fea-9a06-31d5ced3fa9f	9e5e6bce-ec92-4ed8-ba16-b8c2e3b60fe4	8	7.8	\N
1ee0034d-61af-4e6a-b50c-85da513a4c24	5513f69f-a6d1-4fea-9a06-31d5ced3fa9f	9f2beabc-2da0-4a15-9a98-5192ddbe714b	4	10.02	\N
52fc2e7a-9e7c-4d9a-9475-96e995281c22	5513f69f-a6d1-4fea-9a06-31d5ced3fa9f	8890477e-792f-4ccc-bfa4-efa5d19cbba3	4	15.8	\N
2567efbd-0216-41c2-a4eb-077d604ea00c	5513f69f-a6d1-4fea-9a06-31d5ced3fa9f	e00843fb-fedb-434a-ae73-f9d8e554151e	12	4.2	\N
d7e08344-008c-4b5c-82ce-da044dbe4c77	5513f69f-a6d1-4fea-9a06-31d5ced3fa9f	c747c326-8331-4ec4-b19a-ee3912f4bbec	4	5.2	\N
6c635fd5-c69a-4e40-a255-a588866922b0	5513f69f-a6d1-4fea-9a06-31d5ced3fa9f	5b685926-58cb-49cb-a629-c5238a00740a	4	5.2	\N
78832ece-d334-4b0b-9a00-35b7f8ee79a9	5513f69f-a6d1-4fea-9a06-31d5ced3fa9f	1cea990b-852a-41cc-9216-fa3e3006f2d6	10	12.5	\N
e501b1ff-ccf5-45b6-a4df-22efa4363906	5513f69f-a6d1-4fea-9a06-31d5ced3fa9f	3c29b236-58cf-4201-a171-4750ee76a5c5	11	12.5	\N
084f6c53-399e-40ce-a710-931b4c07923d	5513f69f-a6d1-4fea-9a06-31d5ced3fa9f	e3685b83-25e1-4679-a9d0-5fcaa8be1b29	5	4.9	\N
b354b117-8dee-4903-883a-5c909ffa89a5	5513f69f-a6d1-4fea-9a06-31d5ced3fa9f	0cf6ae53-d9ae-4269-ac96-f19b8dbdbcb2	7	4.9	\N
05097f64-adcf-4e8c-9ead-8aad4e03e907	5513f69f-a6d1-4fea-9a06-31d5ced3fa9f	4ff4bc90-9ec6-4ef8-b00b-0ea0346642f3	2	13.2	\N
357c188d-65e4-41c0-8701-bac501b6cb31	5513f69f-a6d1-4fea-9a06-31d5ced3fa9f	fab4c8b8-6e83-431c-b784-ad3346759365	17	5.6	\N
9b7cd25b-b019-4bd8-88db-43f715fe6f35	5513f69f-a6d1-4fea-9a06-31d5ced3fa9f	51c9a455-1506-4887-ae1d-0f775899174d	16	4.6	\N
3f676d92-5c96-451d-82f6-1e5bc082519b	5513f69f-a6d1-4fea-9a06-31d5ced3fa9f	080e1bc6-2e5b-485b-a369-99b53586eda3	4	4.8	\N
4d05287b-329a-418b-98c3-22ca3c3542b6	5513f69f-a6d1-4fea-9a06-31d5ced3fa9f	806b7339-7303-414d-8966-d49f02fa804f	5	4.8	\N
81a9185d-e3fd-4950-8f89-c737ca7f49f4	5513f69f-a6d1-4fea-9a06-31d5ced3fa9f	0dccea72-e417-4381-b430-0854dc98fd2b	3	8.6	\N
b0fae175-46e3-4f5c-bcac-4b16b5babada	5513f69f-a6d1-4fea-9a06-31d5ced3fa9f	3d61be70-f89f-4d27-8b49-1ae3ab2a802c	1	8.6	\N
b395bb8e-83cb-4ee5-b628-d1d100f653f3	5513f69f-a6d1-4fea-9a06-31d5ced3fa9f	cc9be182-5d90-4abf-9976-823b4e61cd33	15	1.8	\N
8af9cbba-a245-4341-82f2-8590f67f7b61	5513f69f-a6d1-4fea-9a06-31d5ced3fa9f	9fdde592-74f0-466a-b65b-51c73a356c4f	4	2	\N
9911849f-ab08-4843-89c2-0ff8887c899e	5513f69f-a6d1-4fea-9a06-31d5ced3fa9f	294ca3f1-937d-4efa-aa8c-864c644fe24b	11	1.8	\N
fe5b8562-649c-4e68-94ad-6ad6683a1061	5513f69f-a6d1-4fea-9a06-31d5ced3fa9f	51c5fbd4-d14c-4297-8ee6-32da2fbf65de	7	2	\N
ed0dd865-aea9-4f25-bda3-583dcc6f1dfa	5513f69f-a6d1-4fea-9a06-31d5ced3fa9f	6c2bd3f8-a725-4c6a-bc96-487b8512f477	5	3.8	\N
001175c4-6aae-451f-a35f-a29b709f9849	5513f69f-a6d1-4fea-9a06-31d5ced3fa9f	4bee824c-e816-4b4a-9027-7c6cb4e495da	8	4.5	\N
f9564eb7-1607-4721-aea6-e0fe4f6481a1	e2e85fb2-1a29-4b83-882c-e591377be0d7	9fdde592-74f0-466a-b65b-51c73a356c4f	0	2	\N
8adcb820-cd37-459a-9649-a4adf59f2820	e2e85fb2-1a29-4b83-882c-e591377be0d7	51c5fbd4-d14c-4297-8ee6-32da2fbf65de	0	2	\N
b274b709-ad97-4a27-9671-0372392ac6a4	e2e85fb2-1a29-4b83-882c-e591377be0d7	9fac21e5-a8bc-4204-bb35-7dde2cc211e9	6	7.4	\N
54e0c847-a875-444f-884e-7a931f390980	e2e85fb2-1a29-4b83-882c-e591377be0d7	fd6d75ec-ec9d-45b2-a7d8-e61240070374	6	5.4	\N
76f69d2a-1899-416a-853d-16ea8c14f646	e2e85fb2-1a29-4b83-882c-e591377be0d7	2b052187-883e-43a4-bed1-523771b663e0	6	10.2	\N
8102012b-9ec1-4e88-bbbd-6e86744b6587	e2e85fb2-1a29-4b83-882c-e591377be0d7	e00843fb-fedb-434a-ae73-f9d8e554151e	0	4.2	\N
ccfd6d4c-decb-4607-82fb-4a82112274de	e2e85fb2-1a29-4b83-882c-e591377be0d7	3c29b236-58cf-4201-a171-4750ee76a5c5	0	12.5	\N
ae1151e0-37a5-484b-8a5d-8e08e3016737	e2e85fb2-1a29-4b83-882c-e591377be0d7	2b5872eb-4998-4d04-a96d-338e6e4d9165	3	5.2	\N
d636b37c-90d4-4cbe-b32b-8f73ae4726c7	e2e85fb2-1a29-4b83-882c-e591377be0d7	f62e9a15-d8a7-4781-a2fc-6df46b37e381	2	11.5	\N
82e77f7a-4531-40f5-a71e-508e1f8111e9	e2e85fb2-1a29-4b83-882c-e591377be0d7	1cea990b-852a-41cc-9216-fa3e3006f2d6	0	12.5	\N
21a077a7-92e6-4f12-99cf-af7b8f454ef3	e2e85fb2-1a29-4b83-882c-e591377be0d7	5b685926-58cb-49cb-a629-c5238a00740a	0	5.2	\N
edab6c9d-a0c0-4d5b-9523-f7563fe2aa88	e2e85fb2-1a29-4b83-882c-e591377be0d7	c747c326-8331-4ec4-b19a-ee3912f4bbec	0	5.2	\N
398e2270-22dd-4db7-9a81-ec3223964365	e2e85fb2-1a29-4b83-882c-e591377be0d7	4ff4bc90-9ec6-4ef8-b00b-0ea0346642f3	0	13.2	\N
44bfc285-63d7-4735-a6e4-0623b78c6360	e2e85fb2-1a29-4b83-882c-e591377be0d7	1fe347d2-0396-4f21-89e0-5a7bb19f3756	0	1.8	\N
c5579d50-6240-480a-9614-ef2534b740d9	e2e85fb2-1a29-4b83-882c-e591377be0d7	e3685b83-25e1-4679-a9d0-5fcaa8be1b29	0	4.9	\N
2bb8b3a4-7f1b-448e-b7fb-93415cfd0c0d	e2e85fb2-1a29-4b83-882c-e591377be0d7	0cf6ae53-d9ae-4269-ac96-f19b8dbdbcb2	0	4.9	\N
af9aa738-3d61-482b-8d03-ecc2dc4c2cbd	e2e85fb2-1a29-4b83-882c-e591377be0d7	9e5e6bce-ec92-4ed8-ba16-b8c2e3b60fe4	4	7.8	\N
ceea7cf6-2a60-4e6d-ac87-3785cef6a1f3	e2e85fb2-1a29-4b83-882c-e591377be0d7	9f2beabc-2da0-4a15-9a98-5192ddbe714b	2	10.02	\N
5bb49fc2-2eb4-412e-ade2-48b9d8f32276	e2e85fb2-1a29-4b83-882c-e591377be0d7	8890477e-792f-4ccc-bfa4-efa5d19cbba3	2	15.8	\N
e2ccd954-70b1-4221-9a6f-b3759fa191cf	e2e85fb2-1a29-4b83-882c-e591377be0d7	4bee824c-e816-4b4a-9027-7c6cb4e495da	4	4.5	\N
803d3700-1766-43d1-b814-5f7801939f00	e2e85fb2-1a29-4b83-882c-e591377be0d7	3d61be70-f89f-4d27-8b49-1ae3ab2a802c	0	8.6	\N
09eafcc8-eafa-4928-a5ca-a869cc53cacb	e2e85fb2-1a29-4b83-882c-e591377be0d7	0dccea72-e417-4381-b430-0854dc98fd2b	0	8.6	\N
01c385a5-e9b3-4a38-aa4e-196befb4bff2	e2e85fb2-1a29-4b83-882c-e591377be0d7	6c2bd3f8-a725-4c6a-bc96-487b8512f477	0	3.8	\N
defda161-2e77-42d8-b971-8c744c4cd310	e2e85fb2-1a29-4b83-882c-e591377be0d7	080e1bc6-2e5b-485b-a369-99b53586eda3	0	4.8	\N
a67b7542-bb86-4499-b602-d3d976a1f9f4	e2e85fb2-1a29-4b83-882c-e591377be0d7	806b7339-7303-414d-8966-d49f02fa804f	0	4.8	\N
3a43e748-1938-4137-a5df-5f6d982560e9	e2e85fb2-1a29-4b83-882c-e591377be0d7	fab4c8b8-6e83-431c-b784-ad3346759365	0	5.6	\N
5a1087c6-3fef-43a6-8e3d-6b6cb011dc49	e2e85fb2-1a29-4b83-882c-e591377be0d7	51c9a455-1506-4887-ae1d-0f775899174d	0	4.6	\N
6ca4e127-8291-48e5-9856-cb50621bf9dc	e2e85fb2-1a29-4b83-882c-e591377be0d7	294ca3f1-937d-4efa-aa8c-864c644fe24b	0	1.8	\N
2f1524c7-18bb-4aac-ac91-c8b9d8672aa3	e2e85fb2-1a29-4b83-882c-e591377be0d7	cc9be182-5d90-4abf-9976-823b4e61cd33	0	1.8	\N
76bcef14-7cea-46a8-8c41-877000f7a95a	0129e5b9-3df0-4219-a8b4-26b449d389c0	9fac21e5-a8bc-4204-bb35-7dde2cc211e9	6	7.4	\N
77fcafbb-480e-4729-a30a-84132b634866	0129e5b9-3df0-4219-a8b4-26b449d389c0	fd6d75ec-ec9d-45b2-a7d8-e61240070374	6	5.4	\N
bfb681e4-85ae-4614-ad68-1291ad629179	0129e5b9-3df0-4219-a8b4-26b449d389c0	e00843fb-fedb-434a-ae73-f9d8e554151e	8	4.2	\N
647190ba-ee2f-4e5e-8286-a756eae19be6	0129e5b9-3df0-4219-a8b4-26b449d389c0	2b052187-883e-43a4-bed1-523771b663e0	6	10.2	\N
90ed7950-2a9d-449f-b358-9d8813febb57	0129e5b9-3df0-4219-a8b4-26b449d389c0	3c29b236-58cf-4201-a171-4750ee76a5c5	6	12.5	\N
ab32b83e-2539-4d60-b26a-efba17595183	0129e5b9-3df0-4219-a8b4-26b449d389c0	1cea990b-852a-41cc-9216-fa3e3006f2d6	6	12.5	\N
74ea4c44-b76c-47a6-be3a-5b0ec70e7766	0129e5b9-3df0-4219-a8b4-26b449d389c0	3d61be70-f89f-4d27-8b49-1ae3ab2a802c	3	8.6	\N
5f768f38-11d0-4510-9d68-3bd535193cd9	0129e5b9-3df0-4219-a8b4-26b449d389c0	5b685926-58cb-49cb-a629-c5238a00740a	3	5.2	\N
62da1153-44b0-438c-a477-b66f3227c4ee	0129e5b9-3df0-4219-a8b4-26b449d389c0	c747c326-8331-4ec4-b19a-ee3912f4bbec	3	5.2	\N
f9f98800-d225-4226-b242-f97742da0015	0129e5b9-3df0-4219-a8b4-26b449d389c0	2b5872eb-4998-4d04-a96d-338e6e4d9165	3	5.2	\N
356807b5-7b6e-4fb0-912b-389f93d55098	0129e5b9-3df0-4219-a8b4-26b449d389c0	4ff4bc90-9ec6-4ef8-b00b-0ea0346642f3	2	13.2	\N
43ba254d-30a7-4345-893f-0c7c9587f7a5	0129e5b9-3df0-4219-a8b4-26b449d389c0	f62e9a15-d8a7-4781-a2fc-6df46b37e381	2	11.5	\N
8bacac2e-7c20-4087-8793-da8fce71a51e	0129e5b9-3df0-4219-a8b4-26b449d389c0	6c2bd3f8-a725-4c6a-bc96-487b8512f477	3	3.8	\N
91a776bb-db15-4ee2-abe4-46d4d8da935d	0129e5b9-3df0-4219-a8b4-26b449d389c0	080e1bc6-2e5b-485b-a369-99b53586eda3	3	4.8	\N
d9ac17d1-b073-45f3-8406-2c53509ebfb1	0129e5b9-3df0-4219-a8b4-26b449d389c0	806b7339-7303-414d-8966-d49f02fa804f	1	4.8	\N
50edb9bd-3191-4d4f-9e38-4ab8700d8e10	0129e5b9-3df0-4219-a8b4-26b449d389c0	fab4c8b8-6e83-431c-b784-ad3346759365	9	5.6	\N
a621886d-a46c-4096-a22d-2d0f8ae695f7	0129e5b9-3df0-4219-a8b4-26b449d389c0	51c9a455-1506-4887-ae1d-0f775899174d	9	4.6	\N
172355ce-f889-488d-aec2-df61e4a1bba1	0129e5b9-3df0-4219-a8b4-26b449d389c0	cc9be182-5d90-4abf-9976-823b4e61cd33	8	1.8	\N
786a8f76-18eb-4ed2-9cf7-f13ddd09bf56	0129e5b9-3df0-4219-a8b4-26b449d389c0	9fdde592-74f0-466a-b65b-51c73a356c4f	4	2	\N
9252dc91-6542-45d3-9dcd-080c471129ef	0129e5b9-3df0-4219-a8b4-26b449d389c0	51c5fbd4-d14c-4297-8ee6-32da2fbf65de	4	2	\N
5acb7a80-cf09-47c2-9731-88ad07d33d9d	0129e5b9-3df0-4219-a8b4-26b449d389c0	9e5e6bce-ec92-4ed8-ba16-b8c2e3b60fe4	4	7.8	\N
b0b78f0f-5e9a-4f36-8aef-34981a56023c	0129e5b9-3df0-4219-a8b4-26b449d389c0	e3685b83-25e1-4679-a9d0-5fcaa8be1b29	4	4.9	\N
fe9bca39-106a-486b-9332-e12320f8738c	0129e5b9-3df0-4219-a8b4-26b449d389c0	9f2beabc-2da0-4a15-9a98-5192ddbe714b	2	10.02	\N
e1bc6876-1a75-4d5f-9adc-4088fe752330	0129e5b9-3df0-4219-a8b4-26b449d389c0	8890477e-792f-4ccc-bfa4-efa5d19cbba3	2	15.8	\N
5409b753-46b2-4078-bf2c-35803e4e395a	0129e5b9-3df0-4219-a8b4-26b449d389c0	0cf6ae53-d9ae-4269-ac96-f19b8dbdbcb2	4	4.9	\N
7e720d53-b15c-482a-aa41-f3968f4036e1	0129e5b9-3df0-4219-a8b4-26b449d389c0	4bee824c-e816-4b4a-9027-7c6cb4e495da	4	4.5	\N
cc657dee-b671-42d2-8e29-b9ca631fc0d5	0129e5b9-3df0-4219-a8b4-26b449d389c0	294ca3f1-937d-4efa-aa8c-864c644fe24b	4	1.8	\N
efb3eacb-f523-4fdb-a61d-d6d1ab2a8442	b836f3d9-7cee-4fc6-8ef5-a43865231fde	9fac21e5-a8bc-4204-bb35-7dde2cc211e9	6	7.4	\N
1edfb3a8-7f9a-4f3b-9b38-23c907d18269	b836f3d9-7cee-4fc6-8ef5-a43865231fde	fd6d75ec-ec9d-45b2-a7d8-e61240070374	6	5.4	\N
03ba45ff-cec5-4a53-a96d-829e6ea97523	b836f3d9-7cee-4fc6-8ef5-a43865231fde	e00843fb-fedb-434a-ae73-f9d8e554151e	8	4.2	\N
c17377fa-1136-46a7-9c21-a954f8da65f9	b836f3d9-7cee-4fc6-8ef5-a43865231fde	2b052187-883e-43a4-bed1-523771b663e0	6	10.2	\N
8efd719c-0d55-4015-9bd8-70127b2779e6	b836f3d9-7cee-4fc6-8ef5-a43865231fde	3c29b236-58cf-4201-a171-4750ee76a5c5	6	12.5	\N
47a6fc6a-dccb-45cf-9a93-1d3828483117	b836f3d9-7cee-4fc6-8ef5-a43865231fde	1cea990b-852a-41cc-9216-fa3e3006f2d6	6	12.5	\N
c0da1e08-20d7-4319-bcf9-87721e70cfef	b836f3d9-7cee-4fc6-8ef5-a43865231fde	3d61be70-f89f-4d27-8b49-1ae3ab2a802c	1	8.6	\N
4c6e157c-ed51-40ae-8d9a-82cc61721507	b836f3d9-7cee-4fc6-8ef5-a43865231fde	0dccea72-e417-4381-b430-0854dc98fd2b	2	8.6	\N
c1ad48ee-740a-4667-b015-893cfa77cd2a	b836f3d9-7cee-4fc6-8ef5-a43865231fde	5b685926-58cb-49cb-a629-c5238a00740a	3	5.2	\N
485c625e-7be7-4dcb-982a-884ad9051f24	b836f3d9-7cee-4fc6-8ef5-a43865231fde	c747c326-8331-4ec4-b19a-ee3912f4bbec	3	5.2	\N
ab12a09e-fc7e-4fdf-803c-8f92d7eda2c6	b836f3d9-7cee-4fc6-8ef5-a43865231fde	2b5872eb-4998-4d04-a96d-338e6e4d9165	3	5.2	\N
ef4997c7-cad0-4416-b9e1-f04a0f033abe	b836f3d9-7cee-4fc6-8ef5-a43865231fde	4ff4bc90-9ec6-4ef8-b00b-0ea0346642f3	2	13.2	\N
a5d85af1-4231-42c4-9267-cbe9722a21e8	b836f3d9-7cee-4fc6-8ef5-a43865231fde	f62e9a15-d8a7-4781-a2fc-6df46b37e381	2	11.5	\N
acbc0d59-b8d0-49f0-9b33-25cde232da4b	b836f3d9-7cee-4fc6-8ef5-a43865231fde	6c2bd3f8-a725-4c6a-bc96-487b8512f477	3	3.8	\N
018e2d5a-c3b1-48be-a234-e7f76206ecb1	b836f3d9-7cee-4fc6-8ef5-a43865231fde	080e1bc6-2e5b-485b-a369-99b53586eda3	3	4.8	\N
ada8a4a8-c08e-43b1-8021-a3a59cd2554e	b836f3d9-7cee-4fc6-8ef5-a43865231fde	806b7339-7303-414d-8966-d49f02fa804f	1	4.8	\N
ff20c1be-5a4b-4e33-b71d-00d975e7a885	b836f3d9-7cee-4fc6-8ef5-a43865231fde	fab4c8b8-6e83-431c-b784-ad3346759365	9	5.6	\N
308e2d03-9bd4-463b-9b04-9205ff51819b	b836f3d9-7cee-4fc6-8ef5-a43865231fde	51c9a455-1506-4887-ae1d-0f775899174d	9	4.6	\N
f0beb877-41c6-4da8-8e4a-8c09121af532	b836f3d9-7cee-4fc6-8ef5-a43865231fde	e1d608d8-f769-4ef7-bae8-5b48aa46f832	4	1.8	\N
9e249956-166b-4a46-944b-2fbf465e41c0	b836f3d9-7cee-4fc6-8ef5-a43865231fde	cc9be182-5d90-4abf-9976-823b4e61cd33	4	1.8	\N
acfaea85-3948-4560-9219-ff8e90a78522	b836f3d9-7cee-4fc6-8ef5-a43865231fde	1fe347d2-0396-4f21-89e0-5a7bb19f3756	4	1.8	\N
36e3d51f-fded-428c-b0a1-048f22b685c9	b836f3d9-7cee-4fc6-8ef5-a43865231fde	9fdde592-74f0-466a-b65b-51c73a356c4f	4	2	\N
04100c65-f721-48fa-af19-87b12e1388d3	b836f3d9-7cee-4fc6-8ef5-a43865231fde	51c5fbd4-d14c-4297-8ee6-32da2fbf65de	4	2	\N
fe5525f5-62e4-41cb-9341-bacf00004cb4	b836f3d9-7cee-4fc6-8ef5-a43865231fde	9e5e6bce-ec92-4ed8-ba16-b8c2e3b60fe4	4	7.8	\N
94210e83-5f10-4753-9a1d-60d00dd49dc5	b836f3d9-7cee-4fc6-8ef5-a43865231fde	e3685b83-25e1-4679-a9d0-5fcaa8be1b29	4	4.9	\N
baf78e06-0e66-4fa2-aaae-2124761bc3f8	b836f3d9-7cee-4fc6-8ef5-a43865231fde	9f2beabc-2da0-4a15-9a98-5192ddbe714b	2	10.02	\N
f4a20a08-43ad-4559-9022-137af3f6e86d	b836f3d9-7cee-4fc6-8ef5-a43865231fde	8890477e-792f-4ccc-bfa4-efa5d19cbba3	2	15.8	\N
91da87ea-8748-4df8-b4bb-91e11349eafc	b836f3d9-7cee-4fc6-8ef5-a43865231fde	0cf6ae53-d9ae-4269-ac96-f19b8dbdbcb2	4	4.9	\N
66d9fd80-3e68-40a2-a1c5-5b3c98b81f38	b836f3d9-7cee-4fc6-8ef5-a43865231fde	4bee824c-e816-4b4a-9027-7c6cb4e495da	4	4.5	\N
6a79af0d-fbd7-4d5c-b287-524fa721fb08	5ccb35e1-c839-40c3-ad96-702ed547cae6	05f013ba-9ba8-465b-a9e9-4fa68f95f009	1	5.78	\N
5423817f-d2dc-4c42-a32c-c612cc790284	5ccb35e1-c839-40c3-ad96-702ed547cae6	0e7eb525-b5e0-443d-81e9-1e8a0c59ca11	5	3.83	\N
87f33b48-87bb-43b5-b49b-e1dc178c73b3	5ccb35e1-c839-40c3-ad96-702ed547cae6	0db8a4ea-09fa-4f1f-99f4-b17a3b2e24ad	3	3.83	\N
71e2a3e8-40d7-4375-b209-b6d76ac1f621	5ccb35e1-c839-40c3-ad96-702ed547cae6	ac5b9720-e600-41ec-b0ce-e7108feb387d	2	2.04	\N
9c3c76a6-4bcf-4c41-838f-a0b50108ed9f	5ccb35e1-c839-40c3-ad96-702ed547cae6	d0e59e48-079d-442a-920d-ca5b5741b66f	2	2.04	\N
39e447ac-558e-4f59-86a8-9b3bfe118aaa	5ccb35e1-c839-40c3-ad96-702ed547cae6	1fe347d2-0396-4f21-89e0-5a7bb19f3756	4	1.8	\N
d2e5279f-1c30-4dc6-886f-5c0cc70f6180	5ccb35e1-c839-40c3-ad96-702ed547cae6	c17ea773-f608-4bb6-a71f-d41ee7ea3882	4	3.57	\N
708b6cb5-20d8-441d-8af8-e54e90804f33	5ccb35e1-c839-40c3-ad96-702ed547cae6	427d7f32-a75f-440e-adf0-f96201d0bc5b	2	3.57	\N
75da333c-d35b-4f10-908a-14b1767afda4	5ccb35e1-c839-40c3-ad96-702ed547cae6	93b1106e-24ce-4df3-8df8-ba4d21013a0a	4	7.9	\N
706145a8-c251-44c3-95d0-a60b7459387d	5ccb35e1-c839-40c3-ad96-702ed547cae6	43487f82-6bad-489c-b0a4-dc03cd5a5e8d	3	5.02	\N
9ef1f08f-9f43-4c2f-bb36-f973c8c36a3a	5ccb35e1-c839-40c3-ad96-702ed547cae6	9993ceda-cbff-467e-ba33-c9ec45cc4545	2	14.6	\N
3be1ee40-70f7-4aeb-9ee5-76cd453c4e87	5ccb35e1-c839-40c3-ad96-702ed547cae6	9014815a-340b-4092-88ea-208e3c3a5e49	4	7.82	\N
2a61e702-db71-439f-9673-cdf8de38ba22	5ccb35e1-c839-40c3-ad96-702ed547cae6	0e4a534f-44ff-4008-863a-a3bbd336fc93	1	12.41	\N
ec652db3-9224-44c7-b805-944d6ef20282	5ccb35e1-c839-40c3-ad96-702ed547cae6	8d75a2da-c502-444e-a242-297fe3497d10	2	37.06	\N
01f93211-fb51-4b2d-9942-f49282615d35	5ccb35e1-c839-40c3-ad96-702ed547cae6	be2a2b08-621e-41b8-8d55-0d68cc8d4445	4	3.74	\N
f7cc1d2b-0fad-41ac-80b3-95d8d400d59d	5ccb35e1-c839-40c3-ad96-702ed547cae6	294ca3f1-937d-4efa-aa8c-864c644fe24b	3	1.8	\N
ac719098-66ac-49d4-a9c9-0e209ce3e285	5ccb35e1-c839-40c3-ad96-702ed547cae6	4edfafe5-16d2-4b03-b375-f771eec43ebe	2	4.25	\N
d5a46d8a-28f8-4451-aefd-3d4d1c1bae6d	5ccb35e1-c839-40c3-ad96-702ed547cae6	daf2f120-5608-4f62-a056-45249b1cc0f4	0	9.3	\N
342cb458-0fc2-446c-8751-13b74f1294cf	5ccb35e1-c839-40c3-ad96-702ed547cae6	fd6d75ec-ec9d-45b2-a7d8-e61240070374	4	5.4	\N
3a74fcd0-10f8-4723-aea5-524777261d4a	5ccb35e1-c839-40c3-ad96-702ed547cae6	06e735dc-80bf-40c6-ac32-f8e8235350a4	3	10.71	\N
7a1816bf-d7af-4c04-9c84-204294ac5491	5ccb35e1-c839-40c3-ad96-702ed547cae6	cc9be182-5d90-4abf-9976-823b4e61cd33	4	1.8	\N
41f3750c-1571-4a9e-b578-72be25bbbae0	5ccb35e1-c839-40c3-ad96-702ed547cae6	9e5e6bce-ec92-4ed8-ba16-b8c2e3b60fe4	4	7.8	\N
d1d97750-eb30-4bc8-bd60-0c30afd16efc	5ccb35e1-c839-40c3-ad96-702ed547cae6	57090686-76e3-4ef8-83fb-e9f27c159566	1	37.06	\N
f3dd5b9c-7803-4713-bc09-6f8b2e5efea2	5ccb35e1-c839-40c3-ad96-702ed547cae6	bb855a25-83cd-4164-a896-0c417609d1a0	2	24.48	\N
68a31127-7f16-405e-94b5-3802b39d2717	5ccb35e1-c839-40c3-ad96-702ed547cae6	7ef35b0c-e2f2-4d87-b9d9-c9a29703b129	0	10.71	\N
3275f2a1-199a-4d6e-9284-598309174312	5ccb35e1-c839-40c3-ad96-702ed547cae6	3c47788d-21bc-4263-a1f0-a062a6e51a9b	3	13.18	\N
fcc25707-40a9-4974-b6d6-0da5c300276d	5ccb35e1-c839-40c3-ad96-702ed547cae6	a8707b5a-a41c-4bc8-a0fe-c823c45ab014	3	37.06	\N
09e65b39-9691-4307-85ed-97dcd9da2aba	5ccb35e1-c839-40c3-ad96-702ed547cae6	210351fc-7e9c-42ef-923d-8226fc8d2911	0	24.48	\N
51827657-f1b5-4f12-a073-2bebe8c5f9aa	5ccb35e1-c839-40c3-ad96-702ed547cae6	8def029f-c4b6-4e44-bbd8-24a3798eaf46	4	4.08	\N
af01a1bc-1012-4b52-b51c-0cdc05767993	5ccb35e1-c839-40c3-ad96-702ed547cae6	4ee3536c-5f11-49e4-aa4c-f8a786a7b990	6	2.98	\N
68433e38-2137-46ef-b36a-8ac43a97cb4f	5ccb35e1-c839-40c3-ad96-702ed547cae6	0bbc5bd9-7485-4ca7-90bc-98b4fc4a7d43	3	24.48	\N
8cbf21f9-4066-49f3-b480-d7309eec25a5	5ccb35e1-c839-40c3-ad96-702ed547cae6	e69c6728-01d9-4d07-8561-3d967b0f3594	3	5.02	\N
4b2b03e5-87ca-4fcc-b826-d89323004208	5ccb35e1-c839-40c3-ad96-702ed547cae6	eb2a677a-a7d0-41a4-b985-ff96a3788362	4	3.83	\N
3af55e90-adf9-4d94-be3e-64000c103e86	5ccb35e1-c839-40c3-ad96-702ed547cae6	7d469886-3b4c-4ac7-8062-d42330c9c8d7	2	7.4	\N
e9a9da28-93b9-4fc3-8377-1a4529103dd9	5ccb35e1-c839-40c3-ad96-702ed547cae6	09473aa4-91ba-4ac6-b421-0131b27668f4	3	13.5	\N
84931528-82a2-44e4-987f-5e30cd2488fe	5ccb35e1-c839-40c3-ad96-702ed547cae6	8c5d3590-8de1-49eb-852b-5b00a2d95d65	2	10.71	\N
275b3bfc-bc97-4653-8ad7-4a5035a1e4c8	5ccb35e1-c839-40c3-ad96-702ed547cae6	92864630-c64f-4863-8a36-c2b51ea035e8	2	7.4	\N
84a1fc77-f19b-4708-bc2f-5366cb70fc4b	5ccb35e1-c839-40c3-ad96-702ed547cae6	80d5432b-878d-4b40-abef-ca31f83db88c	2	7.4	\N
efa7decb-4bd0-474a-9b5a-929d9bedad3a	085d18e9-8d9b-4a7c-8277-f77bd332344e	b8c7adc6-a08b-43cf-8caa-7c29c42f9f1a	3	7.74	\N
e4e9e1cc-91e3-4c5a-97fc-65a58891e6f6	085d18e9-8d9b-4a7c-8277-f77bd332344e	c54f156c-8483-4b77-9745-04661d47e82f	1	10.3	\N
f0224a63-c37a-4930-8bb1-4a4693678f01	085d18e9-8d9b-4a7c-8277-f77bd332344e	85e801eb-c962-423d-a7ce-02bf518a18ed	3	8.66	\N
3e302457-3582-4cb7-b9ba-fd15a23ed4de	085d18e9-8d9b-4a7c-8277-f77bd332344e	57121c57-0f01-4c92-afe3-26ae0d30c968	2	10.73	\N
85200adf-e800-4b73-a036-278f2c22893f	085d18e9-8d9b-4a7c-8277-f77bd332344e	fe9db831-2d58-4511-af1f-926092ba02e2	1	8.52	\N
229f6b99-a232-4767-813f-c4b56abe31e2	085d18e9-8d9b-4a7c-8277-f77bd332344e	8fdc320a-d74d-4760-8743-31ae9ddba850	1	9.62	\N
cce2dd25-b922-45a1-b31e-fbdb99c8b31b	085d18e9-8d9b-4a7c-8277-f77bd332344e	6ba14854-edaa-4b99-bbfe-8ab18842cfd7	2	9.67	\N
4727b470-dd04-4c86-9d6c-c9ac91347f17	085d18e9-8d9b-4a7c-8277-f77bd332344e	a2f70fa6-9483-4535-ad27-fd9c0864098e	2	7.43	\N
e7cd8df3-f318-47f4-8a43-b049ae8faff1	085d18e9-8d9b-4a7c-8277-f77bd332344e	7b85853e-d909-413e-8c27-9003ca34f047	2	17.55	\N
573737f9-a028-4298-9ea7-329e7a675832	085d18e9-8d9b-4a7c-8277-f77bd332344e	f030fd91-27fd-442b-8853-d7fd2e926f5a	3	3.76	\N
8cc909c4-8a1d-41df-b1d1-9d486107c0c6	085d18e9-8d9b-4a7c-8277-f77bd332344e	c24fab55-98f3-4bc3-85af-1b820fd61bdb	4	2.6	\N
5e3673e8-9929-4e06-ac9b-e144fd519445	085d18e9-8d9b-4a7c-8277-f77bd332344e	42acfe5b-87a9-4ec5-a5ee-6ed12b788a99	2	17.55	\N
07326e8f-8112-4e24-be0f-df1a1fb6a723	085d18e9-8d9b-4a7c-8277-f77bd332344e	ab733dec-baaa-479e-9583-2cf13c7131ec	2	10.21	\N
709b5558-cc12-4eb5-ac8e-9e685598b8dc	085d18e9-8d9b-4a7c-8277-f77bd332344e	83f830e9-5f80-4dce-a5ce-254247e5d736	3	13.69	\N
8c0b8e8d-6967-4e50-adef-6914364ef65f	085d18e9-8d9b-4a7c-8277-f77bd332344e	99b64b5b-93e5-4ae1-bbd0-f02b709c82b6	4	3.26	\N
4f76923c-25b3-49f8-b2e7-9155c569764c	085d18e9-8d9b-4a7c-8277-f77bd332344e	d376a251-cfa6-4aee-af3d-3c14f5098704	4	17.08	\N
95a7ffe0-925e-4bf9-8283-c716131d5dda	085d18e9-8d9b-4a7c-8277-f77bd332344e	ae504b55-4776-4560-b106-febe842d47b7	2	6.76	\N
6b1092f8-950e-4cd5-9293-cddef96adb7e	085d18e9-8d9b-4a7c-8277-f77bd332344e	56ace9b9-6f96-4d5e-bba7-70f04c7c2681	3	5.56	\N
7fe12466-2802-4fcc-b3d2-9e32d9830502	085d18e9-8d9b-4a7c-8277-f77bd332344e	ba3b4d18-4a3a-42ff-ba3a-f4e64e162978	3	7.74	\N
7c812101-ac02-4c29-a242-4429e0c59b06	085d18e9-8d9b-4a7c-8277-f77bd332344e	109d7a24-8924-4c07-9e00-f83363fc21d3	5	3.59	\N
3410ceee-1eea-48d7-a6a3-c257c91c7985	085d18e9-8d9b-4a7c-8277-f77bd332344e	deee6c6c-b5d4-47ee-b253-86beaa0ff763	3	4.16	\N
8b877bb3-779b-417a-8240-865aa266239b	085d18e9-8d9b-4a7c-8277-f77bd332344e	53ea0278-453f-4df0-9272-7e55da9b5ecb	3	3.94	\N
d6eb39ae-3061-4fc4-a4f9-3c090975438c	085d18e9-8d9b-4a7c-8277-f77bd332344e	1af30ab3-53c1-4a69-9649-4e5f8935087b	4	11.01	\N
6c337f6c-fb17-4385-a3e2-37694ed21c15	085d18e9-8d9b-4a7c-8277-f77bd332344e	9dca60ee-f6a5-4910-84f2-9b504dc7601d	2	4.67	\N
4b95d710-8e1d-42aa-9d69-3c885c783273	085d18e9-8d9b-4a7c-8277-f77bd332344e	aee4c76b-b63e-4f5b-89f2-04a1111de40d	2	3.08	\N
919c7bc9-73e3-44af-aa90-44c5de0e7460	085d18e9-8d9b-4a7c-8277-f77bd332344e	fd2ecaf7-e2ad-4906-9571-0820eaf39fd4	0	14.9	\N
5cfbce17-70d8-4bb5-b14e-bc04f483dd2c	085d18e9-8d9b-4a7c-8277-f77bd332344e	5f983a66-48aa-4419-8951-33bc52217916	2	7.43	\N
c700d79b-91a7-4a6b-8967-44d2c586a148	085d18e9-8d9b-4a7c-8277-f77bd332344e	17fa3d84-4419-40ef-b7a7-f144387d913c	2	7.65	\N
303cd111-bfe9-4e6a-804b-e1944c3919e0	085d18e9-8d9b-4a7c-8277-f77bd332344e	32935f08-2ba8-4ed0-9a52-e5cb55848f78	3	10.26	\N
29fb091a-fb63-4bd0-babb-e476312af8d1	085d18e9-8d9b-4a7c-8277-f77bd332344e	00bceb45-abcb-4fef-9851-591f6f7e601d	3	6.05	\N
d63b09ce-2783-4083-b71e-5cab1a4c4811	085d18e9-8d9b-4a7c-8277-f77bd332344e	3a563d70-1d3b-44ea-aafa-c849430bd9d2	2	11.48	\N
92db5e18-07a7-4584-b169-81ad651cbeb4	085d18e9-8d9b-4a7c-8277-f77bd332344e	83347115-152a-4229-ab10-1a54f258bef1	2	13.4	\N
fe6f357e-7763-41c8-98ee-d28e91a1839a	085d18e9-8d9b-4a7c-8277-f77bd332344e	86d79e90-029d-4fdf-96a0-84dc8d5f000a	4	12.72	\N
302a8ae5-4807-4615-a07a-78d49950c648	085d18e9-8d9b-4a7c-8277-f77bd332344e	4caa71b4-3266-4796-bb04-6f1474b67288	4	5.11	\N
09f62632-4c64-48aa-9aa6-7a30dac1e98c	085d18e9-8d9b-4a7c-8277-f77bd332344e	023384be-4b4b-4b70-9105-b34a33b303a7	3	6.97	\N
bf02ff79-7dbf-4611-8e01-48057f96df05	085d18e9-8d9b-4a7c-8277-f77bd332344e	c6eacdb6-5f77-49a6-b3f7-3befef4e9881	2	7.72	\N
d35e34ea-f3b5-40ce-a24c-a5e3012df13b	93819b33-84f4-41be-97b2-f5aea3e5b327	2b052187-883e-43a4-bed1-523771b663e0	6	\N	\N
726a74cf-a242-4927-9e0c-fbf7d1d70000	41c4e6d6-3a6e-48a7-bac2-4de6027cb1b6	06e735dc-80bf-40c6-ac32-f8e8235350a4	1	10.71	\N
f766b48f-9ead-49e4-90d0-9c298b35ed04	41c4e6d6-3a6e-48a7-bac2-4de6027cb1b6	8c5d3590-8de1-49eb-852b-5b00a2d95d65	2	10.71	\N
38fb511b-e700-4906-a509-c50b8b897db8	41c4e6d6-3a6e-48a7-bac2-4de6027cb1b6	3c47788d-21bc-4263-a1f0-a062a6e51a9b	3	13.18	\N
573a0bd8-8f2a-48f6-a285-e3a99427c06b	41c4e6d6-3a6e-48a7-bac2-4de6027cb1b6	57090686-76e3-4ef8-83fb-e9f27c159566	1	37.06	\N
14d55044-1209-4db2-b9e9-c16ede0cd7cc	41c4e6d6-3a6e-48a7-bac2-4de6027cb1b6	a8707b5a-a41c-4bc8-a0fe-c823c45ab014	1	37.06	\N
950d6798-aa29-47d5-9e50-3a322c72be08	41c4e6d6-3a6e-48a7-bac2-4de6027cb1b6	d0e59e48-079d-442a-920d-ca5b5741b66f	1	2.04	\N
4dde0678-b1fd-471f-8e16-fa4f5316d3ba	41c4e6d6-3a6e-48a7-bac2-4de6027cb1b6	c17ea773-f608-4bb6-a71f-d41ee7ea3882	1	3.57	\N
1e7268e3-9105-4409-b0f2-694dd8efdd11	41c4e6d6-3a6e-48a7-bac2-4de6027cb1b6	294ca3f1-937d-4efa-aa8c-864c644fe24b	2	1.36	\N
87a88ad8-1782-458c-8deb-da44dc1f65e6	41c4e6d6-3a6e-48a7-bac2-4de6027cb1b6	4edfafe5-16d2-4b03-b375-f771eec43ebe	1	4.25	\N
c55883e4-ed9d-477b-8aa9-0fd017aea5a1	41c4e6d6-3a6e-48a7-bac2-4de6027cb1b6	8def029f-c4b6-4e44-bbd8-24a3798eaf46	1	4.08	\N
6dda8249-68d1-4045-b702-059737fda773	41c4e6d6-3a6e-48a7-bac2-4de6027cb1b6	9e5e6bce-ec92-4ed8-ba16-b8c2e3b60fe4	1	6.63	\N
d545d44c-ce4a-40cb-8a40-de957059e219	41c4e6d6-3a6e-48a7-bac2-4de6027cb1b6	eb2a677a-a7d0-41a4-b985-ff96a3788362	3	3.83	\N
a7787213-8b0b-4663-9c43-4b27a45c0071	99b24514-0638-412d-8a1a-0831bbf0c12b	c6eacdb6-5f77-49a6-b3f7-3befef4e9881	1	7.72	\N
71b5582d-2099-45ad-a55f-a464c42c623f	cd3dc942-d020-42e0-9674-a77ad353c9c3	06e735dc-80bf-40c6-ac32-f8e8235350a4	1	10.71	1
9f4cc8ba-d086-4e30-b229-e2d3515ae8c7	cd3dc942-d020-42e0-9674-a77ad353c9c3	8c5d3590-8de1-49eb-852b-5b00a2d95d65	2	10.71	2
220179a8-5310-42d0-ac38-b042ee6abb79	cd3dc942-d020-42e0-9674-a77ad353c9c3	3c47788d-21bc-4263-a1f0-a062a6e51a9b	3	13.18	3
94e5fbf5-c06e-4f17-9637-0bc7d3d3147d	cd3dc942-d020-42e0-9674-a77ad353c9c3	57090686-76e3-4ef8-83fb-e9f27c159566	1	37.06	1
50c25bc7-2908-43f8-8662-8ef475316a57	cd3dc942-d020-42e0-9674-a77ad353c9c3	a8707b5a-a41c-4bc8-a0fe-c823c45ab014	1	37.06	1
bedba510-74ca-4d64-80a2-0081f6f83a81	cd3dc942-d020-42e0-9674-a77ad353c9c3	d0e59e48-079d-442a-920d-ca5b5741b66f	1	2.04	1
8bcb1e52-2b57-4b7c-8c1b-e56cb00c2ee0	cd3dc942-d020-42e0-9674-a77ad353c9c3	c17ea773-f608-4bb6-a71f-d41ee7ea3882	1	3.57	1
4e7ff60c-8fca-4da4-a568-a51f64866f96	cd3dc942-d020-42e0-9674-a77ad353c9c3	294ca3f1-937d-4efa-aa8c-864c644fe24b	2	1.8	2
7a73f887-3f9e-4e0a-9b7f-ddab760bd650	cd3dc942-d020-42e0-9674-a77ad353c9c3	4edfafe5-16d2-4b03-b375-f771eec43ebe	1	4.25	1
58d0671c-44e0-4514-a516-ef8c619986d7	cd3dc942-d020-42e0-9674-a77ad353c9c3	8def029f-c4b6-4e44-bbd8-24a3798eaf46	1	4.08	1
7e4d607c-2fa1-4e0e-814e-5119b52cc9a5	cd3dc942-d020-42e0-9674-a77ad353c9c3	9e5e6bce-ec92-4ed8-ba16-b8c2e3b60fe4	1	7.8	1
c76d8f76-5927-4923-a370-235ba5c77b1d	cd3dc942-d020-42e0-9674-a77ad353c9c3	eb2a677a-a7d0-41a4-b985-ff96a3788362	3	3.83	3
1bea61d6-7439-4b24-ad24-2e568e33aad3	287f02df-d7c8-44f3-9559-b82f285df78d	1e27b1c6-6ac2-4396-ab9f-748c0d1d87da	3	6.5	\N
7c7c8ede-5d96-4a26-b351-1f078be60e99	287f02df-d7c8-44f3-9559-b82f285df78d	8ec7d2c3-8387-40a5-9d8d-3884689d4591	3	6.9	\N
441f7713-47dc-4689-93cf-8d99bb854ae8	287f02df-d7c8-44f3-9559-b82f285df78d	4eb84e04-a7d4-4632-b48d-37f155aefbe9	3	6.3	\N
f7772316-8364-4642-84a5-2f8860a3113c	287f02df-d7c8-44f3-9559-b82f285df78d	cb879680-3df9-42ab-a917-5866bfa7b144	3	6.95	\N
58153212-79a1-4468-9586-95794808b70d	287f02df-d7c8-44f3-9559-b82f285df78d	5681cff4-0d71-4661-941a-4df86ccc102d	3	7.6	\N
430a265b-74fc-4301-b76b-259229312779	287f02df-d7c8-44f3-9559-b82f285df78d	260618d9-421c-4801-a453-b38f601b95c7	3	6.2	\N
6588af16-7fcf-4e9a-9e7a-b4327dea1afa	287f02df-d7c8-44f3-9559-b82f285df78d	1902bd89-bcaf-4e25-9b56-cffaad95854a	6	8.6	\N
6e8a1ed9-a185-4e0c-96c3-41a7d11f5138	287f02df-d7c8-44f3-9559-b82f285df78d	d44958b7-6c19-4427-a771-3e9eb86a9f48	2	17.9	\N
763c56c0-219a-4610-8d36-1fcf8a84d0e0	287f02df-d7c8-44f3-9559-b82f285df78d	ce2807b1-b439-49be-9789-78e2124aee22	2	26.9	\N
f825654a-866d-4581-b3a4-d6d7f3eee275	287f02df-d7c8-44f3-9559-b82f285df78d	4ccd9168-98ae-4077-a18e-8d9d034698fb	9	4.6	\N
9583c329-6168-49f3-ba8a-15d4f556976a	287f02df-d7c8-44f3-9559-b82f285df78d	fd6d75ec-ec9d-45b2-a7d8-e61240070374	3	6.95	\N
1baa32fa-95f6-41f2-bad1-d5ccdf361fa5	287f02df-d7c8-44f3-9559-b82f285df78d	afc437a4-c6e9-48db-91c5-a5d8d34538dd	6	5	\N
0d02367a-e41f-41ed-bd88-6c9aad689be4	287f02df-d7c8-44f3-9559-b82f285df78d	3c29b236-58cf-4201-a171-4750ee76a5c5	3	12.5	\N
e778e4d6-e66e-48e9-a86d-6b8ff2f2c30c	287f02df-d7c8-44f3-9559-b82f285df78d	1cea990b-852a-41cc-9216-fa3e3006f2d6	3	12.5	\N
b15c1570-0d91-4c73-8d22-76c79bbcd471	287f02df-d7c8-44f3-9559-b82f285df78d	f25aea89-8505-4835-83a4-a302758e84a2	3	2.5	\N
ed537553-714e-43b3-b585-b450ce1fba3d	287f02df-d7c8-44f3-9559-b82f285df78d	3aa7200b-4758-4416-b145-66cc8bfc51a2	3	2.5	\N
00fe85e7-7d27-43bb-b9cf-77d5a26c89b7	287f02df-d7c8-44f3-9559-b82f285df78d	3d61be70-f89f-4d27-8b49-1ae3ab2a802c	1	8.6	\N
fa444111-6438-413b-80bf-86d70495fa9a	287f02df-d7c8-44f3-9559-b82f285df78d	0dccea72-e417-4381-b430-0854dc98fd2b	2	8.6	\N
afe5b802-3a12-4689-8651-2e5b6235cd1a	287f02df-d7c8-44f3-9559-b82f285df78d	4ff4bc90-9ec6-4ef8-b00b-0ea0346642f3	2	13.2	\N
d08fb489-f12c-497c-b357-0109145955a4	287f02df-d7c8-44f3-9559-b82f285df78d	f62e9a15-d8a7-4781-a2fc-6df46b37e381	2	11.5	\N
c31c2760-5b81-4331-bf1d-bba9d57e975d	287f02df-d7c8-44f3-9559-b82f285df78d	805955bc-5dde-4b98-85a4-a12e4b72f3bd	3	4.6	\N
701be2ab-08d7-4947-92b3-2d003ac6a113	287f02df-d7c8-44f3-9559-b82f285df78d	fe55be2a-4c99-4d7a-9694-0ca8304b2809	3	3.8	\N
01dd83f9-6d3a-438b-b9f7-4facfac692da	287f02df-d7c8-44f3-9559-b82f285df78d	080e1bc6-2e5b-485b-a369-99b53586eda3	3	4.8	\N
f2a0584f-3a6c-46bc-b85a-dc3383b0c377	287f02df-d7c8-44f3-9559-b82f285df78d	806b7339-7303-414d-8966-d49f02fa804f	1	4.8	\N
d56c6df8-966c-4e76-83c1-fdd2752fc3bb	287f02df-d7c8-44f3-9559-b82f285df78d	fab4c8b8-6e83-431c-b784-ad3346759365	3	5.6	\N
65849df7-c1a5-42e2-a444-ea25b2f4adb7	287f02df-d7c8-44f3-9559-b82f285df78d	add2d27e-1dd1-4f88-a897-897b0761003e	3	2.2	\N
4d29cdb2-39dd-42df-830a-ae38d02d3a6c	287f02df-d7c8-44f3-9559-b82f285df78d	add2d27e-1dd1-4f88-a897-897b0761003e	1	2.2	\N
4e83f663-aa3a-4a8b-b19b-2a627920c7c3	287f02df-d7c8-44f3-9559-b82f285df78d	cc9be182-5d90-4abf-9976-823b4e61cd33	6	1.8	\N
3449de66-9de9-4e94-a350-6d9328e2c55c	287f02df-d7c8-44f3-9559-b82f285df78d	cc9be182-5d90-4abf-9976-823b4e61cd33	2	1.8	\N
27045c78-52a0-4be4-9868-b185ec9d2d37	287f02df-d7c8-44f3-9559-b82f285df78d	9fdde592-74f0-466a-b65b-51c73a356c4f	4	2	\N
e003c0d2-ce98-4155-b867-b60aabce30cf	287f02df-d7c8-44f3-9559-b82f285df78d	51c5fbd4-d14c-4297-8ee6-32da2fbf65de	4	2	\N
7d8d4ac0-2d3a-4a1f-bb88-d5f309bf69ae	287f02df-d7c8-44f3-9559-b82f285df78d	ce996f1c-5704-4f6a-8e6b-b407b3bd60c1	3	2.9	\N
16f60a36-2880-4492-bdc1-cd97e55bac28	287f02df-d7c8-44f3-9559-b82f285df78d	f25f15a5-b640-4243-9209-7caf329754ff	3	3.2	\N
e988c2db-34bb-4be7-a09e-3e8dc4b80999	287f02df-d7c8-44f3-9559-b82f285df78d	b47b5b58-6aa2-46d4-a375-7f7a794f762c	3	5.2	\N
9cf599b2-8c4d-4336-a529-e6c3f07311d6	287f02df-d7c8-44f3-9559-b82f285df78d	788e8ee6-cd6e-4d45-87a1-c62dbec2bd3c	3	8.4	\N
a0da835e-08f3-42f9-8993-810cffe1ba46	287f02df-d7c8-44f3-9559-b82f285df78d	35803093-ba4c-4427-988c-d7fa8b6787e1	2	5	\N
84c7b752-28ea-41af-afff-42e8339beb48	287f02df-d7c8-44f3-9559-b82f285df78d	0cf6ae53-d9ae-4269-ac96-f19b8dbdbcb2	4	4.9	\N
01d34f06-ae65-4985-ac09-a193f3722f96	287f02df-d7c8-44f3-9559-b82f285df78d	93b1106e-24ce-4df3-8df8-ba4d21013a0a	2	7.9	\N
0c680e33-950e-4029-9aa7-e2d9115f9aa3	287f02df-d7c8-44f3-9559-b82f285df78d	32c3ef69-d57b-469b-ac2a-bbf3dec443b5	2	8.3	\N
5baae746-7145-4539-b5f1-e7c5d52e8887	5bcc66d1-8649-4cfd-9c46-10ba5e1a53b0	1e27b1c6-6ac2-4396-ab9f-748c0d1d87da	3	6.5	\N
6aa8de24-8272-4071-b4f1-88464d21c3e3	5bcc66d1-8649-4cfd-9c46-10ba5e1a53b0	8ec7d2c3-8387-40a5-9d8d-3884689d4591	3	6.9	\N
5657ed72-d0b5-4ae3-8cd6-b2b1b54e6afd	5bcc66d1-8649-4cfd-9c46-10ba5e1a53b0	4eb84e04-a7d4-4632-b48d-37f155aefbe9	3	6.3	\N
8d337d6e-6ec3-42b9-aead-547e752b9315	5bcc66d1-8649-4cfd-9c46-10ba5e1a53b0	cb879680-3df9-42ab-a917-5866bfa7b144	3	6.95	\N
cd65e036-a126-418f-a0a0-e117add70b7d	5bcc66d1-8649-4cfd-9c46-10ba5e1a53b0	5681cff4-0d71-4661-941a-4df86ccc102d	3	7.6	\N
a2706c5c-89a7-424d-a1c7-c72fc2b8dcb6	5bcc66d1-8649-4cfd-9c46-10ba5e1a53b0	260618d9-421c-4801-a453-b38f601b95c7	3	6.2	\N
6578127f-8ffa-45fe-9ec2-54a23b8c3eb5	5bcc66d1-8649-4cfd-9c46-10ba5e1a53b0	1902bd89-bcaf-4e25-9b56-cffaad95854a	6	8.6	\N
b5ba8639-2846-49f0-a96f-75064dd15ac5	5bcc66d1-8649-4cfd-9c46-10ba5e1a53b0	d44958b7-6c19-4427-a771-3e9eb86a9f48	2	17.9	\N
8f0cc327-33f7-4f56-a513-eb6bf845dd52	5bcc66d1-8649-4cfd-9c46-10ba5e1a53b0	ce2807b1-b439-49be-9789-78e2124aee22	2	26.9	\N
60ff7dfb-0381-4f07-8005-384d917caaa3	5bcc66d1-8649-4cfd-9c46-10ba5e1a53b0	4ccd9168-98ae-4077-a18e-8d9d034698fb	9	4.6	\N
c344aa0f-b6a2-4770-8d68-0ad503c6a2e8	5bcc66d1-8649-4cfd-9c46-10ba5e1a53b0	fd6d75ec-ec9d-45b2-a7d8-e61240070374	3	6.95	\N
92be74b8-381f-49c5-bb49-7b89cc14fdc1	5bcc66d1-8649-4cfd-9c46-10ba5e1a53b0	afc437a4-c6e9-48db-91c5-a5d8d34538dd	6	5	\N
22956741-3478-4919-ab1d-2eb50e380742	5bcc66d1-8649-4cfd-9c46-10ba5e1a53b0	3c29b236-58cf-4201-a171-4750ee76a5c5	6	12.5	\N
bca05b90-8226-484a-aa7f-7862c60b54cd	5bcc66d1-8649-4cfd-9c46-10ba5e1a53b0	f25aea89-8505-4835-83a4-a302758e84a2	6	2.5	\N
1d1a8982-9100-4b95-a360-55330cac279b	5bcc66d1-8649-4cfd-9c46-10ba5e1a53b0	3d61be70-f89f-4d27-8b49-1ae3ab2a802c	1	8.6	\N
45d08d06-99c8-422b-9e3d-4849f30947a8	5bcc66d1-8649-4cfd-9c46-10ba5e1a53b0	0dccea72-e417-4381-b430-0854dc98fd2b	2	8.6	\N
00c19600-47c7-43bd-9290-5378c5dfee10	5bcc66d1-8649-4cfd-9c46-10ba5e1a53b0	4ff4bc90-9ec6-4ef8-b00b-0ea0346642f3	2	13.2	\N
2dbcd25d-9ae0-4630-81fa-ae9dde3eb86c	5bcc66d1-8649-4cfd-9c46-10ba5e1a53b0	f62e9a15-d8a7-4781-a2fc-6df46b37e381	2	11.5	\N
31f61ae9-7949-4b05-9bb6-ba1c8779aeba	5bcc66d1-8649-4cfd-9c46-10ba5e1a53b0	805955bc-5dde-4b98-85a4-a12e4b72f3bd	3	4.6	\N
3d617eed-d1b1-415b-b3f4-5495b17b93f0	5bcc66d1-8649-4cfd-9c46-10ba5e1a53b0	fe55be2a-4c99-4d7a-9694-0ca8304b2809	3	3.8	\N
e37724e9-62db-41e9-a3b2-330df448a471	5bcc66d1-8649-4cfd-9c46-10ba5e1a53b0	080e1bc6-2e5b-485b-a369-99b53586eda3	3	4.8	\N
2713cb05-7ce6-41e3-ac3b-6795283fcba8	5bcc66d1-8649-4cfd-9c46-10ba5e1a53b0	806b7339-7303-414d-8966-d49f02fa804f	1	4.8	\N
19526d5f-e682-4c36-94e3-01d06d06c1f5	5bcc66d1-8649-4cfd-9c46-10ba5e1a53b0	fab4c8b8-6e83-431c-b784-ad3346759365	3	5.6	\N
89c6c0f7-d9d4-4867-8a4b-01c1fe62c99e	5bcc66d1-8649-4cfd-9c46-10ba5e1a53b0	add2d27e-1dd1-4f88-a897-897b0761003e	4	2.2	\N
a81cc594-fffb-4658-9971-80b94eca39f9	5bcc66d1-8649-4cfd-9c46-10ba5e1a53b0	cc9be182-5d90-4abf-9976-823b4e61cd33	8	1.8	\N
fefc5508-b63a-40a6-ac1b-175494ff414c	5bcc66d1-8649-4cfd-9c46-10ba5e1a53b0	9fdde592-74f0-466a-b65b-51c73a356c4f	4	2	\N
7436e86b-80aa-4a10-898d-0091f4bc73ef	5bcc66d1-8649-4cfd-9c46-10ba5e1a53b0	51c5fbd4-d14c-4297-8ee6-32da2fbf65de	4	2	\N
3b771336-5b1a-417d-b1bb-d0749584200d	5bcc66d1-8649-4cfd-9c46-10ba5e1a53b0	ce996f1c-5704-4f6a-8e6b-b407b3bd60c1	3	2.9	\N
72dec19e-96a1-4f2f-ad8a-ca8e6cc96cff	5bcc66d1-8649-4cfd-9c46-10ba5e1a53b0	f25f15a5-b640-4243-9209-7caf329754ff	3	3.2	\N
ea77fdd8-4ac8-4695-bb66-2d992614c0cb	5bcc66d1-8649-4cfd-9c46-10ba5e1a53b0	b47b5b58-6aa2-46d4-a375-7f7a794f762c	3	5.2	\N
fb547346-38ed-49ae-8258-13668e13a087	5bcc66d1-8649-4cfd-9c46-10ba5e1a53b0	788e8ee6-cd6e-4d45-87a1-c62dbec2bd3c	3	8.4	\N
10f6d41f-fb65-4239-b9d7-2116b2286bbb	5bcc66d1-8649-4cfd-9c46-10ba5e1a53b0	35803093-ba4c-4427-988c-d7fa8b6787e1	2	5	\N
a9933fba-c762-4cab-ac75-eeb02ec5a917	5bcc66d1-8649-4cfd-9c46-10ba5e1a53b0	0cf6ae53-d9ae-4269-ac96-f19b8dbdbcb2	4	4.9	\N
c1af4fc8-fe57-48b3-9940-d2c4c9c07fb5	5bcc66d1-8649-4cfd-9c46-10ba5e1a53b0	93b1106e-24ce-4df3-8df8-ba4d21013a0a	2	7.9	\N
1aa40a55-adf2-45d5-a0bc-03708caa5fb0	5bcc66d1-8649-4cfd-9c46-10ba5e1a53b0	32c3ef69-d57b-469b-ac2a-bbf3dec443b5	2	8.3	\N
a9efe627-a99d-4a87-91f2-97ec07f02058	497d0fe0-025c-4816-a934-956f3749b578	1e27b1c6-6ac2-4396-ab9f-748c0d1d87da	3	6.5	\N
11c77c3f-02e7-4617-a367-236a1806e29d	497d0fe0-025c-4816-a934-956f3749b578	8ec7d2c3-8387-40a5-9d8d-3884689d4591	3	6.9	\N
8c6006bf-504b-4507-b51d-26a90fdde51a	497d0fe0-025c-4816-a934-956f3749b578	4eb84e04-a7d4-4632-b48d-37f155aefbe9	3	6.3	\N
38a0cd4b-1b9b-4427-9f8c-a66328e47b23	497d0fe0-025c-4816-a934-956f3749b578	cb879680-3df9-42ab-a917-5866bfa7b144	3	6.95	\N
327589e7-9afb-415b-b1a2-f3dfea6d199e	497d0fe0-025c-4816-a934-956f3749b578	5681cff4-0d71-4661-941a-4df86ccc102d	3	7.6	\N
28646a75-9d31-4889-871e-a7e07e3feb15	497d0fe0-025c-4816-a934-956f3749b578	260618d9-421c-4801-a453-b38f601b95c7	3	6.2	\N
3be7d711-a7f1-4830-aecc-2ebea8142de0	497d0fe0-025c-4816-a934-956f3749b578	1902bd89-bcaf-4e25-9b56-cffaad95854a	6	8.6	\N
c75a7e25-af0f-47d1-afdc-c50751c68aff	497d0fe0-025c-4816-a934-956f3749b578	d44958b7-6c19-4427-a771-3e9eb86a9f48	2	17.9	\N
29768889-0865-48f4-9def-65f8e5935603	497d0fe0-025c-4816-a934-956f3749b578	ce2807b1-b439-49be-9789-78e2124aee22	2	26.9	\N
ba0e920a-0f98-46c0-b5e0-e9cab8348147	497d0fe0-025c-4816-a934-956f3749b578	4ccd9168-98ae-4077-a18e-8d9d034698fb	9	4.6	\N
535ba40a-3c01-43e8-9d58-1ab6776eba4d	497d0fe0-025c-4816-a934-956f3749b578	fd6d75ec-ec9d-45b2-a7d8-e61240070374	3	6.95	\N
0f900423-71c9-47cf-a5f7-b18a6f6a13f1	497d0fe0-025c-4816-a934-956f3749b578	afc437a4-c6e9-48db-91c5-a5d8d34538dd	6	5	\N
e160d628-69e6-4ba3-a9a8-15a8f2459293	497d0fe0-025c-4816-a934-956f3749b578	3c29b236-58cf-4201-a171-4750ee76a5c5	6	12.5	\N
0c1944af-58f1-4ab4-9837-b52b1ddce445	497d0fe0-025c-4816-a934-956f3749b578	f25aea89-8505-4835-83a4-a302758e84a2	6	2.5	\N
a0f93a13-04c7-47b9-85ae-d9fffa03e3ea	497d0fe0-025c-4816-a934-956f3749b578	3d61be70-f89f-4d27-8b49-1ae3ab2a802c	1	8.6	\N
0b012267-f365-4e84-9842-98d6cff04622	497d0fe0-025c-4816-a934-956f3749b578	0dccea72-e417-4381-b430-0854dc98fd2b	2	8.6	\N
6773fcbb-3d85-4f03-98fc-0b1e6c261e2e	497d0fe0-025c-4816-a934-956f3749b578	4ff4bc90-9ec6-4ef8-b00b-0ea0346642f3	2	13.2	\N
c6d0325a-dcf7-4c62-b93a-ef2b2f4933fa	497d0fe0-025c-4816-a934-956f3749b578	f62e9a15-d8a7-4781-a2fc-6df46b37e381	2	11.5	\N
782dd09b-5384-4312-9913-1986b3cc5c2c	497d0fe0-025c-4816-a934-956f3749b578	805955bc-5dde-4b98-85a4-a12e4b72f3bd	3	4.6	\N
c33ddfb3-475e-47dc-95f2-15a5eb0fbc98	497d0fe0-025c-4816-a934-956f3749b578	fe55be2a-4c99-4d7a-9694-0ca8304b2809	3	3.8	\N
7fa8e0fa-d344-4cc5-84fc-51c76ebd784a	497d0fe0-025c-4816-a934-956f3749b578	080e1bc6-2e5b-485b-a369-99b53586eda3	3	4.8	\N
46d7954c-e8d1-40b4-bf21-94487a8879b0	497d0fe0-025c-4816-a934-956f3749b578	806b7339-7303-414d-8966-d49f02fa804f	1	4.8	\N
98ae8b38-8083-46eb-a480-39648c3313fe	497d0fe0-025c-4816-a934-956f3749b578	fab4c8b8-6e83-431c-b784-ad3346759365	3	5.6	\N
30b55465-2561-49d7-836a-eb250757c292	497d0fe0-025c-4816-a934-956f3749b578	add2d27e-1dd1-4f88-a897-897b0761003e	4	2.2	\N
546b845b-36f0-43a1-98ed-cc12b1f29d8b	497d0fe0-025c-4816-a934-956f3749b578	cc9be182-5d90-4abf-9976-823b4e61cd33	8	1.8	\N
74af6b57-7fe8-4eff-962a-b7e47fa7242b	497d0fe0-025c-4816-a934-956f3749b578	9fdde592-74f0-466a-b65b-51c73a356c4f	4	2	\N
6e00adb5-cdf8-4f40-a98d-20576d80fa10	497d0fe0-025c-4816-a934-956f3749b578	51c5fbd4-d14c-4297-8ee6-32da2fbf65de	4	2	\N
fdc9a565-b2e8-48ee-a3db-799a937c8eff	497d0fe0-025c-4816-a934-956f3749b578	ce996f1c-5704-4f6a-8e6b-b407b3bd60c1	3	2.9	\N
06f8a35d-9092-4810-8443-6b52acb19657	497d0fe0-025c-4816-a934-956f3749b578	f25f15a5-b640-4243-9209-7caf329754ff	3	3.2	\N
fcb5bac6-33b8-4e6a-8c34-e7dc2b12eeb3	497d0fe0-025c-4816-a934-956f3749b578	b47b5b58-6aa2-46d4-a375-7f7a794f762c	3	5.2	\N
9e240ed7-f7ea-4e97-b4a8-4cdcfca5a8aa	497d0fe0-025c-4816-a934-956f3749b578	788e8ee6-cd6e-4d45-87a1-c62dbec2bd3c	3	8.4	\N
943a84ca-65db-4c57-9d29-c99c5bb7ddc6	497d0fe0-025c-4816-a934-956f3749b578	35803093-ba4c-4427-988c-d7fa8b6787e1	2	5	\N
fe95090f-0323-4203-a9b9-efd36e3a4e8d	497d0fe0-025c-4816-a934-956f3749b578	0cf6ae53-d9ae-4269-ac96-f19b8dbdbcb2	4	4.9	\N
c999f8fc-78eb-411e-84bc-2e785fb2751a	497d0fe0-025c-4816-a934-956f3749b578	93b1106e-24ce-4df3-8df8-ba4d21013a0a	2	7.9	\N
4a53d226-5529-4d61-a132-cc81d978587a	497d0fe0-025c-4816-a934-956f3749b578	32c3ef69-d57b-469b-ac2a-bbf3dec443b5	2	8.3	\N
3afa2331-e002-4f7b-b3f0-4705e1aec3f9	a5aecb35-53c8-4837-a93c-d200fa6fbbdf	5681cff4-0d71-4661-941a-4df86ccc102d	5	7.6	\N
2aeadf79-cc26-4ede-a8de-2b1b28b446bf	a5aecb35-53c8-4837-a93c-d200fa6fbbdf	260618d9-421c-4801-a453-b38f601b95c7	5	6.2	\N
b1559e4c-9d7b-494b-ad51-1ff7445ae140	a5aecb35-53c8-4837-a93c-d200fa6fbbdf	1902bd89-bcaf-4e25-9b56-cffaad95854a	5	6.9	\N
18381d71-3d43-4450-a5de-357eb0991940	a5aecb35-53c8-4837-a93c-d200fa6fbbdf	d44958b7-6c19-4427-a771-3e9eb86a9f48	2	17.9	\N
4094cb40-cf0b-4274-9e1f-f07d52c4b980	a5aecb35-53c8-4837-a93c-d200fa6fbbdf	ce2807b1-b439-49be-9789-78e2124aee22	2	26.9	\N
3bc497f9-d85e-4a54-aaab-bcbb3a3f2399	a5aecb35-53c8-4837-a93c-d200fa6fbbdf	afc437a4-c6e9-48db-91c5-a5d8d34538dd	6	5	\N
4af38814-b05c-4bf5-bc55-57847c77853f	a5aecb35-53c8-4837-a93c-d200fa6fbbdf	3c29b236-58cf-4201-a171-4750ee76a5c5	1	12.5	\N
0cd8c6be-f605-4948-b38b-6352df2bbb92	a5aecb35-53c8-4837-a93c-d200fa6fbbdf	1cea990b-852a-41cc-9216-fa3e3006f2d6	2	12.5	\N
da0f8f3e-c444-417a-ae86-3cb31ded6047	a5aecb35-53c8-4837-a93c-d200fa6fbbdf	3d61be70-f89f-4d27-8b49-1ae3ab2a802c	1	8.6	\N
5a8a8d42-8df7-42a5-b36a-d20ae3d58e53	a5aecb35-53c8-4837-a93c-d200fa6fbbdf	0dccea72-e417-4381-b430-0854dc98fd2b	1	8.6	\N
b41d636c-71df-4419-a27d-b88596cd34df	a5aecb35-53c8-4837-a93c-d200fa6fbbdf	5b685926-58cb-49cb-a629-c5238a00740a	1	5.2	\N
180a052c-19e2-4448-9d07-0daab963b4a5	a5aecb35-53c8-4837-a93c-d200fa6fbbdf	c747c326-8331-4ec4-b19a-ee3912f4bbec	1	5.2	\N
1c28fbc8-b349-4f6e-97d6-6d01761d25cd	a5aecb35-53c8-4837-a93c-d200fa6fbbdf	4ff4bc90-9ec6-4ef8-b00b-0ea0346642f3	2	13.2	\N
8d62a73d-9f7c-401c-8d87-3a2a816dac31	a5aecb35-53c8-4837-a93c-d200fa6fbbdf	6c2bd3f8-a725-4c6a-bc96-487b8512f477	1	3.8	\N
6f66fd87-13d6-4e05-91f2-568c7a10c817	a5aecb35-53c8-4837-a93c-d200fa6fbbdf	080e1bc6-2e5b-485b-a369-99b53586eda3	2	4.8	\N
f6a72f28-e9cd-4141-a659-41c97e2d270d	a5aecb35-53c8-4837-a93c-d200fa6fbbdf	806b7339-7303-414d-8966-d49f02fa804f	2	4.8	\N
43cf14a4-b72e-41d2-9a31-78e76cbdec9b	a5aecb35-53c8-4837-a93c-d200fa6fbbdf	fab4c8b8-6e83-431c-b784-ad3346759365	1	5.6	\N
4fe7f9cb-9f4a-4762-8fb6-f4c499f39d42	a5aecb35-53c8-4837-a93c-d200fa6fbbdf	51c9a455-1506-4887-ae1d-0f775899174d	1	4.6	\N
7220548b-596d-492f-96e0-c9d29984124e	a5aecb35-53c8-4837-a93c-d200fa6fbbdf	51c9a455-1506-4887-ae1d-0f775899174d	2	4.6	\N
88a0583f-2853-4b18-a16d-0875fb54e41e	a5aecb35-53c8-4837-a93c-d200fa6fbbdf	294ca3f1-937d-4efa-aa8c-864c644fe24b	1	1.6	\N
4bd5041f-ab63-4094-a2e2-98b7972c9cb0	a5aecb35-53c8-4837-a93c-d200fa6fbbdf	294ca3f1-937d-4efa-aa8c-864c644fe24b	1	1.6	\N
2f99b726-152e-4e70-8968-fc6a2a7ab384	a5aecb35-53c8-4837-a93c-d200fa6fbbdf	cc9be182-5d90-4abf-9976-823b4e61cd33	1	1.2	\N
f33f474c-3c83-41ff-900f-bc5e06034c2f	a5aecb35-53c8-4837-a93c-d200fa6fbbdf	9fdde592-74f0-466a-b65b-51c73a356c4f	1	2	\N
e62260f0-e561-49c1-8849-8a30ad1ed385	a5aecb35-53c8-4837-a93c-d200fa6fbbdf	51c5fbd4-d14c-4297-8ee6-32da2fbf65de	1	2	\N
ba63a37e-af6f-4123-b7a3-295bfdb31b0a	a5aecb35-53c8-4837-a93c-d200fa6fbbdf	e3685b83-25e1-4679-a9d0-5fcaa8be1b29	3	4.9	\N
9fd7ccfd-9c8d-4c19-a303-6a7c9d62bb1a	a5aecb35-53c8-4837-a93c-d200fa6fbbdf	0cf6ae53-d9ae-4269-ac96-f19b8dbdbcb2	1	4.9	\N
a1c71e21-60ac-4d79-8d58-1d09296fd8d9	c928f73a-f970-42de-b456-0d0f19dc1497	51c9a455-1506-4887-ae1d-0f775899174d	4	4.6	4
f1842669-915b-41fa-ae3f-b193635b20df	c928f73a-f970-42de-b456-0d0f19dc1497	4ff4bc90-9ec6-4ef8-b00b-0ea0346642f3	2	13.2	2
665b0766-6e0b-473a-bb84-4cb48eabfbf2	c928f73a-f970-42de-b456-0d0f19dc1497	0cf6ae53-d9ae-4269-ac96-f19b8dbdbcb2	1	4.9	1
65acd354-ae54-4e4c-9435-4b3b1e153d33	c928f73a-f970-42de-b456-0d0f19dc1497	fab4c8b8-6e83-431c-b784-ad3346759365	3	5.6	1
0ee25de7-7cd0-428a-9984-695dac7f8bec	c928f73a-f970-42de-b456-0d0f19dc1497	e3685b83-25e1-4679-a9d0-5fcaa8be1b29	1	4.9	1
0d74d346-42f9-4c0a-8a37-0b696d81224c	c928f73a-f970-42de-b456-0d0f19dc1497	fd6d75ec-ec9d-45b2-a7d8-e61240070374	3	6.95	3
516b7821-9918-4939-9a11-10202d6ece28	c928f73a-f970-42de-b456-0d0f19dc1497	9e5e6bce-ec92-4ed8-ba16-b8c2e3b60fe4	2	7.8	2
d5773617-3529-42ae-b71d-4c1ca2812051	c928f73a-f970-42de-b456-0d0f19dc1497	e00843fb-fedb-434a-ae73-f9d8e554151e	1	4.2	1
3684c9ac-e16b-4dd3-8f02-6c6f8efc377c	c928f73a-f970-42de-b456-0d0f19dc1497	5b685926-58cb-49cb-a629-c5238a00740a	1	5.2	1
4478cc29-43d3-4332-9cec-d1f893772bed	c928f73a-f970-42de-b456-0d0f19dc1497	9fdde592-74f0-466a-b65b-51c73a356c4f	2	2	2
b10fb690-2f43-4b75-b66f-bb84863115b9	c928f73a-f970-42de-b456-0d0f19dc1497	2b5872eb-4998-4d04-a96d-338e6e4d9165	1	5.2	1
86dd0cdc-e39c-4be5-bb49-4794146d416d	c928f73a-f970-42de-b456-0d0f19dc1497	cc9be182-5d90-4abf-9976-823b4e61cd33	2	1.8	2
5d84a8c8-35d5-4bab-acea-735f91609c68	c928f73a-f970-42de-b456-0d0f19dc1497	1cea990b-852a-41cc-9216-fa3e3006f2d6	2	12.5	2
4299a963-c298-417a-8773-a4cc8b6710aa	c928f73a-f970-42de-b456-0d0f19dc1497	3c29b236-58cf-4201-a171-4750ee76a5c5	1	12.5	1
a1b1c876-80e4-430a-bef7-312d21bf8769	c928f73a-f970-42de-b456-0d0f19dc1497	51c5fbd4-d14c-4297-8ee6-32da2fbf65de	1	2	1
ba3dc07c-b406-424e-8f7e-46975f12d6da	96a3883b-0c40-40a9-a609-8d78ea2f3ffd	9fac21e5-a8bc-4204-bb35-7dde2cc211e9	6	7.4	\N
fa77bb93-e083-4031-a5e2-7f26b391fd5b	96a3883b-0c40-40a9-a609-8d78ea2f3ffd	fd6d75ec-ec9d-45b2-a7d8-e61240070374	6	5.4	\N
ea690b6f-cd0d-4446-9306-cd61c4dd88ba	96a3883b-0c40-40a9-a609-8d78ea2f3ffd	e00843fb-fedb-434a-ae73-f9d8e554151e	8	4.2	\N
fd46ae49-65c3-4ce5-a232-5e5770cdbcc4	96a3883b-0c40-40a9-a609-8d78ea2f3ffd	2b052187-883e-43a4-bed1-523771b663e0	6	10.4	\N
6575a2e9-da57-4beb-9267-e531c28d4f64	96a3883b-0c40-40a9-a609-8d78ea2f3ffd	3c29b236-58cf-4201-a171-4750ee76a5c5	6	12.5	\N
32f695fd-5426-4cd8-88fe-67a9d92c779b	96a3883b-0c40-40a9-a609-8d78ea2f3ffd	1cea990b-852a-41cc-9216-fa3e3006f2d6	6	12.5	\N
dbf0db9e-0c3d-455a-addc-919e5fb28292	96a3883b-0c40-40a9-a609-8d78ea2f3ffd	3d61be70-f89f-4d27-8b49-1ae3ab2a802c	1	8.6	\N
2c25e82c-2e07-4eb2-a87f-2330d6eb6a2e	96a3883b-0c40-40a9-a609-8d78ea2f3ffd	0dccea72-e417-4381-b430-0854dc98fd2b	2	8.6	\N
b3a81650-8e6a-45f0-8e72-92ee44b9c93a	96a3883b-0c40-40a9-a609-8d78ea2f3ffd	5b685926-58cb-49cb-a629-c5238a00740a	3	5.2	\N
5c05a09c-94d6-4d15-966c-8fed27b4444b	96a3883b-0c40-40a9-a609-8d78ea2f3ffd	c747c326-8331-4ec4-b19a-ee3912f4bbec	3	5.2	\N
3a6dbda9-eaf8-431e-8e12-9796af32333a	96a3883b-0c40-40a9-a609-8d78ea2f3ffd	2b5872eb-4998-4d04-a96d-338e6e4d9165	3	5.2	\N
9fbdad3f-f844-4da1-93c2-756e286b828b	96a3883b-0c40-40a9-a609-8d78ea2f3ffd	4ff4bc90-9ec6-4ef8-b00b-0ea0346642f3	2	13.2	\N
4acd0f38-b0e6-4ef8-adbf-1a3f3cd6ca95	96a3883b-0c40-40a9-a609-8d78ea2f3ffd	f62e9a15-d8a7-4781-a2fc-6df46b37e381	2	11.5	\N
019aa6f1-2f74-4519-b7e6-694a5b3d52b7	96a3883b-0c40-40a9-a609-8d78ea2f3ffd	6c2bd3f8-a725-4c6a-bc96-487b8512f477	3	3.8	\N
da2a9d87-f33a-4aca-81d0-f868fc5c368c	96a3883b-0c40-40a9-a609-8d78ea2f3ffd	080e1bc6-2e5b-485b-a369-99b53586eda3	3	4.8	\N
fd5a1802-1b12-4531-8a15-aadf2d948d8d	96a3883b-0c40-40a9-a609-8d78ea2f3ffd	806b7339-7303-414d-8966-d49f02fa804f	1	4.8	\N
a7b1ca2f-df5f-4734-ba2e-555f56419c19	96a3883b-0c40-40a9-a609-8d78ea2f3ffd	fab4c8b8-6e83-431c-b784-ad3346759365	9	5.6	\N
11143b66-4d40-40af-bef5-4fefdf84f94c	96a3883b-0c40-40a9-a609-8d78ea2f3ffd	51c9a455-1506-4887-ae1d-0f775899174d	9	4.6	\N
cb6c7f8f-4ce7-465c-b54f-279ce918e6f5	96a3883b-0c40-40a9-a609-8d78ea2f3ffd	294ca3f1-937d-4efa-aa8c-864c644fe24b	4	1.8	\N
1f81e7da-19c5-4e4e-9c89-626c0095daeb	96a3883b-0c40-40a9-a609-8d78ea2f3ffd	cc9be182-5d90-4abf-9976-823b4e61cd33	4	1.8	\N
226c56cd-b606-4dc6-aeb1-f4cbdffa5698	96a3883b-0c40-40a9-a609-8d78ea2f3ffd	1fe347d2-0396-4f21-89e0-5a7bb19f3756	4	1.8	\N
e1b2500f-3e91-4010-9a96-dd09bbe8e353	96a3883b-0c40-40a9-a609-8d78ea2f3ffd	9fdde592-74f0-466a-b65b-51c73a356c4f	4	2	\N
8197339c-b814-4fbf-b5f2-7d1b3cf87a59	96a3883b-0c40-40a9-a609-8d78ea2f3ffd	51c5fbd4-d14c-4297-8ee6-32da2fbf65de	4	2	\N
204d10bb-b026-4193-a878-d27ce69c5279	96a3883b-0c40-40a9-a609-8d78ea2f3ffd	9e5e6bce-ec92-4ed8-ba16-b8c2e3b60fe4	4	7.8	\N
59df53ba-80f3-4ddf-95b4-3a210b177c96	96a3883b-0c40-40a9-a609-8d78ea2f3ffd	e3685b83-25e1-4679-a9d0-5fcaa8be1b29	4	4.9	\N
0321dfcb-84c0-428d-82ff-2e6bf4a712de	96a3883b-0c40-40a9-a609-8d78ea2f3ffd	9f2beabc-2da0-4a15-9a98-5192ddbe714b	2	10.2	\N
295d35de-09b1-4d4a-bafb-94241b28ff4c	96a3883b-0c40-40a9-a609-8d78ea2f3ffd	8890477e-792f-4ccc-bfa4-efa5d19cbba3	2	15.8	\N
004f8089-68d6-4dc4-becf-3a98645753d0	96a3883b-0c40-40a9-a609-8d78ea2f3ffd	0cf6ae53-d9ae-4269-ac96-f19b8dbdbcb2	4	4.9	\N
13a2eca5-7048-4c7f-bb02-6e462c16a5b5	96a3883b-0c40-40a9-a609-8d78ea2f3ffd	4bee824c-e816-4b4a-9027-7c6cb4e495da	4	4.5	\N
a38d666c-1151-43a3-abe3-e69756c19b7d	e180b730-6ed9-413d-8ed1-059262fcb80e	4bee824c-e816-4b4a-9027-7c6cb4e495da	1	4.5	1
d128dca0-75f8-4f2e-805b-087de0239b4e	e180b730-6ed9-413d-8ed1-059262fcb80e	0cf6ae53-d9ae-4269-ac96-f19b8dbdbcb2	1	4.9	1
745f20be-b3d1-4bcd-9b57-bf297b264a29	e180b730-6ed9-413d-8ed1-059262fcb80e	9f2beabc-2da0-4a15-9a98-5192ddbe714b	1	10.2	1
fa795395-525c-4328-a69c-2cc396296a28	e180b730-6ed9-413d-8ed1-059262fcb80e	51c5fbd4-d14c-4297-8ee6-32da2fbf65de	2	2	2
3941400e-1af2-4e13-a65c-2381b05a7896	e180b730-6ed9-413d-8ed1-059262fcb80e	294ca3f1-937d-4efa-aa8c-864c644fe24b	2	1.8	2
1f47b9dc-cdad-4e72-a0df-8ef579b6e493	e180b730-6ed9-413d-8ed1-059262fcb80e	cc9be182-5d90-4abf-9976-823b4e61cd33	1	1.8	1
05b13f77-7303-4b4f-803c-e77cb19d957f	e180b730-6ed9-413d-8ed1-059262fcb80e	9fdde592-74f0-466a-b65b-51c73a356c4f	2	2	2
7fe57757-9145-49a2-862c-5b1527d0c63b	e180b730-6ed9-413d-8ed1-059262fcb80e	51c9a455-1506-4887-ae1d-0f775899174d	1	4.6	1
8259c80b-02d3-4151-a7b1-329c0fa0db74	e180b730-6ed9-413d-8ed1-059262fcb80e	fab4c8b8-6e83-431c-b784-ad3346759365	2	5.6	2
c9360dea-3668-41ae-b8f2-4b59240bb139	e180b730-6ed9-413d-8ed1-059262fcb80e	080e1bc6-2e5b-485b-a369-99b53586eda3	2	4.8	2
bb04f2de-244c-46bc-a55c-824480dc6ecd	e180b730-6ed9-413d-8ed1-059262fcb80e	6c2bd3f8-a725-4c6a-bc96-487b8512f477	2	3.8	2
56d7bf58-a42e-4290-93c2-ca6ccc3c7f94	e180b730-6ed9-413d-8ed1-059262fcb80e	5b685926-58cb-49cb-a629-c5238a00740a	1	5.2	1
cb6b44eb-ddd3-4138-a424-7156af727d73	e180b730-6ed9-413d-8ed1-059262fcb80e	2b052187-883e-43a4-bed1-523771b663e0	1	10.4	1
6975ba77-b076-4be0-865a-e67162085a69	e180b730-6ed9-413d-8ed1-059262fcb80e	1cea990b-852a-41cc-9216-fa3e3006f2d6	2	12.5	2
44f50785-aa1f-4b55-8c90-e3ea513255a1	e180b730-6ed9-413d-8ed1-059262fcb80e	e00843fb-fedb-434a-ae73-f9d8e554151e	4	4.2	4
6afb35ee-1222-4a13-a852-a19966b9ad3f	e180b730-6ed9-413d-8ed1-059262fcb80e	fd6d75ec-ec9d-45b2-a7d8-e61240070374	1	6.95	1
5a6c4a99-805d-442a-9b1a-a69e94f7d14f	e180b730-6ed9-413d-8ed1-059262fcb80e	9fac21e5-a8bc-4204-bb35-7dde2cc211e9	5	7.4	5
6c9697eb-cf38-4886-ae70-e0037737d08e	e180b730-6ed9-413d-8ed1-059262fcb80e	f62e9a15-d8a7-4781-a2fc-6df46b37e381	2	11.5	2
14cdfed8-fd9e-4283-891b-7efb8507f5d3	e180b730-6ed9-413d-8ed1-059262fcb80e	4ff4bc90-9ec6-4ef8-b00b-0ea0346642f3	2	13.2	2
dc40762d-af30-405f-a329-79fbc84e08ea	868ad57d-a8eb-4cd6-b354-d93c9865fea1	cc9be182-5d90-4abf-9976-823b4e61cd33	1	\N	\N
4735476c-7c7d-484f-bdc6-d100f1d41c82	d6045564-6e2c-475f-ae64-23e30e6728bb	8890477e-792f-4ccc-bfa4-efa5d19cbba3	1	15.8	\N
6173f4db-1a2b-4bfa-aeb2-82ffb7083390	680bd5d0-d3fc-44df-8e4f-7356b6ed51a1	8890477e-792f-4ccc-bfa4-efa5d19cbba3	2	15.8	1
6b8fed1b-8e49-487d-8885-082606581286	60e59777-c6aa-46ce-b28e-ccd43164ca5f	8890477e-792f-4ccc-bfa4-efa5d19cbba3	1	15.8	\N
df2344b7-348a-4f15-9676-3faa81518e06	6e543ab4-cd2f-44a8-a3d4-f9481b927532	8890477e-792f-4ccc-bfa4-efa5d19cbba3	1	15.8	1
8eaf0594-7489-4a4a-86f4-5c768c997e8a	52c01e8d-b0bc-4228-9d64-14d6465eee7a	8890477e-792f-4ccc-bfa4-efa5d19cbba3	3	15.8	\N
f123fe8a-085c-42a9-8dac-fb63d2a5c31f	309766ea-474c-48d7-a4e7-fc87ef482ff9	8890477e-792f-4ccc-bfa4-efa5d19cbba3	1	15.8	1
d57cb728-a7df-4e24-87a5-4a2e3bf0c09d	4496a8a8-d958-4a34-aafd-7fa107202bfa	8890477e-792f-4ccc-bfa4-efa5d19cbba3	3	15.8	\N
71915f20-762e-4d7d-9238-1a3adc74eeac	769b9fea-73d6-4f79-be7f-9fcff594251b	8890477e-792f-4ccc-bfa4-efa5d19cbba3	3	15.8	\N
9e6618f8-cf4b-4705-8ec7-ceaa833b3a95	116e45f5-7ecc-47a9-8a67-9393ea59afd1	bad109cb-d782-461d-8e7a-323df5b02c78	17	54.8	\N
462a71a4-44af-4e88-be63-6777073781c6	116e45f5-7ecc-47a9-8a67-9393ea59afd1	c7a6c45e-4a7a-4f2e-92da-1855938f9ffd	10	19	\N
07333278-069c-436a-8e7b-3a6040244c5b	116e45f5-7ecc-47a9-8a67-9393ea59afd1	92457660-b3be-4cd7-bfec-9bcc6c014972	10	37	\N
8172616c-079d-4bca-b2eb-855425257750	116e45f5-7ecc-47a9-8a67-9393ea59afd1	2c6940a2-09a5-4dc0-b333-32e55797a54e	26	18.5	\N
a80fcd76-2e9b-4890-b419-ec10fecda033	116e45f5-7ecc-47a9-8a67-9393ea59afd1	ae377a03-a318-482a-8fda-c11e579ae794	15	30.2	\N
a90bee8c-720a-4ad2-b6f7-ae23868b4f1c	116e45f5-7ecc-47a9-8a67-9393ea59afd1	f5241d62-3222-456c-8ebf-1df6a42a0936	12	25	\N
\.


--
-- TOC entry 3626 (class 0 OID 37980)
-- Dependencies: 222
-- Data for Name: Partner; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Partner" (id, name, bulstat, "contactPerson", phone, address, mol, city, country, "percentageDiscount") FROM stdin;
1322	ГРАМИ 1 ООД	BG203170141			Христо Ботев 24	Невена Делчева Милева	Минерални Бани	България	0
1613	НИКО ООД	BG123529024			Георги Димитров 55	НИКОЛАЙ ДИМИТРОВ ИВАНОВ	Гълъбово	България	0
1616	КИЛЕРА 2003 ООД	BG126636063			бул.БЪЛГАРИЯ № 168a	Алеко Санков Банчев	Хасково	България	0
1513	ХАЙ ЛЕВЕЛ ЛИМИТЕД ЕОО	BG206740988	Димитър - Управител	0896228337	Дунав 19А	ДЯНКО ПРОДАНОВ ДЕЧЕВ	Хасково	България	0
1628	ЕНЕВ БД ЕООД	BG205618807	Боряна Енева	0894863555	ул. „Заводска” № 4, ет. 1, ап. 1	БОРЯНА ПЕТРОВА ЕНЕВА	Раднево	България	0
1644	МАГИ НАК ООД	BG201695400	Жечка Николова Колева		с. Стамболово	Жечка Николова Колева	с. Стамболово	България	0
1645	ГРАНДЕ 15 ЕООД	BG203354757	СТОЙЧО ДИМИТРОВ СТОЙЧЕВ		ул. Републиканска, бл. 43, вх. Б, ет. 3, ап. 15	СТОЙЧО ДИМИТРОВ СТОЙЧЕВ	Любимец	България	0
1646	ТЕО И СЛАВЕЯ ЕООД	200847015	Славея	ТЕО И СЛАВЕЯ ЕООД	ул. "Оборище" 16	РУСИ ДЕЛЧЕВ РУСЕВ	Минерални Бани	България	0
\.


--
-- TOC entry 3644 (class 0 OID 43834)
-- Dependencies: 240
-- Data for Name: Payment; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Payment" (id, "cashRegisterId", "revisionId", "invoiceId", amount, method, "userId", "createdAt") FROM stdin;
17a5404d-d944-4b4f-9456-4c9294ba7b85	afecdfd0-3271-4efe-9bf5-6e32df4bc47e	93819b33-84f4-41be-97b2-f5aea3e5b327	\N	62.4	BANK	74a1cd5c-8ae8-40c4-b117-c7530a461026	2025-08-05 08:15:49.572
71b5cef9-1b28-4848-af42-5ed501de0220	afecdfd0-3271-4efe-9bf5-6e32df4bc47e	e2e85fb2-1a29-4b83-882c-e591377be0d7	\N	277.42	BANK	74a1cd5c-8ae8-40c4-b117-c7530a461026	2025-08-05 08:34:30.431
fbb85bc2-599d-4998-9b30-14420c4794b9	afecdfd0-3271-4efe-9bf5-6e32df4bc47e	e2e85fb2-1a29-4b83-882c-e591377be0d7	\N	0.02	BANK	74a1cd5c-8ae8-40c4-b117-c7530a461026	2025-08-05 08:35:46.733
fd49d9c3-4cd8-4a96-b56a-9d7718a315d3	dc5fe187-9d7b-4512-9fa7-a2efceb50d68	c928f73a-f970-42de-b456-0d0f19dc1497	\N	169.55	CASH	68b9923d-7800-4662-905e-a906d131314b	2025-08-11 11:35:39.758
\.


--
-- TOC entry 3621 (class 0 OID 37939)
-- Dependencies: 217
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Product" (id, name, barcode, "clientPrice", pcd, quantity, active, "createdAt", "deliveryPrice", image) FROM stdin;
9fac21e5-a8bc-4204-bb35-7dde2cc211e9	Зарядно за кола 30W + кабел CC70, черен	6975837583214	7.4	14.90	36	t	2025-07-21 09:49:30.457	7.4	https://cdn.omax.bg/images/products/resized/5/9/0/6/9/c/omax.bg-xo-cc70-4.jpeg
2b052187-883e-43a4-bed1-523771b663e0	Стенно зарядно 20W L154, черен	6975837582262	10.4	19.90	36	t	2025-07-21 09:49:30.689	10.4	https://cdn.omax.bg/images/products/resized/5/9/0/9/7/c/omax.bg-xo-l154-5.jpeg
2b5872eb-4998-4d04-a96d-338e6e4d9165	Слушалки с жак S6, бял	6920680852772	5.2	8.90	18	t	2025-07-21 09:49:31.155	5.2	https://cdn.omax.bg/images/products/resized/3/7/0/4/1/c/skyphone.bg-hf-xo-s6-white-3.jpg
e3685b83-25e1-4679-a9d0-5fcaa8be1b29	Стойка за телефон C122, черен	6920680835713	4.9	8.90	20	t	2025-07-21 09:49:31.996	4.9	https://cdn.omax.bg/images/products/resized/4/6/8/9/4/c/skyphone.bg-holder-xo-c122-3.jpeg
e8f1cae1-5336-4c75-a872-5943618b4c9e	Възглавница за кръст C20036401111-00, черен	6932172643607	27.04	38	0	t	2025-08-13 08:10:55.974	27.55	https://cdn.omax.bg/images/products/full/5/7/0/7/7/c/skyphone.bg-silk-car-lumbar-pillow-baseus-comfortride-series-black-5.jpg
bf3f2a3c-1056-4228-a73c-db34a6c69955	Възглавница за кръст CNYZ000013, сив	6932172621483	18.66	38	0	t	2025-08-13 08:09:35.759	27.55	https://cdn.omax.bg/images/products/full/5/7/0/7/5/c/skyphone.bg-car-lumbar-pillow-baseus-comfort-ride-grey-4.jpg
83f830e9-5f80-4dce-a5ce-254247e5d736	Паркинг визитка за тел. номер ACNUM-01, черен	6953156270749	13.69	22.99	3	t	2025-07-21 09:46:50.591	13.69	https://cdn.omax.bg/images/products/resized/5/7/0/7/9/c/skyphone.bg-baseus-parking-acnum-01.jpg
56ace9b9-6f96-4d5e-bba7-70f04c7c2681	Кабел C-L CAJY000201, 1.2 м, черен	6932172602741	5.56	18.99	3	t	2025-07-21 09:46:50.405	5.56	https://cdn.omax.bg/images/products/resized/4/9/4/4/8/c/skyphone.bg-cable-baseus-cajy000201-1.jpeg
4caa71b4-3266-4796-bb04-6f1474b67288	Кабел с три накрайника CAMLTYS-02, бял	6953156205536	5.11	15.99	4	t	2025-07-21 09:46:49.963	5.11	https://cdn.omax.bg/images/products/resized/5/5/8/0/5/c/skyphone.bg-baseus-usb-cable-3in1-superior-series-camltys-02-white-2.jpg
f7864970-9485-41da-86d1-07ba74aa5d5f	Електрическа помпа за надуваеми играчки C11157700221-00	6932172635008	44.8	55	0	t	2025-08-13 08:12:46.572	44.71	https://cdn.omax.bg/images/products/full/5/4/5/8/1/c/skyphone.bg-baseus-mini-pump-c11157700221-00-1.jpeg
ab733dec-baaa-479e-9583-2cf13c7131ec	Слушалки с кабел Type-C NGCR010002, бял	6932172604264	10.21	23.99	2	t	2025-07-21 09:46:50.524	10.21	https://cdn.omax.bg/images/products/resized/4/2/4/8/0/c/skyphone.bg-hf.baseus-ngcr010002-1.jpg
17fa3d84-4419-40ef-b7a7-f144387d913c	Кабел C-L CAJY000301, 2 м, черен	6932172602772	7.65	19.99	2	t	2025-07-21 09:46:48.8	7.65	https://cdn.omax.bg/images/products/resized/4/9/4/5/7/c/skyphone.bg-cable-baseus-cajy000301-1.png
8fdc320a-d74d-4760-8743-31ae9ddba850	Стойка за телефон C40141201G13-00, златен	6932172648756	9.62	18.99	1	t	2025-07-21 09:46:49.745	9.62	https://cdn.omax.bg/images/products/resized/3/4/1/2/0/c/skyphone.bg-air-vent-holder-baseus-gold.jpg
0cf6ae53-d9ae-4269-ac96-f19b8dbdbcb2	Стойка за телефон C55B, черен	6920680871186	4.9	7.99	32	t	2025-07-21 09:49:32.15	4.9	https://cdn.omax.bg/images/products/resized/3/9/0/0/6/c/skyphone.bg_xo_holder_c55b.2.jpg
07749977-e284-493d-bfc4-1c76e19a0a20	Прахосмукачка за кола C30466500111-00	6932172650506	31.9	56	0	t	2025-08-13 08:14:19.672	31.9	https://cdn.omax.bg/images/products/full/5/9/1/5/9/c/omax.bg.bg-car-vacuum-cleaner-baseus-a0-pro-black-2.jpg
79bec11d-46fd-462f-9db1-186a2ccff375	Инвертор CZ021	6920680861514	49.8	75	0	t	2025-08-13 08:15:24.559	49.8	https://cdn.omax.bg/images/products/full/5/7/5/4/1/c/skyphone.bg-xo-car-jump-starter.jpeg
99b64b5b-93e5-4ae1-bbd0-f02b709c82b6	Кабел iPhone CALYS-A02, 1 м, бял	6953156205413	3.26	13.99	4	t	2025-07-21 09:46:50.77	3.26	https://cdn.omax.bg/images/products/resized/3/6/6/0/9/c/skyphone.bg-calys-series-cable.jpg
109d7a24-8924-4c07-9e00-f83363fc21d3	Кабел iPhone CAJY000105, 2 м, лилав	6932172602734	3.59	15.99	5	t	2025-07-21 09:46:50.834	3.59	https://cdn.omax.bg/images/products/resized/4/3/6/6/2/c/skyphone.bg-cable-baseus-cajy000105-7.jpg
a2f70fa6-9483-4535-ad27-fd9c0864098e	Стойка за телефон SUYL-XP0S, сребърен	6953156268777	7.43	13.99	2	t	2025-07-21 09:46:49.88	7.43	https://cdn.omax.bg/images/products/resized/3/5/9/5/8/c/skyphone.bg-baseus-holder-osculume-type.jpg
0e4a534f-44ff-4008-863a-a3bbd336fc93	Зарядно за контакт 30W CE21, бял	6920680853892	12.41	22.99	1	t	2025-07-21 09:47:22.87	12.41	https://cdn.omax.bg/images/products/resized/5/4/9/2/1/c/skyphone.bg-xo-220v-ce21-1.jpeg
4bee824c-e816-4b4a-9027-7c6cb4e495da	Стойка за телефон C82, черен	6920680879571	4.5	8.90	24	t	2025-07-21 09:49:32.204	4.5	https://cdn.omax.bg/images/products/resized/3/9/0/0/5/c/skyphone.bg_xo_holder_c82.1.jpg
9dca60ee-f6a5-4910-84f2-9b504dc7601d	Кабел за музика CAM30-BS1, 1 м, черен	6953156257184	4.67	11.99	2	t	2025-07-21 09:46:50.025	4.67	https://cdn.omax.bg/images/products/resized/3/2/4/8/6/c/skyphone.bg--aux--D0-BA-D0-B0-D0-B1-D0-B5-D0-BB-baseus-yiven-m30-3.jpg
d376a251-cfa6-4aee-af3d-3c14f5098704	Стойка за телефон C40351600113-00, черен	6932172629434	17.08	29	4	t	2025-07-21 09:46:51.003	17.08	https://cdn.omax.bg/images/products/resized/4/7/8/4/1/c/skyphone.bg-baseus-holder-c40351600113-00-1.jpeg
c54f156c-8483-4b77-9745-04661d47e82f	Стойка за телефон SUDZ-A01, черен	6953156224858	10.3	19.99	1	t	2025-07-21 09:46:48.969	10.3	https://cdn.omax.bg/images/products/resized/4/9/5/1/2/c/skyphone.bg-holder-baseus-sudz-a01-1.jpg
80d5432b-878d-4b40-abef-ca31f83db88c	Зарядно за контакт 18W L157, син	6920680859344	7.4	14.99	2	t	2025-07-23 12:00:40.905	7.4	https://cdn.omax.bg/images/products/resized/5/9/0/8/8/c/omax.bg-xo-l157-5.jpeg
0e7eb525-b5e0-443d-81e9-1e8a0c59ca11	Слушалки с кабел Type-C EP81, бял	6920680858873	3.83	9.99	5	t	2025-07-21 09:47:22.245	3.83	https://cdn.omax.bg/images/products/resized/5/7/5/0/7/c/skyphone.bg-xo-headpones-ep81-6.jpeg
b8c7adc6-a08b-43cf-8caa-7c29c42f9f1a	Кабел C-C CAJY000705, 2 м, лилав	6932172602918	7.74	20.99	3	t	2025-07-21 09:46:48.476	7.74	https://cdn.omax.bg/images/products/resized/4/9/4/6/4/c/skyphone.bg-cable-baseus-cajy000705-1.jpeg
b47b5b58-6aa2-46d4-a375-7f7a794f762c	Преходник от Type-C към 3.5 мм NB-R279B, 1м, бял	6920680860203	5.2	9	9	t	2025-08-07 13:56:26.077	5.2	https://cdn.omax.bg/images/products/resized/5/4/9/9/2/c/skyphone.bg-xo-micro-adapter-nb256h-1.jpeg
fe9db831-2d58-4511-af1f-926092ba02e2	Стойка за телефон C40141201913-00, червен	6932172648770	8.52	18.99	1	t	2025-07-21 09:46:49.679	8.52	https://cdn.omax.bg/images/products/resized/5/5/8/4/6/c/skyphone.bg-car-mount-holder-baseus-magnetic-air-vent-red-os-c40141201913-00.jpg
cb879680-3df9-42ab-a917-5866bfa7b144	Зарядно за кола 18W, червен	3800165017380	6.95	10	9	t	2025-08-07 13:56:24.707	6.95	https://cdn.omax.bg/images/products/resized/3/6/7/1/1/c/skyphone.bg-nordic-12v-charger-new-box.jpg
805955bc-5dde-4b98-85a4-a12e4b72f3bd	Кабел за музика NB-R269A, 1 м, черен	6920680855070	4.6	8	9	t	2025-08-07 13:56:25.491	4.6	https://cdn.omax.bg/images/products/resized/5/4/9/5/3/c/skyphone.bg-xo-cable-aux-nb-r269a-1.jpeg
32c3ef69-d57b-469b-ac2a-bbf3dec443b5	Стойка за кола C86, черен	6920680882830	8.3	15	6	t	2025-08-07 13:56:26.36	8.3	https://cdn.omax.bg/images/products/resized/4/0/8/9/6/c/skyphone.bg-holderi-xo-c86-1.jpg
4ccd9168-98ae-4077-a18e-8d9d034698fb	Кабел C-C, 1 м, бял	3800165106589	4.6	10	27	t	2025-08-07 13:56:24.972	4.6	https://cdn.omax.bg/images/products/resized/4/2/6/3/3/c/usbdtypectotypecnordicc1wsp03-1.jpg
788e8ee6-cd6e-4d45-87a1-c62dbec2bd3c	Стойка за кола C113, черен	6920680833184	8.4	15	9	t	2025-08-07 13:56:26.126	8.4	https://cdn.omax.bg/images/products/resized/5/4/9/4/1/c/skyphone.bg-xo-holder-c113-1.jpeg
8ec7d2c3-8387-40a5-9d8d-3884689d4591	Кабел iPhone CALKLF-HG1, 2 м, черен/сив	6953156283374	6.9	12	9	t	2025-08-07 13:56:24.623	6.9	https://cdn.omax.bg/images/products/resized/5/5/8/1/5/c/skyphone.bg-baseus-cafule-double-sided-usb-lightning-cable-1-5a-2m-gray-blackcalklf-hg1.jpg
260618d9-421c-4801-a453-b38f601b95c7	Зарядно за контакт 18W + кабел A-M, HQ-001, бял	3800165002812	6.2	15	14	t	2025-08-07 13:56:24.796	6.2	https://cdn.omax.bg/images/products/resized/4/9/7/8/1/c/skyphone.bg-220v-nordic-hq-001-type-c-white-7.jpg
fe55be2a-4c99-4d7a-9694-0ca8304b2809	Кабел за музика NB-R279C, 1 м, черен	6920680860180	3.8	8	9	t	2025-08-07 13:56:25.533	3.8	https://cdn.omax.bg/images/products/resized/5/9/0/8/1/c/omax.bg-xo-nb-279c.jpeg
d44958b7-6c19-4427-a771-3e9eb86a9f48	Външна батерия 10000mAh, Carbon Slim, черен	3800165027198	17.9	28	8	t	2025-08-07 13:56:24.88	17.9	https://cdn.omax.bg/images/products/resized/4/3/9/6/6/c/skyphone.bg_nordic_powerbank_10000_mah_.jpg
4eb84e04-a7d4-4632-b48d-37f155aefbe9	Кабел Type-C CATKLF-C09, 2 м, червен	6953156278226	6.3	12	9	t	2025-08-07 13:56:24.665	6.3	https://cdn.omax.bg/images/products/resized/5/5/8/3/6/c/skyphone.bg-baseus-cafule-cable-usb-c-2a-2m-red-catklf-c09.jpg
ce996f1c-5704-4f6a-8e6b-b407b3bd60c1	Преходник от Micro USB към USB-C NB256H, бял	6920680851928	2.9	6	9	t	2025-08-07 13:56:25.98	2.9	https://cdn.omax.bg/images/products/resized/5/4/9/9/2/c/skyphone.bg-xo-micro-adapter-nb256h-1.jpeg
1e27b1c6-6ac2-4396-ab9f-748c0d1d87da	Кабел C-C CATKLF-H91 2 м, черен/червен	6953156285248	6.5	12	9	t	2025-08-07 13:56:24.554	6.5	https://cdn.omax.bg/images/products/resized/3/6/6/1/6/c/skyphone.bg-baseus-cafule-type-c-to-type-red-gray.jpg
ce2807b1-b439-49be-9789-78e2124aee22	Външна батерия 20000mAh, Carbon Slim, черен	3800165027211	26.9	38	8	t	2025-08-07 13:56:24.922	26.9	https://cdn.omax.bg/images/products/resized/4/4/0/8/1/c/skyphone.bg_nordic_powerbank_20000_mah.jpg
3aa7200b-4758-4416-b145-66cc8bfc51a2	Слушалки с жак EP57, бял	6920680831067	2.5	7	3	t	2025-08-07 13:56:25.267	2.5	https://cdn.omax.bg/images/products/resized/5/5/0/0/7/c/skyphone.bg-xo-earphones-ep57-white-1.jpeg
f25aea89-8505-4835-83a4-a302758e84a2	Слушалки с жак EP57, черен	6920680831050	2.5	7	15	t	2025-08-07 13:56:25.225	2.5	https://cdn.omax.bg/images/products/resized/5/5/0/0/6/c/skyphone.bg-xo-earphones-ep57-black-1.jpeg
f25f15a5-b640-4243-9209-7caf329754ff	Преходник от Type-C OTG към USB-A NB256B, бял	6920680851867	3.2	6	9	t	2025-08-07 13:56:26.031	3.2	https://cdn.omax.bg/images/products/resized/5/9/0/7/9/c/omax.bg-xo-nb-r279b-2.jpeg
afc437a4-c6e9-48db-91c5-a5d8d34538dd	Зарядно за кола 12W L65, бял	6920680871148	5	9	24	t	2025-08-07 13:56:25.085	5	https://cdn.omax.bg/images/products/resized/3/7/0/7/5/c/skyphone.bg_xo_l65_1.jpg
5681cff4-0d71-4661-941a-4df86ccc102d	Зарядно за контакт 18W + кабел A-C, HQ-001, бял	3800165002805	7.6	15	14	t	2025-08-07 13:56:24.749	7.6	https://cdn.omax.bg/images/products/resized/4/9/7/8/1/c/skyphone.bg-220v-nordic-hq-001-type-c-white-7.jpg
1902bd89-bcaf-4e25-9b56-cffaad95854a	Стенно зарядно 25W, бял	3801046026323	8.6	18	23	t	2025-08-07 13:56:24.838	6.9	https://cdn.omax.bg/images/products/resized/4/9/7/8/1/c/skyphone.bg-220v-nordic-hq-001-type-c-white-7.jpg
3c29b236-58cf-4201-a171-4750ee76a5c5	Стенно зарядно 20W L154 + кабел C-C, черен	6975837582408	12.5	21.90	45	t	2025-07-21 09:49:30.743	12.5	https://cdn.omax.bg/images/products/resized/5/9/0/9/9/c/omax.bg-xo-l154-type-c-type-c.jpeg
51c5fbd4-d14c-4297-8ee6-32da2fbf65de	Кабел Type-C NB200, 1 м, бял	6920680878079	2	6.90	32	t	2025-07-21 09:49:31.882	2	https://cdn.omax.bg/images/products/resized/5/7/5/9/5/c/skyphone.bg-xo-cable-nb200-type-c-white.jpg
86d79e90-029d-4fdf-96a0-84dc8d5f000a	Зарядно за контакт 20W CCSUP-B02, бял	6953156230002	12.72	24.99	4	t	2025-07-21 09:46:49.52	12.72	https://cdn.omax.bg/images/products/resized/4/3/3/7/9/c/skyphone.ccsup-b02-3.jpg
0db8a4ea-09fa-4f1f-99f4-b17a3b2e24ad	Слушалки с кабел Type-C EP81, черен	6920680858866	3.83	9.99	3	t	2025-07-21 09:47:22.292	3.83	https://cdn.omax.bg/images/products/resized/5/7/5/0/6/c/skyphone.bg-xo-headpones-ep81.jpeg
e00843fb-fedb-434a-ae73-f9d8e554151e	Стенно зарядно 12W L99, бял	6920680827879	4.2	8.90	36	t	2025-07-21 09:49:30.634	4.2	https://cdn.omax.bg/images/products/resized/4/3/9/0/0/c/xo-l99-white-1.jpeg
7ef35b0c-e2f2-4d87-b9d9-c9a29703b129	Зарядно за контакт 30W L149, бежов	6920680860081	10.71	19.99	0	t	2025-07-21 09:47:23.102	10.71	https://cdn.omax.bg/images/products/resized/5/7/5/7/1/c/skyphone.bg-xo-charger-l149-5.jpeg
427d7f32-a75f-440e-adf0-f96201d0bc5b	Кабел C-C NB-Q273, 1 м, черен	6920680857722	3.57	9.99	2	t	2025-07-21 09:47:22.668	3.57	https://cdn.omax.bg/images/products/resized/5/4/9/7/3/c/skyphone.bg-xo-cable-q273-black-1.jpeg
eb2a677a-a7d0-41a4-b985-ff96a3788362	Стойка за телефон C96, черен	6920680826339	3.83	6.99	7	t	2025-07-21 09:47:21.951	3.83	https://cdn.omax.bg/images/products/resized/4/0/8/9/8/c/skyphone.bg-holderi-xo-c96b-2.jpg
ac5b9720-e600-41ec-b0ce-e7108feb387d	Кабел за музика NB-R272, 1 м, бял	6920680856718	2.04	6.99	2	t	2025-07-21 09:47:22.339	2.04	https://cdn.omax.bg/images/products/resized/5/4/9/5/2/c/skyphone.bg-xo-cable-aux-nb-r272-white-3.jpeg
0dccea72-e417-4381-b430-0854dc98fd2b	Слушалки с кабел Type-C EP60, бял	3801046029430	8.6	15.90	14	t	2025-07-21 09:49:30.911	8.6	https://cdn.omax.bg/images/products/resized/4/7/4/1/7/c/skyphone.bg-hf-xo-ep60-white-1.jpeg
1fe347d2-0396-4f21-89e0-5a7bb19f3756	Кабел Micro NB200, 1 м, бял	6920680878130	1.8	5.99	12	t	2025-07-21 09:47:22.475	1.8	https://cdn.omax.bg/images/products/resized/5/7/5/9/3/c/skyphone.bg-xo-cable-nb200-micro-white.jpg
1af30ab3-53c1-4a69-9649-4e5f8935087b	Стойка за телефон SUYL-J01, черен	6953156291508	11.01	22.99	4	t	2025-07-21 09:46:36.87	11.01	https://cdn.omax.bg/images/products/resized/3/2/5/1/9/c/skyphone.bg-metal-age-black-1.jpg
be2a2b08-621e-41b8-8d55-0d68cc8d4445	Кабел C-C NB-Q260A, 1 м, бял	6920680853588	3.74	10.99	4	t	2025-07-21 09:47:22.576	3.74	https://cdn.omax.bg/images/products/resized/5/4/9/7/1/c/skyphone.bg-xo-cable-nb-q260a-1.jpeg
daf2f120-5608-4f62-a056-45249b1cc0f4	Селфи стик SS09, черен	6920680828289	9.3	19	0	t	2025-07-21 09:47:22.774	9.3	https://cdn.omax.bg/images/products/resized/4/3/9/3/4/c/skyphone.xo.ss09-2.jpg
bb855a25-83cd-4164-a896-0c417609d1a0	Външна батерия 10000mAh PR246 + кабели: Type-C и Lightning, черен	6920680858958	24.48	37.99	2	t	2025-07-21 09:47:23.57	24.48	https://cdn.omax.bg/images/products/resized/5/7/5/1/4/c/skyphone.bg-xo-pr246-power-bank-7.jpeg
3d61be70-f89f-4d27-8b49-1ae3ab2a802c	Слушалки с кабел Type-C EP60, черен	3801046029423	8.6	15.90	10	t	2025-07-21 09:49:30.86	8.6	https://cdn.omax.bg/images/products/resized/4/7/4/1/6/c/skyphone.bg-hf-xo-ep60-black-01.jpeg
6c2bd3f8-a725-4c6a-bc96-487b8512f477	Кабел за музика AUX NB-R279C, 1 м, черен	6920680860210	3.8	7.90	15	t	2025-07-21 09:49:31.354	3.8	https://cdn.omax.bg/images/products/resized/5/9/0/8/2/c/omax.bg-xo-nb-279c-2.jpeg
93b1106e-24ce-4df3-8df8-ba4d21013a0a	Стойка за кола C69, черен	6920680876723	7.9	16	10	t	2025-07-21 09:47:22.72	7.9	https://cdn.omax.bg/images/products/resized/3/9/0/0/1/c/skyphone.bg_xo_speaker_c69.4.jpg
ba3b4d18-4a3a-42ff-ba3a-f4e64e162978	Кабел C-C CATKLF-AL91, 2 м, червен	6953156216372	7.74	21.99	3	t	2025-07-21 09:46:50.279	7.74	https://cdn.omax.bg/images/products/resized/3/2/5/5/3/c/skypohone.bg-baseus-catklf-al91-1.jpg
53ea0278-453f-4df0-9272-7e55da9b5ecb	Кабел Type-C CATKLF-B91, 1 м, черен/червен	6953156278219	3.94	11.99	3	t	2025-07-21 09:46:50.219	3.94	https://cdn.omax.bg/images/products/resized/2/1/7/8/3/c/baseus-usb-type-c-cable-for-one-plus-6-5t-fast-charge-usb-c-fast-charging.jpg_640x640.jpg
fd2ecaf7-e2ad-4906-9571-0820eaf39fd4	Стойка за телефон SUYL-WL01, черен	6953156279117	14.9	17.99	0	t	2025-07-21 09:46:49.606	14.9	https://cdn.omax.bg/images/products/resized/3/2/5/0/3/c/baseus-future-1.jpg
aee4c76b-b63e-4f5b-89f2-04a1111de40d	Кабел Micro CAMYS-02, 1 м, бял	6953156208490	3.08	9.99	2	t	2025-07-21 09:46:50.897	3.08	https://cdn.omax.bg/images/products/resized/5/5/8/3/3/c/skyphone.bg-baseus-superior-series-cable-usb-to-micro-usb-2a-1m-white-camys-02-2.jpg
51c9a455-1506-4887-ae1d-0f775899174d	Кабел C-C 60W NB-Q190A, , 1 м, бял	6920680880218	4.6	8.90	46	t	2025-07-21 09:49:31.576	4.6	https://cdn.omax.bg/images/products/resized/3/9/1/0/3/c/skyphone.bg_xo_nb-q190a.jpg
32935f08-2ba8-4ed0-9a52-e5cb55848f78	Зарядно за кола CCALL-YS01, черен	6953156286535	10.26	20.99	3	t	2025-07-21 09:46:49.096	10.26	https://cdn.omax.bg/images/products/resized/2/4/3/7/0/c/baseus-pps-30w-car-charger-black-03122018-03-p.jpg
806b7339-7303-414d-8966-d49f02fa804f	Кабел с три накрайника NB173, 1.2 м, червен	3800165055696	4.8	8.90	13	t	2025-07-21 09:49:31.459	4.8	https://cdn.omax.bg/images/products/full/3/7/2/1/2/c/skyphone.bg_xo_nb173_red.jpg
210351fc-7e9c-42ef-923d-8226fc8d2911	Външна батерия 10000mAh PR246 + кабели: Type-C и iPhone, бял	6920680858965	24.48	37.99	0	t	2025-07-21 09:47:23.478	24.48	https://cdn.omax.bg/images/products/resized/5/7/5/1/6/c/skyphone.bg-xo-pr246-power-bank-6.jpeg
d0e59e48-079d-442a-920d-ca5b5741b66f	Кабел за музика AUX NB-R272, 1 м, черен	6920680856701	2.04	6.99	3	t	2025-07-21 09:47:22.384	2.04	https://cdn.omax.bg/images/products/resized/5/4/9/5/1/c/skyphone.bg-xo-cable-aux-nb-r272-black-3.jpeg
a8707b5a-a41c-4bc8-a0fe-c823c45ab014	Външна батерия 10000mAh PR231, бял	6920680851461	37.06	47.99	4	t	2025-07-21 09:47:23.296	37.06	https://cdn.omax.bg/images/products/resized/5/7/5/1/3/c/skyphone.bg-xo-power-bank-pr231-5.jpeg
e1d608d8-f769-4ef7-bae8-5b48aa46f832	Кабел iPhone NB200, 1 м, бял	6920680878017	1.8	5.99	4	t	2025-07-21 10:07:42.846	1.8	https://cdn.omax.bg/images/products/resized/5/7/5/9/1/c/skyphone.bg-xo-cable-nb-200-1.jpg
c747c326-8331-4ec4-b19a-ee3912f4bbec	Слушалки с жак S6, розов	6920680852741	5.2	8.90	14	t	2025-07-21 09:49:31.079	5.2	https://cdn.omax.bg/images/products/resized/3/7/0/3/9/c/skyphone.bg-hf-xo-s6-pink-3.jpg
85e801eb-c962-423d-a7ce-02bf518a18ed	Стойка за телефон SUER-A01, черен	6953156253025	8.66	18.99	3	t	2025-07-21 09:46:49.032	8.66	https://cdn.omax.bg/images/products/resized/1/3/8/5/4/c/productsaaproductasakasky_phone-baseus-small_ear_series-black.jpg
fd6d75ec-ec9d-45b2-a7d8-e61240070374	Зарядно за кола 30W CC69, бял	6975837583184	6.95	10.99	49	t	2025-07-21 09:47:23.054	5.4	https://cdn.omax.bg/images/products/resized/5/9/1/1/1/c/omax.bg-xo-12v-cc69-2.jpeg
9993ceda-cbff-467e-ba33-c9ec45cc4545	Зарядно за контакт 30W CE05, кафяв	3801046025005	14.6	27.99	2	t	2025-07-21 09:47:22.919	14.6	https://cdn.omax.bg/images/products/resized/4/6/8/6/5/c/skyphone.bg-charger-220v-ce05-brown-1.jpeg
9f2beabc-2da0-4a15-9a98-5192ddbe714b	Стойка за телефон C154, черен	6920680861637	10.2	19.90	12	t	2025-07-21 09:49:32.048	10.2	https://cdn.omax.bg/images/products/resized/5/7/5/5/9/c/skyphone.bg-xo-holder-c154-1.jpeg
f62e9a15-d8a7-4781-a2fc-6df46b37e381	Трансмитер 30W BCC17, черен	6920680858545	11.5	22.99	18	t	2025-07-21 09:49:31.294	11.5	https://cdn.omax.bg/images/products/full/5/7/5/4/4/c/skyphone.bg-xo-mp3-car-charger-bcc17-10.jpeg
4edfafe5-16d2-4b03-b375-f771eec43ebe	Кабел iPhone NB-Q166, 1 м, бял	6920680875450	4.25	10.99	3	t	2025-07-21 09:47:22.429	4.25	https://cdn.omax.bg/images/products/resized/3/7/2/4/2/c/skyphone.bg_nb-q166_lightning_white.jpg
6ba14854-edaa-4b99-bbfe-8ab18842cfd7	Стойка за телефон C40141201113-00, черен	6932172648763	9.67	18.99	2	t	2025-07-21 09:46:49.171	9.67	https://cdn.omax.bg/images/products/resized/5/5/8/4/7/c/skyphone.bg-magnetic-car-phone-holder-baseus-air-vent-black-c40141201113-00-7.jpg
83347115-152a-4229-ab10-1a54f258bef1	Зарядно за контакт 20W CCXJ-B02, бял	6953156207240	13.4	26.99	2	t	2025-07-21 09:46:49.466	13.4	https://cdn.omax.bg/images/products/resized/4/3/0/5/9/c/skyphone.ccxj-b01-8.jpg
5b685926-58cb-49cb-a629-c5238a00740a	Слушалки с жак S6, черен	6920680852758	5.2	8.90	14	t	2025-07-21 09:49:30.993	5.2	https://cdn.omax.bg/images/products/resized/3/7/0/3/7/c/skyphone.bg-hf-xo-s6-black-3.jpg
4ff4bc90-9ec6-4ef8-b00b-0ea0346642f3	Трансмитер 15.5W USB-A, USB-A/TF Card slot, USB-C BCC08, черен	6920680835485	13.2	22.90	16	t	2025-07-21 09:49:31.226	13.2	https://cdn.omax.bg/images/products/full/4/6/8/7/3/c/skyphone.bg-mp3-wireless-bcc08-black-5.jpeg
5f983a66-48aa-4419-8951-33bc52217916	Стойка за телефон SUYL-XP09, черен/червен	6953156268784	7.43	13.99	2	t	2025-07-21 09:46:49.812	7.43	https://cdn.omax.bg/images/products/resized/5/5/8/4/9/c/skyphone.bg-baseus-osculum-gravitational-phone-holder-red-suyl-xp01-2.jpg
9e5e6bce-ec92-4ed8-ba16-b8c2e3b60fe4	Стойка за телефон C109, черен	6920680833214	7.8	13.99	29	t	2025-07-21 09:47:23.388	7.8	https://cdn.omax.bg/images/products/resized/5/4/9/4/2/c/skyphone.bg-xo-holder-c109-1.jpeg
3a563d70-1d3b-44ea-aafa-c849430bd9d2	Зарядно за контакт 17W CCXJ020101, черен	6932172606961	11.48	22.99	2	t	2025-07-21 09:46:49.343	11.48	https://cdn.omax.bg/images/products/resized/5/5/7/9/2/c/skyphone.bg-baseus-compact-charger-17w-ccxj020101-5.jpg
8890477e-792f-4ccc-bfa4-efa5d19cbba3	Стойка за телефон C159, сребрист	6975837581647	15.8	29.90	23	t	2025-07-21 09:49:32.1	15.8	https://cdn.omax.bg/images/products/resized/5/9/0/6/8/c/omax.bg-xo-c159-3.jpeg
fab4c8b8-6e83-431c-b784-ad3346759365	Кабел C-L 20W NB-Q189A, бял	6920680880126	5.6	10.9	54	t	2025-07-21 09:49:31.522	5.6	https://cdn.omax.bg/images/products/resized/3/9/0/8/3/c/skyphone.bg_xo_nb-q189a.png
1cea990b-852a-41cc-9216-fa3e3006f2d6	Стенно зарядно 20W L154 + кабел  C-L, черен	6975837582279	12.5	22.90	33	t	2025-07-21 09:49:30.799	12.5	https://cdn.omax.bg/images/products/resized/5/9/0/9/8/c/omax.bg-xo-l154-11.jpeg
05f013ba-9ba8-465b-a9e9-4fa68f95f009	Зарядно за контакт 18W L127, бял	6920680846924	5.78	12.99	1	t	2025-07-21 09:47:22.963	5.78	https://cdn.omax.bg/images/products/resized/5/4/9/1/7/c/skyphone.bg-xo-220v-l127-01.jpeg
9014815a-340b-4092-88ea-208e3c3a5e49	Зарядно за контакт 20W L126, бял	6920680846894	7.82	16.99	4	t	2025-07-21 09:47:23.011	7.82	https://cdn.omax.bg/images/products/resized/5/4/9/1/1/c/skyphone.bg-xo-220v-l126-01.jpeg
f030fd91-27fd-442b-8853-d7fd2e926f5a	Кабел Micro CAMKLF-BG1, 1 м, сив/черен	6953156280335	3.76	11.99	3	t	2025-07-21 09:46:50.136	3.76	https://cdn.omax.bg/images/products/resized/5/5/8/6/0/c/skyphone.bg-baseus-cafule-micro-camklf-bg1-gray-black.jpg
c24fab55-98f3-4bc3-85af-1b820fd61bdb	Кабел iPhone CALKLF-A09, 0.5 м , червен	6953156274921	2.6	9.99	4	t	2025-07-21 09:46:50.35	2.6	https://cdn.omax.bg/images/products/resized/5/5/8/1/7/c/skyphone.bg-baseus-cafule-usb-lightning-cable-2-4a-0-5m-calklf-a09-red.jpg
42acfe5b-87a9-4ec5-a5ee-6ed12b788a99	Слушалки TWS A00023800223-00, бял	6932172657246	17.55	33.99	2	t	2025-07-21 09:46:50.657	17.55	https://cdn.omax.bg/images/products/resized/5/9/1/4/4/c/omax.bg-earphones-tws-baseus-bowie-e18-white-1.jpg
deee6c6c-b5d4-47ee-b253-86beaa0ff763	Кабел Type-C CATYS-01, 1 м, черен	6953156205499	4.16	11.99	3	t	2025-07-21 09:46:50.953	4.16	https://cdn.omax.bg/images/products/resized/5/5/8/5/5/c/skyphone.bg-baseus-superior-series-cable-usb-to-usb-c-66w-catys-01-black-2.jpg
06e735dc-80bf-40c6-ac32-f8e8235350a4	Зарядно за контакт 30W L149, лилав	6920680860111	10.71	19.99	4	t	2025-07-21 09:47:23.156	10.71	https://cdn.omax.bg/images/products/resized/5/7/5/7/2/c/skyphone.bg-xo-charger-l149-4.jpeg
00bceb45-abcb-4fef-9851-591f6f7e601d	Зарядно за кола CCALL-ML02, бял	6953156276529	6.05	13.99	3	t	2025-07-21 09:46:49.232	6.05	https://cdn.omax.bg/images/products/resized/3/5/9/5/6/c/skyphone.bg-baseus-grain-car-charger-white.jpg
ce739dd0-9323-48c1-ad8a-dad515f6ae84	Възглавница за глава CNTZ000013, сив	6932172621452	27.55	38	0	t	2025-08-13 08:06:00.421	21.22	https://cdn.omax.bg/images/products/full/4/6/2/7/6/c/skyphone.bg-baseus-pillow-cntz000013-2.jpeg
89ddb4ec-1f96-422d-8282-7718eadde2e0	Кабел C-C NB-Q265B, 1 м, бял	6920680855056	3.4	8.90	0	t	2025-07-23 12:32:49.396	3.4	https://cdn.omax.bg/images/products/resized/5/4/9/6/8/c/skyphone.bg-xo-cable-lightning-type-c-nb-q265b-white-1.jpeg
20c8d6ce-8cd2-4906-868b-57d398888f11	Кабел C-L NB-Q265A, 1 м, бял	6920680855018	4.8	8.90	0	t	2025-07-23 12:06:45.807	4.8	https://cdn.omax.bg/images/products/resized/5/4/9/6/4/c/skyphone.bg-xo-cable-lightning-type-c-nb-q265a-white-1.jpeg
4dc50df9-ccd4-4dbc-9f17-c91dd60e59c5	Зарядно за кола CC70, черен	6975837583207	5.4	12.90	0	t	2025-07-23 11:51:34.104	5.4	https://cdn.omax.bg/images/products/resized/5/9/0/6/9/c/omax.bg-xo-cc70-4.jpeg
ec3500df-b88d-4385-8191-c5d9da56f8fb	Кабел C-C NB-Q265B, 1 м, син	6920680855032	3.4	8.90	0	t	2025-07-23 12:29:53.701	3.4	https://cdn.omax.bg/images/products/resized/5/4/9/6/6/c/skyphone.bg-xo-cable-lightning-type-c-nb-q265b-blue-1.jpeg
eae451f9-c7d2-48a8-9e4a-b1f99dfd3e36	Кабел iPhone NB212, 1 м, розов	3801046004000	1.8	5.90	0	t	2025-07-23 12:35:00.859	0.85	https://cdn.omax.bg/images/products/full/4/3/9/3/9/c/skyphone.xo.nb212.pink0.png
0b1babfe-7474-490f-bdec-4a85e57e02b6	Кабел Micro NB212, 1 м, син	3801046003966	1.8	5.90	0	t	2025-07-23 12:40:08.626	0.85	https://cdn.omax.bg/images/products/resized/4/3/9/4/1/c/skyphone.xo.nb212-micro-blue-00.png
ebc8666d-ccf2-4ac7-9b56-ea27b46db15a	Кабел Micro NB212, 1 м, розов	3801046003973	1.8	5.90	0	t	2025-07-23 12:41:23.433	0.85	https://cdn.omax.bg/images/products/resized/4/3/9/4/2/c/skyphone.xo.nb212-micro-pink-00.png
c17ea773-f608-4bb6-a71f-d41ee7ea3882	Кабел C-C 60W NB-Q273, 1 м, бял	6920680857401	3.57	9.99	5	t	2025-07-21 09:47:22.622	3.57	https://cdn.omax.bg/images/products/resized/5/4/9/7/5/c/skyphone.bg-xo-cable-q273-white-1.jpeg
3c47788d-21bc-4263-a1f0-a062a6e51a9b	Трансмитер BCC05, черен	6920680827473	13.18	22.99	6	t	2025-07-21 09:47:23.206	13.18	https://cdn.omax.bg/images/products/resized/4/1/1/4/8/c/skyphone.bg-mp3wireless-bcc05-1.jpg
add2d27e-1dd1-4f88-a897-897b0761003e	Кабел iPhone NB230, 1 м, бял	6920680833412	2.2	6.90	12	t	2025-07-23 12:37:51.498	2.2	https://cdn.omax.bg/images/products/resized/4/7/4/5/8/c/skyphone.bg-cable-xo-nb230-white-1.jpeg
cc9be182-5d90-4abf-9976-823b4e61cd33	Кабел Micro NB200, 1 м, черен	6920680878109	1.8	5.99	60	t	2025-07-21 09:47:23.252	1.8	https://cdn.omax.bg/images/products/resized/5/7/5/9/0/c/skyphone.bg-xo-cable-nb-200-black-2.jpg
8def029f-c4b6-4e44-bbd8-24a3798eaf46	Кабел Type-C NB-Q166, 1 м, бял	6920680875498	4.08	8.99	5	t	2025-07-21 09:47:23.343	4.08	https://cdn.omax.bg/images/products/resized/3/7/2/3/8/c/skyphone.bg_xo_nb-q166_typec_white.jpg
43487f82-6bad-489c-b0a4-dc03cd5a5e8d	Преходник за слушалки и микрофон NB-R197, черен	6920680880881	5.02	11.99	3	t	2025-07-21 09:47:22.826	5.02	https://cdn.omax.bg/images/products/resized/5/4/9/5/5/c/skyphone.bg-xo-cable-aux-nb-r197-05.jpeg
8d75a2da-c502-444e-a242-297fe3497d10	Външна батерия 10000mAh MagSafe PR231, син	6920680851485	37.06	47.99	2	t	2025-07-21 09:47:22.073	37.06	https://cdn.omax.bg/images/products/resized/5/7/5/1/1/c/skyphone.bg-xo-power-bank-pr231-9.jpeg
57090686-76e3-4ef8-83fb-e9f27c159566	Външна батерия 10000mAh PR231, лилав	6920680851478	37.06	47.99	2	t	2025-07-21 09:47:23.523	37.06	https://cdn.omax.bg/images/products/resized/5/7/5/1/2/c/skyphone.bg-xo-power-bank-pr231-10.jpeg
57121c57-0f01-4c92-afe3-26ae0d30c968	Зарядно за контакт 17W CCXJ020102, бял	6932172606978	10.73	21.99	2	t	2025-07-21 09:46:49.404	10.73	https://cdn.omax.bg/images/products/resized/5/5/7/9/3/c/skyphone.bg-baseus-compact-charger-17w-ccxj020102-white-5.jpg
7d469886-3b4c-4ac7-8062-d42330c9c8d7	Зарядно за контакт 18W L157, бял	6920680859306	7.4	14.99	2	t	2025-07-23 12:02:31.232	7.4	https://cdn.omax.bg/images/products/resized/5/9/0/8/7/c/omax.bg-xo-l157.jpeg
0bbc5bd9-7485-4ca7-90bc-98b4fc4a7d43	Външна батерия 10000mAh PR246 + кабели: Type-C и iPhone, лилав	6920680858972	24.48	37.99	3	t	2025-07-21 09:47:23.626	24.48	https://cdn.omax.bg/images/products/resized/5/7/5/1/5/c/skyphone.bg-xo-pr246-power-bank-8.jpeg
e69c6728-01d9-4d07-8561-3d967b0f3594	Стойка за телефон C143, бял	6920680857494	5.02	11	3	t	2025-07-21 09:47:22.028	5.02	https://cdn.omax.bg/images/products/resized/5/4/9/4/8/c/skyphone.bg-xo-holder-c143-4.jpeg
294ca3f1-937d-4efa-aa8c-864c644fe24b	Кабел iPhone NB200, 1 м, черен	6920680877980	1.8	5.99	26	t	2025-07-21 09:47:22.524	1.8	https://cdn.omax.bg/images/products/resized/5/7/5/9/0/c/skyphone.bg-xo-cable-nb-200-black-2.jpg
092646d2-18dd-42fe-91cc-d81c7e198c9f	Зарядно за контакт 30W L150, розов	6920680861156	11.8	21.99	0	t	2025-07-23 12:04:31.184	11.8	https://cdn.omax.bg/images/products/resized/5/7/5/6/8/c/skyphone.bg-xo-charger-l150-6.jpeg
7b85853e-d909-413e-8c27-9003ca34f047	Слушалки TWS A00023800533-00, лилав	6932172657239	17.55	33.99	2	t	2025-07-21 09:46:50.712	17.55	https://cdn.omax.bg/images/products/resized/5/9/1/4/5/c/omax.bg-earphones-tws-baseus-bowie-e18-purple-1.jpg
080e1bc6-2e5b-485b-a369-99b53586eda3	Кабел с три накрайника NB173, 1.2 м, червен	3800165055689	4.8	8.90	24	t	2025-07-21 09:49:31.406	4.8	https://cdn.omax.bg/images/products/resized/3/7/2/1/3/c/skyphone.bg_xo_nb173_black.jpg
023384be-4b4b-4b70-9105-b34a33b303a7	Кабел C-C CATYS-B01, 1 м, черен	6953156208438	6.97	17.99	3	t	2025-07-21 09:46:50.078	6.97	https://cdn.omax.bg/images/products/resized/5/5/8/0/6/c/skyphone.bg-baseus-superior-series-cable-usb-c-to-usb-c-100w-1m-black-catys-b01-2.jpg
4ee3536c-5f11-49e4-aa4c-f8a786a7b990	Стойка за телефон C8, черен	6920680883752	2.98	4.99	6	t	2025-07-21 09:47:23.433	2.98	https://cdn.omax.bg/images/products/resized/4/6/8/9/5/c/skyphone.bg-holder-xo-c8-13.jpeg
ae504b55-4776-4560-b106-febe842d47b7	Слушалки с жак NGCR020002, бял	6932172607791	6.76	13.99	2	t	2025-07-21 09:46:50.469	6.76	https://cdn.omax.bg/images/products/resized/5/7/0/9/0/c/skyphone.bg-baseus-encok-h17-earphones-white.jpg
87797d37-7a95-4ec9-8ba3-ccf00dcdb271	Зарядно за контакт 30W L150, бял	6920680861125	11.5	21.99	0	t	2025-07-23 12:05:15.021	11.5	https://cdn.omax.bg/images/products/resized/5/7/5/6/9/c/skyphone.bg-xo-charger-l150.jpeg
9fdde592-74f0-466a-b65b-51c73a356c4f	Кабел Type-C NB200, 1 м, черен	6920680878048	2	6.90	29	t	2025-07-21 09:49:31.813	2	https://cdn.omax.bg/images/products/resized/5/7/5/9/4/c/skyphone.bg-xo-cable-nb200-type-c.jpg
8708c6dc-792c-4cf8-b786-2d49b8f369b6	Кабел Type-C NB230, 1 м, бял	6920680833436	2	6.90	0	t	2025-07-23 12:43:44.079	2	https://cdn.omax.bg/images/products/resized/4/7/4/6/2/c/skyphone.bg-cable-xo-nb230-white-2.jpeg
1ad1735b-92af-4d6d-942a-44e9f04f508a	Слушалки TWS X33, син	6920680856749	17.6	34.90	0	t	2025-07-31 12:32:19.479	17.6	https://cdn.omax.bg/images/products/resized/5/5/0/1/2/c/skyphone.bg-xo-tws-x33-blue-1.jpeg
5fd0b627-1f79-45fb-826b-b3e8a5d0b73f	Слушалки TWS X33, черен	6920680856732	17.6	34.90	0	t	2025-07-31 12:30:26.555	17.6	https://cdn.omax.bg/images/products/resized/5/5/0/1/1/c/skyphone.bg-xo-tws-x33-black-1.jpeg
09a4ea80-488c-4e18-8f40-d2e1667e87a3	Кабел Type-C NB230, 1 м, черен	6920680833443	2	6.90	0	t	2025-07-23 12:43:02.379	2	https://cdn.omax.bg/images/products/full/4/7/4/6/1/c/skyphone.bg-cable-xo-nb230-black-2.jpeg
cbd45ff9-8138-4615-a38e-7b4972dd894b	Външна батерия 10000mAh PR251, бял	6920680860579	18.4	29.90	0	t	2025-07-31 13:25:18.527	18.4	https://cdn.omax.bg/images/products/resized/5/7/5/2/2/c/skyphone.bg-xo-power-bank-pr251111-2.jpg
b03492f9-5a9b-414d-a31e-f27f8a0d555d	Пътен адаптер WL01, черен	6920680871278	14.9	29.90	0	t	2025-07-31 13:34:27.677	14.9	https://cdn.omax.bg/images/products/resized/3/7/3/6/9/c/skyphone.bg_xo_wl01first.jpg
3f4857ce-1579-4ac1-98a3-dd813e9e47db	Кабел Micro NB212, 1 м, черен	3801046003959	1.8	5.90	0	t	2025-07-23 12:38:55.047	1.8	https://cdn.omax.bg/images/products/resized/4/3/9/4/0/c/skyphone.xo.nb212-micro-black-00.png
ac95686c-54af-48f8-9f4a-d3b2db5ff3c8	Външна батерия 10000mAh PR251, черен	6920680860487	18.4	29.90	0	t	2025-07-31 13:24:49.557	18.4	https://cdn.omax.bg/images/products/resized/5/7/5/2/1/c/skyphone.bg-xo-power-bank-pr251111.jpg
01db1a2e-3611-455b-b881-7c42f9da644b	Трансмитер 1A+1C+TF slot BCC09, черен	6920680835492	19	38	0	t	2025-07-31 12:28:13.751	19	https://cdn.omax.bg/images/products/resized/4/6/8/7/5/c/skyphone.bg-mp3-wireless-bcc09-black-1.jpeg
70600415-bd47-49e1-8d04-6af7d69c042f	Слушалки TWS X33, бял	6920680856763	17.6	34.90	0	t	2025-07-31 13:23:07.625	17.6	https://cdn.omax.bg/images/products/resized/5/5/0/1/4/c/skyphone.bg-xo-tws-x33-white-1.jpeg
f9f06faf-2d7c-4126-9e9a-3c81918bf186	Слушалки TWS X33, зелен	6920680856756	17.6	34.90	0	t	2025-07-31 13:22:16.577	17.6	https://cdn.omax.bg/images/products/resized/5/5/0/1/3/c/skyphone.bg-xo-tws-x33-green-1.jpeg
bad109cb-d782-461d-8e7a-323df5b02c78	Сешоар Hair dryer Madison	3801046018724	54.8	69	17	t	2025-07-28 09:47:50.353	54.8	https://cdn.omax.bg/images/products/full/4/6/1/4/1/c/skyphone.bg-hair-dyer-madison.jpg
c6eacdb6-5f77-49a6-b3f7-3befef4e9881	Стойка за телефон SUYL-LG01, черен	6953156222731	7.72	15.99	3	t	2025-07-24 08:03:30.803	7.72	https://cdn.omax.bg/images/products/resized/4/7/8/2/3/c/skyphone.bg-baseus-holder-suyl-lg01-1.jpeg
06966b0f-741f-45a8-b797-b897527e51ca	Външна батерия 10000mAh MagSafe PR264, бял	6920680862535	26.4	44.90	0	t	2025-07-31 13:26:53.183	26.4	https://cdn.omax.bg/images/products/resized/5/9/1/0/6/c/omax.bg-xo-pr264-3.jpeg
a11d92c3-fbc0-42d5-99e3-06d2e20e8935	Външна батерия 10000mAh MagSafe PR264, черен	6920680862528	26.4	44.90	0	t	2025-07-31 13:26:08.187	26.4	https://cdn.omax.bg/images/products/resized/5/9/1/0/5/c/omax.bg-xo-pr264-4.jpeg
92864630-c64f-4863-8a36-c2b51ea035e8	Зарядно за контакт 18W L157, розов	6920680859382	7.4	14.99	2	t	2025-07-24 08:11:18.056	7.4	https://cdn.omax.bg/images/products/resized/5/9/0/8/9/c/omax.bg-xo-l157-2.jpeg
07f2003d-ce14-4365-b182-990eddb2bf1c	Стойка за телефон C151, черен	6920680859177	3.9	8.99	0	t	2025-07-23 12:47:19.196	3.9	https://cdn.omax.bg/images/products/resized/5/7/5/8/0/c/skyphone.bg-xo-c151-5.jpeg
acefd02a-9655-4f3e-8fd7-16566bdb7428	Стойка за телефон C160, сребрист	6975837581654	9.4	16.90	0	t	2025-07-31 13:28:34.55	9.4	https://cdn.omax.bg/images/products/resized/5/9/0/6/7/c/omax.bg-xo-c160.jpeg
09473aa4-91ba-4ac6-b421-0131b27668f4	Зарядно за контакт 30W L156, черен	6975837582316	13.5	22.99	3	t	2025-07-24 08:19:33.496	13.5	https://cdn.omax.bg/images/products/full/5/9/0/9/4/c/omax.bg-xo-l156.jpeg
8c5d3590-8de1-49eb-852b-5b00a2d95d65	Зарядно за контакт 30W, L149, бял	6920680860050	10.71	19.99	4	t	2025-07-24 08:16:23.163	10.71	https://cdn.omax.bg/images/products/full/5/7/5/7/3/c/skyphone.bg-xo-charger-l149-6.jpeg
35803093-ba4c-4427-988c-d7fa8b6787e1	Стойка за кола C41, черен	6920680871063	5	7.99	6	t	2025-07-23 12:48:23.249	5	https://cdn.omax.bg/images/products/resized/3/9/0/0/9/c/skyphone.bg_xo_holder_c41.12.jpg
c7a6c45e-4a7a-4f2e-92da-1855938f9ffd	Преса за коса CF25, черен	6920680858118	19	29	10	t	2025-07-28 13:50:36.915	19	https://cdn.omax.bg/images/products/full/5/7/6/1/0/c/skyphone.bg-xo-cf-25-hair.jpeg
92457660-b3be-4cd7-bfec-9bcc6c014972	Парна ютия CF3, бял	6920680842711	36.9	51	10	t	2025-07-28 13:55:16.037	37	https://cdn.omax.bg/images/products/full/5/5/0/5/6/c/skyphone.bg-xo-steamer-cf3-1.jpeg
2c6940a2-09a5-4dc0-b333-32e55797a54e	Лифтинг масажор FG05, бял	6920680860753	18.5	28	26	t	2025-07-28 13:52:18.869	18.5	https://cdn.omax.bg/images/products/full/5/9/0/5/9/c/omax.bg-xo-fg05-beautiful-neck-17.jpeg
ae377a03-a318-482a-8fda-c11e579ae794	Масажор FG02, сребрист	6920680860722	30.2	51	15	t	2025-07-28 13:56:49.382	30.2	https://cdn.omax.bg/images/products/full/5/9/0/5/6/c/omax.bg-xo-massage-fg02-8.jpeg
f5241d62-3222-456c-8ebf-1df6a42a0936	Електрическа четка за зъби FG04, бял	6920680860746	25	38	12	t	2025-07-28 13:53:43.056	25	https://cdn.omax.bg/images/products/full/5/9/0/5/8/c/omax.bg-xo-dental-cleaner-5.jpeg
3b28d603-25cc-488c-b6ae-3923ab762c78	Възглавница за глава C20036402111-00, черен	6932172634674	27.55	38	0	t	2025-08-13 08:08:19.127	27.55	https://cdn.omax.bg/images/products/full/5/7/0/7/4/c/skyphone.bg-car-cooling-headrest-clu-baseus-comfortride-series-car-black-3.jpg
\.


--
-- TOC entry 3634 (class 0 OID 38044)
-- Dependencies: 230
-- Data for Name: Refund; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Refund" (id, "userId", "sourceType", "sourceId", "createdAt", "returnedToStorageId", "returnedAt", note) FROM stdin;
874e9c81-5fcc-48c8-b26a-fe1d64be0ddd	74a1cd5c-8ae8-40c4-b117-c7530a461026	STAND	48ddc9fc-b2da-4efa-a1ab-89b261ed4c22	2025-08-05 07:48:33.22	6b5f66af-bd69-492f-8ee3-5ca726b5b8cc	2025-08-05 07:50:33.976	
d04622d0-c967-46ad-bfab-35354dc4517b	74a1cd5c-8ae8-40c4-b117-c7530a461026	STAND	48ddc9fc-b2da-4efa-a1ab-89b261ed4c22	2025-08-05 07:49:50.335	6b5f66af-bd69-492f-8ee3-5ca726b5b8cc	2025-08-05 07:50:43.757	
8db159e2-5cb2-47a4-af13-b704906fca83	68b9923d-7800-4662-905e-a906d131314b	STAND	73e62de1-16b3-4025-aa1c-d08eb91e0b54	2025-08-12 07:49:20.159	\N	\N	Ot klient
\.


--
-- TOC entry 3635 (class 0 OID 38052)
-- Dependencies: 231
-- Data for Name: RefundProduct; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."RefundProduct" (id, "refundId", "productId", quantity, "priceAtRefund") FROM stdin;
d020b7c3-1642-4ed8-a4c6-90b85bd9fa6e	874e9c81-5fcc-48c8-b26a-fe1d64be0ddd	2b052187-883e-43a4-bed1-523771b663e0	4	10.4
c09267e3-95cd-46fe-83b1-1fff5a9e54c7	d04622d0-c967-46ad-bfab-35354dc4517b	2b052187-883e-43a4-bed1-523771b663e0	2	10.4
1ec816e7-aaa3-416d-9e15-4a450d335f83	8db159e2-5cb2-47a4-af13-b704906fca83	9fac21e5-a8bc-4204-bb35-7dde2cc211e9	1	7.4
\.


--
-- TOC entry 3628 (class 0 OID 37995)
-- Dependencies: 224
-- Data for Name: Revision; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Revision" (id, number, "standId", "storageId", "partnerId", "userId", "createdAt", type, status, "checkId") FROM stdin;
b836f3d9-7cee-4fc6-8ef5-a43865231fde	4	722957e4-24b4-4fef-a9de-eb3dfddadb3f	\N	1616	74a1cd5c-8ae8-40c4-b117-c7530a461026	2025-08-01 14:14:04.048	import	NOT_PAID	\N
5ccb35e1-c839-40c3-ad96-702ed547cae6	5	90b3cae4-e222-4463-aa5a-2bdfdbee08e8	\N	1513	74a1cd5c-8ae8-40c4-b117-c7530a461026	2025-08-01 14:14:52.943	import	NOT_PAID	\N
085d18e9-8d9b-4a7c-8277-f77bd332344e	6	158bf47a-1079-4ecb-b58d-0e5c88e05588	\N	1513	74a1cd5c-8ae8-40c4-b117-c7530a461026	2025-08-01 14:15:26.373	import	NOT_PAID	\N
93819b33-84f4-41be-97b2-f5aea3e5b327	7	48ddc9fc-b2da-4efa-a1ab-89b261ed4c22	\N	1628	74a1cd5c-8ae8-40c4-b117-c7530a461026	2025-08-05 07:51:28.277	manual	NOT_PAID	\N
e2e85fb2-1a29-4b83-882c-e591377be0d7	2	73e62de1-16b3-4025-aa1c-d08eb91e0b54	\N	1613	74a1cd5c-8ae8-40c4-b117-c7530a461026	2025-08-01 14:13:25.234	import	PAID	\N
41c4e6d6-3a6e-48a7-bac2-4de6027cb1b6	8	\N	6b5f66af-bd69-492f-8ee3-5ca726b5b8cc	\N	74a1cd5c-8ae8-40c4-b117-c7530a461026	2025-08-07 08:30:50.378	import	NOT_PAID	\N
99b24514-0638-412d-8a1a-0831bbf0c12b	9	\N	6b5f66af-bd69-492f-8ee3-5ca726b5b8cc	\N	74a1cd5c-8ae8-40c4-b117-c7530a461026	2025-08-07 08:31:52.636	import	NOT_PAID	\N
b0e87dd8-c460-4186-bc62-04c4b39a696d	10	158bf47a-1079-4ecb-b58d-0e5c88e05588	\N	1513	74a1cd5c-8ae8-40c4-b117-c7530a461026	2025-08-07 08:36:33.647	manual	NOT_PAID	2c43c164-d698-409c-bdf1-ed3dfcfa161c
5513f69f-a6d1-4fea-9a06-31d5ced3fa9f	1	\N	ab9a3b7d-5cfd-4d1e-94f3-f1ce655854b4	\N	74a1cd5c-8ae8-40c4-b117-c7530a461026	2025-08-01 14:11:40.823	import	NOT_PAID	\N
0129e5b9-3df0-4219-a8b4-26b449d389c0	3	48ddc9fc-b2da-4efa-a1ab-89b261ed4c22	\N	1628	74a1cd5c-8ae8-40c4-b117-c7530a461026	2025-08-01 14:13:40.656	import	NOT_PAID	\N
cd3dc942-d020-42e0-9674-a77ad353c9c3	11	90b3cae4-e222-4463-aa5a-2bdfdbee08e8	\N	1513	74a1cd5c-8ae8-40c4-b117-c7530a461026	2025-08-07 09:04:20.552	manual	NOT_PAID	51bef962-70ed-430d-ad5b-0f2fc1de48b0
287f02df-d7c8-44f3-9559-b82f285df78d	12	2f25fae7-08eb-4216-824c-c89be08bbd88	\N	1646	74a1cd5c-8ae8-40c4-b117-c7530a461026	2025-08-07 13:56:26.622	import	NOT_PAID	\N
5bcc66d1-8649-4cfd-9c46-10ba5e1a53b0	13	4f976fe5-ee51-4942-a437-a8e5d27fcee5	\N	1645	74a1cd5c-8ae8-40c4-b117-c7530a461026	2025-08-08 08:33:23.115	import	NOT_PAID	\N
497d0fe0-025c-4816-a934-956f3749b578	14	0e6710a8-51ef-40c1-aedb-b39eff5db3ff	\N	1644	74a1cd5c-8ae8-40c4-b117-c7530a461026	2025-08-11 06:01:28.843	import	NOT_PAID	\N
a5aecb35-53c8-4837-a93c-d200fa6fbbdf	15	\N	ab9a3b7d-5cfd-4d1e-94f3-f1ce655854b4	\N	74a1cd5c-8ae8-40c4-b117-c7530a461026	2025-08-11 07:17:39.879	import	NOT_PAID	\N
96a3883b-0c40-40a9-a609-8d78ea2f3ffd	17	024c0bb9-769a-4ba3-8a6b-adf8eadb9886	\N	1613	74a1cd5c-8ae8-40c4-b117-c7530a461026	2025-08-11 10:49:51.143	import	NOT_PAID	\N
e180b730-6ed9-413d-8ed1-059262fcb80e	18	024c0bb9-769a-4ba3-8a6b-adf8eadb9886	\N	1613	68b9923d-7800-4662-905e-a906d131314b	2025-08-11 11:05:06.714	manual	NOT_PAID	d032bf86-d881-4a45-ba3c-a64adb563667
868ad57d-a8eb-4cd6-b354-d93c9865fea1	19	024c0bb9-769a-4ba3-8a6b-adf8eadb9886	\N	1613	74a1cd5c-8ae8-40c4-b117-c7530a461026	2025-08-11 11:14:13.011	manual	NOT_PAID	\N
c928f73a-f970-42de-b456-0d0f19dc1497	16	48ddc9fc-b2da-4efa-a1ab-89b261ed4c22	\N	1628	68b9923d-7800-4662-905e-a906d131314b	2025-08-11 09:56:00.663	manual	PAID	633ae343-b2a1-49b1-a0cd-f3436c6b8390
d6045564-6e2c-475f-ae64-23e30e6728bb	20	\N	6b5f66af-bd69-492f-8ee3-5ca726b5b8cc	\N	74a1cd5c-8ae8-40c4-b117-c7530a461026	2025-08-12 07:12:20.6	import	NOT_PAID	\N
680bd5d0-d3fc-44df-8e4f-7356b6ed51a1	21	73e62de1-16b3-4025-aa1c-d08eb91e0b54	\N	1613	74a1cd5c-8ae8-40c4-b117-c7530a461026	2025-08-12 07:12:32.413	manual	NOT_PAID	dfffec83-6155-4568-9bcc-573f086dc9d1
60e59777-c6aa-46ce-b28e-ccd43164ca5f	22	\N	6b5f66af-bd69-492f-8ee3-5ca726b5b8cc	\N	74a1cd5c-8ae8-40c4-b117-c7530a461026	2025-08-12 08:30:12.783	import	NOT_PAID	\N
6e543ab4-cd2f-44a8-a3d4-f9481b927532	23	73e62de1-16b3-4025-aa1c-d08eb91e0b54	\N	1613	74a1cd5c-8ae8-40c4-b117-c7530a461026	2025-08-12 08:30:41.035	manual	NOT_PAID	a0d2c5cc-5882-4770-878b-aa48bfe0977b
52c01e8d-b0bc-4228-9d64-14d6465eee7a	24	\N	6b5f66af-bd69-492f-8ee3-5ca726b5b8cc	\N	74a1cd5c-8ae8-40c4-b117-c7530a461026	2025-08-12 08:33:31.236	import	NOT_PAID	\N
309766ea-474c-48d7-a4e7-fc87ef482ff9	25	73e62de1-16b3-4025-aa1c-d08eb91e0b54	\N	1613	74a1cd5c-8ae8-40c4-b117-c7530a461026	2025-08-12 08:35:59.718	manual	NOT_PAID	27d549b6-d74f-4008-a059-83c3e530171f
4496a8a8-d958-4a34-aafd-7fa107202bfa	26	\N	6b5f66af-bd69-492f-8ee3-5ca726b5b8cc	\N	74a1cd5c-8ae8-40c4-b117-c7530a461026	2025-08-12 09:40:12.916	import	NOT_PAID	\N
769b9fea-73d6-4f79-be7f-9fcff594251b	27	73e62de1-16b3-4025-aa1c-d08eb91e0b54	\N	1613	74a1cd5c-8ae8-40c4-b117-c7530a461026	2025-08-12 09:42:50.684	import	NOT_PAID	\N
116e45f5-7ecc-47a9-8a67-9393ea59afd1	28	b2355503-10ba-4b46-9e64-1f8ed51a6012	\N	1513	74a1cd5c-8ae8-40c4-b117-c7530a461026	2025-08-13 07:36:39.415	import	NOT_PAID	\N
\.


--
-- TOC entry 3620 (class 0 OID 37931)
-- Dependencies: 216
-- Data for Name: Stand; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Stand" (id, name, "storeId", rows, barcode, columns, "createdAt", email) FROM stdin;
90b3cae4-e222-4463-aa5a-2bdfdbee08e8	Хаско XO	fad641c4-1637-40ec-b67d-85ae99e94f15	\N	\N	\N	2025-07-21 09:42:05.958	\N
158bf47a-1079-4ecb-b58d-0e5c88e05588	Хаско Басеус	fad641c4-1637-40ec-b67d-85ae99e94f15	\N	\N	\N	2025-07-21 09:42:20.62	\N
73e62de1-16b3-4025-aa1c-d08eb91e0b54	Верде XO	6fad594c-13db-4423-b2d7-a67a7c3c8027	\N	\N	\N	2025-07-21 09:48:38.276	\N
722957e4-24b4-4fef-a9de-eb3dfddadb3f	Килера ХО	f5888faf-d7b5-4654-89ba-e0802a9b0048	\N	\N	\N	2025-07-21 10:07:22.072	\N
48ddc9fc-b2da-4efa-a1ab-89b261ed4c22	Енев ХО	2fde0c13-f123-4ec5-a1cd-a70afa7a580d	\N	\N	\N	2025-07-23 07:28:02.292	\N
0e6710a8-51ef-40c1-aedb-b39eff5db3ff	МАГИ НАК - Смесен магазин	f6f7de18-4b51-496c-bc59-db90579f2254	\N	\N	\N	2025-08-07 10:25:40.902	\N
024c0bb9-769a-4ba3-8a6b-adf8eadb9886	Верде XO new	6fad594c-13db-4423-b2d7-a67a7c3c8027	\N	\N	\N	2025-08-11 10:49:39.521	\N
2f25fae7-08eb-4216-824c-c89be08bbd88	ХИТ-МАРКЕТ "КАЛИНА"	2b13b5e2-ec19-4a41-a5e6-2592ec28ddcd	\N	\N	\N	2025-08-07 13:07:33.768	\N
4f976fe5-ee51-4942-a437-a8e5d27fcee5	Славея Минерални Бани	f4b59bd3-3a8b-46f7-b8ec-6aa61c88997a	\N	\N	\N	2025-08-07 10:50:47.954	\N
b2355503-10ba-4b46-9e64-1f8ed51a6012	Хаско Кампании	fad641c4-1637-40ec-b67d-85ae99e94f15	\N	\N	\N	2025-08-13 07:35:24.337	\N
\.


--
-- TOC entry 3622 (class 0 OID 37949)
-- Dependencies: 218
-- Data for Name: StandProduct; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."StandProduct" (id, "standId", "productId", quantity, "row", "column") FROM stdin;
e8124e6e-40a4-4ab8-9744-0d261531b68a	73e62de1-16b3-4025-aa1c-d08eb91e0b54	9fdde592-74f0-466a-b65b-51c73a356c4f	0	\N	\N
68f2bf3d-a66b-442a-97a4-72fd7f95c2fa	73e62de1-16b3-4025-aa1c-d08eb91e0b54	51c5fbd4-d14c-4297-8ee6-32da2fbf65de	0	\N	\N
fd65d5f6-c0d9-420c-8045-38b61f482783	73e62de1-16b3-4025-aa1c-d08eb91e0b54	fd6d75ec-ec9d-45b2-a7d8-e61240070374	6	\N	\N
ac959784-315e-4b4b-9673-15fa6c1b0f08	73e62de1-16b3-4025-aa1c-d08eb91e0b54	2b052187-883e-43a4-bed1-523771b663e0	6	\N	\N
b7106eec-7fda-4438-a67a-e238ed35c891	73e62de1-16b3-4025-aa1c-d08eb91e0b54	e00843fb-fedb-434a-ae73-f9d8e554151e	0	\N	\N
84b0b431-198c-402e-9e8a-9ec56c1cb324	73e62de1-16b3-4025-aa1c-d08eb91e0b54	3c29b236-58cf-4201-a171-4750ee76a5c5	0	\N	\N
a97bea93-ec7e-4d22-ac32-f9c929433a51	73e62de1-16b3-4025-aa1c-d08eb91e0b54	2b5872eb-4998-4d04-a96d-338e6e4d9165	3	\N	\N
b0925ddc-38af-426c-adf6-9820ecbb1591	73e62de1-16b3-4025-aa1c-d08eb91e0b54	f62e9a15-d8a7-4781-a2fc-6df46b37e381	2	\N	\N
96b07695-990f-42be-a1bb-b8f210a557f7	73e62de1-16b3-4025-aa1c-d08eb91e0b54	1cea990b-852a-41cc-9216-fa3e3006f2d6	0	\N	\N
559e36ab-86da-46d6-9e0e-7634d98f6deb	73e62de1-16b3-4025-aa1c-d08eb91e0b54	5b685926-58cb-49cb-a629-c5238a00740a	0	\N	\N
1ffab643-5bcc-4a3e-a8a4-0d2832d1a26a	73e62de1-16b3-4025-aa1c-d08eb91e0b54	c747c326-8331-4ec4-b19a-ee3912f4bbec	0	\N	\N
51fdb5cb-9e9a-4d04-97c3-20c727897b94	73e62de1-16b3-4025-aa1c-d08eb91e0b54	4ff4bc90-9ec6-4ef8-b00b-0ea0346642f3	0	\N	\N
abf51cf6-a424-4fda-bdd2-02a839c503a8	73e62de1-16b3-4025-aa1c-d08eb91e0b54	1fe347d2-0396-4f21-89e0-5a7bb19f3756	0	\N	\N
60aa35d1-4dfd-442d-8228-9c87c2437e98	73e62de1-16b3-4025-aa1c-d08eb91e0b54	e3685b83-25e1-4679-a9d0-5fcaa8be1b29	0	\N	\N
fe98d553-e644-4c1c-bea9-29b85f9872fd	73e62de1-16b3-4025-aa1c-d08eb91e0b54	0cf6ae53-d9ae-4269-ac96-f19b8dbdbcb2	0	\N	\N
dff271e0-d1c2-4573-9d07-a4f9fcd41c2f	73e62de1-16b3-4025-aa1c-d08eb91e0b54	9e5e6bce-ec92-4ed8-ba16-b8c2e3b60fe4	4	\N	\N
6dbaa750-e9b2-41db-ae84-5c9676fc9d79	73e62de1-16b3-4025-aa1c-d08eb91e0b54	9f2beabc-2da0-4a15-9a98-5192ddbe714b	2	\N	\N
b09afb7f-332b-4376-bd37-6d081a867eec	73e62de1-16b3-4025-aa1c-d08eb91e0b54	4bee824c-e816-4b4a-9027-7c6cb4e495da	4	\N	\N
a6afdd97-882d-46e2-bb4b-a3e1f80ed774	73e62de1-16b3-4025-aa1c-d08eb91e0b54	3d61be70-f89f-4d27-8b49-1ae3ab2a802c	0	\N	\N
50a36667-7f39-4ecb-8a4a-515838869378	73e62de1-16b3-4025-aa1c-d08eb91e0b54	0dccea72-e417-4381-b430-0854dc98fd2b	0	\N	\N
f80e179d-2ed8-409e-907f-e3bff8603121	73e62de1-16b3-4025-aa1c-d08eb91e0b54	6c2bd3f8-a725-4c6a-bc96-487b8512f477	0	\N	\N
4b4ed940-9beb-42db-8ce0-7fa3d8d96607	73e62de1-16b3-4025-aa1c-d08eb91e0b54	080e1bc6-2e5b-485b-a369-99b53586eda3	0	\N	\N
4f3494c4-6909-4897-87a0-c20c96706948	73e62de1-16b3-4025-aa1c-d08eb91e0b54	806b7339-7303-414d-8966-d49f02fa804f	0	\N	\N
6890a8ba-5b85-48c4-8a69-4a422c7ffb55	73e62de1-16b3-4025-aa1c-d08eb91e0b54	fab4c8b8-6e83-431c-b784-ad3346759365	0	\N	\N
89c41c87-0464-4c33-849e-b56ce385a6ac	73e62de1-16b3-4025-aa1c-d08eb91e0b54	51c9a455-1506-4887-ae1d-0f775899174d	0	\N	\N
483cfffe-abf3-4658-a027-328a4c57917a	73e62de1-16b3-4025-aa1c-d08eb91e0b54	294ca3f1-937d-4efa-aa8c-864c644fe24b	0	\N	\N
0e1e0f87-63f0-4de9-bd1a-eb6c89c3e539	73e62de1-16b3-4025-aa1c-d08eb91e0b54	cc9be182-5d90-4abf-9976-823b4e61cd33	0	\N	\N
72d8af96-de2f-4630-8582-ee75585de703	48ddc9fc-b2da-4efa-a1ab-89b261ed4c22	9fac21e5-a8bc-4204-bb35-7dde2cc211e9	6	\N	\N
1958563e-e1f0-434b-acdf-67bcb2ac95d4	48ddc9fc-b2da-4efa-a1ab-89b261ed4c22	3d61be70-f89f-4d27-8b49-1ae3ab2a802c	3	\N	\N
4fa6f201-a78d-430d-b2bf-460aaf0fa218	48ddc9fc-b2da-4efa-a1ab-89b261ed4c22	c747c326-8331-4ec4-b19a-ee3912f4bbec	3	\N	\N
6923d5bb-69e5-40e3-be3b-f63f42a9ef59	48ddc9fc-b2da-4efa-a1ab-89b261ed4c22	f62e9a15-d8a7-4781-a2fc-6df46b37e381	2	\N	\N
d9368bd8-6d71-4dcc-a466-01d31c2d0777	48ddc9fc-b2da-4efa-a1ab-89b261ed4c22	6c2bd3f8-a725-4c6a-bc96-487b8512f477	3	\N	\N
bc82d343-b4ae-489c-895d-1687d0de7a32	48ddc9fc-b2da-4efa-a1ab-89b261ed4c22	080e1bc6-2e5b-485b-a369-99b53586eda3	3	\N	\N
798abb39-5173-4a3d-96bb-8dd62d3c2ca7	48ddc9fc-b2da-4efa-a1ab-89b261ed4c22	806b7339-7303-414d-8966-d49f02fa804f	1	\N	\N
2529bb16-3bb8-4c0f-9001-8599b4d42d40	48ddc9fc-b2da-4efa-a1ab-89b261ed4c22	9f2beabc-2da0-4a15-9a98-5192ddbe714b	2	\N	\N
3195e820-caf7-4967-9f56-6318772a0407	48ddc9fc-b2da-4efa-a1ab-89b261ed4c22	8890477e-792f-4ccc-bfa4-efa5d19cbba3	2	\N	\N
8b3429a7-bdc6-401f-a071-111681f9c2d6	48ddc9fc-b2da-4efa-a1ab-89b261ed4c22	4bee824c-e816-4b4a-9027-7c6cb4e495da	4	\N	\N
3ffb4bc4-e637-4e9a-a0ed-3c15eeab02fd	73e62de1-16b3-4025-aa1c-d08eb91e0b54	9fac21e5-a8bc-4204-bb35-7dde2cc211e9	4	\N	\N
5691cc9d-b085-4a16-9e6f-db8c25e0647e	73e62de1-16b3-4025-aa1c-d08eb91e0b54	8890477e-792f-4ccc-bfa4-efa5d19cbba3	4	\N	\N
91190040-ab30-4264-9356-b819001d9dc3	48ddc9fc-b2da-4efa-a1ab-89b261ed4c22	294ca3f1-937d-4efa-aa8c-864c644fe24b	4	\N	\N
96adbf72-c4d6-4ddf-a96b-74ef11cc801f	722957e4-24b4-4fef-a9de-eb3dfddadb3f	9fac21e5-a8bc-4204-bb35-7dde2cc211e9	6	\N	\N
11aecbbb-e803-4db8-aeca-0c5e20f6818e	722957e4-24b4-4fef-a9de-eb3dfddadb3f	fd6d75ec-ec9d-45b2-a7d8-e61240070374	6	\N	\N
266315fb-1a8c-4809-a40a-a60cc0e67318	722957e4-24b4-4fef-a9de-eb3dfddadb3f	e00843fb-fedb-434a-ae73-f9d8e554151e	8	\N	\N
85ddd66a-2212-4545-b13c-8d2b4d7f48b4	722957e4-24b4-4fef-a9de-eb3dfddadb3f	2b052187-883e-43a4-bed1-523771b663e0	6	\N	\N
d1fff523-efbf-404a-b0e6-00cc2258f160	722957e4-24b4-4fef-a9de-eb3dfddadb3f	3c29b236-58cf-4201-a171-4750ee76a5c5	6	\N	\N
a4273438-0342-4931-b8e0-860bba9b54cd	722957e4-24b4-4fef-a9de-eb3dfddadb3f	1cea990b-852a-41cc-9216-fa3e3006f2d6	6	\N	\N
da349fe0-f8e5-4607-b153-3658fa67ed77	722957e4-24b4-4fef-a9de-eb3dfddadb3f	3d61be70-f89f-4d27-8b49-1ae3ab2a802c	1	\N	\N
f80ef1cb-bbe1-4e72-896b-416800ddfb62	722957e4-24b4-4fef-a9de-eb3dfddadb3f	0dccea72-e417-4381-b430-0854dc98fd2b	2	\N	\N
575e3129-0773-4bc6-b467-7e4b9a79d246	722957e4-24b4-4fef-a9de-eb3dfddadb3f	5b685926-58cb-49cb-a629-c5238a00740a	3	\N	\N
204e389f-1c97-4e3f-b692-105f86357082	722957e4-24b4-4fef-a9de-eb3dfddadb3f	c747c326-8331-4ec4-b19a-ee3912f4bbec	3	\N	\N
a5701ebe-2f50-479e-96bb-5d8c03be9f31	722957e4-24b4-4fef-a9de-eb3dfddadb3f	2b5872eb-4998-4d04-a96d-338e6e4d9165	3	\N	\N
5ff4742f-c6c3-4ab0-b919-65185822f172	722957e4-24b4-4fef-a9de-eb3dfddadb3f	4ff4bc90-9ec6-4ef8-b00b-0ea0346642f3	2	\N	\N
533bc108-1042-4c2e-ae48-902211ede0a8	722957e4-24b4-4fef-a9de-eb3dfddadb3f	f62e9a15-d8a7-4781-a2fc-6df46b37e381	2	\N	\N
b592552b-2efe-4f13-86a8-1792c3bd6dbf	722957e4-24b4-4fef-a9de-eb3dfddadb3f	6c2bd3f8-a725-4c6a-bc96-487b8512f477	3	\N	\N
9df65256-e123-4443-8a65-d48b092ad958	722957e4-24b4-4fef-a9de-eb3dfddadb3f	080e1bc6-2e5b-485b-a369-99b53586eda3	3	\N	\N
28489b9d-403b-4c65-8eef-c6816c28da02	722957e4-24b4-4fef-a9de-eb3dfddadb3f	806b7339-7303-414d-8966-d49f02fa804f	1	\N	\N
c89ea397-225b-4a2d-a225-4cccf640db6d	722957e4-24b4-4fef-a9de-eb3dfddadb3f	fab4c8b8-6e83-431c-b784-ad3346759365	9	\N	\N
78aac8f6-4b4e-42f8-aeac-04f3d9073b60	722957e4-24b4-4fef-a9de-eb3dfddadb3f	51c9a455-1506-4887-ae1d-0f775899174d	9	\N	\N
9365bb49-59d0-4b5b-b28e-84e0ccb58090	722957e4-24b4-4fef-a9de-eb3dfddadb3f	e1d608d8-f769-4ef7-bae8-5b48aa46f832	4	\N	\N
6f575461-12c9-495e-b4d3-f856ccbec9a5	722957e4-24b4-4fef-a9de-eb3dfddadb3f	cc9be182-5d90-4abf-9976-823b4e61cd33	4	\N	\N
acc41ffb-854e-4119-a101-258d591f7ffd	722957e4-24b4-4fef-a9de-eb3dfddadb3f	1fe347d2-0396-4f21-89e0-5a7bb19f3756	4	\N	\N
13587a32-f482-46af-8483-ec35986bd1c4	722957e4-24b4-4fef-a9de-eb3dfddadb3f	9fdde592-74f0-466a-b65b-51c73a356c4f	4	\N	\N
2cfddc7c-41cb-4cc5-9257-97d3c64625ff	722957e4-24b4-4fef-a9de-eb3dfddadb3f	51c5fbd4-d14c-4297-8ee6-32da2fbf65de	4	\N	\N
37dabd47-e761-472b-a40e-031b4482e283	722957e4-24b4-4fef-a9de-eb3dfddadb3f	9e5e6bce-ec92-4ed8-ba16-b8c2e3b60fe4	4	\N	\N
f04c6d54-12d6-4d64-9b9e-1dd390df8d11	722957e4-24b4-4fef-a9de-eb3dfddadb3f	e3685b83-25e1-4679-a9d0-5fcaa8be1b29	4	\N	\N
09775e81-930d-492f-aa61-a2f9c7214e4c	722957e4-24b4-4fef-a9de-eb3dfddadb3f	9f2beabc-2da0-4a15-9a98-5192ddbe714b	2	\N	\N
29c62dde-001f-4305-9c3f-4222249dd4d0	722957e4-24b4-4fef-a9de-eb3dfddadb3f	8890477e-792f-4ccc-bfa4-efa5d19cbba3	2	\N	\N
0cbfc355-b57c-4a89-958b-cffc7fe33782	722957e4-24b4-4fef-a9de-eb3dfddadb3f	0cf6ae53-d9ae-4269-ac96-f19b8dbdbcb2	4	\N	\N
272edae4-bfaf-476d-9a5c-0079e4affcae	722957e4-24b4-4fef-a9de-eb3dfddadb3f	4bee824c-e816-4b4a-9027-7c6cb4e495da	4	\N	\N
00e673dc-37f8-42a2-b481-ab80a6f6065d	90b3cae4-e222-4463-aa5a-2bdfdbee08e8	05f013ba-9ba8-465b-a9e9-4fa68f95f009	1	\N	\N
b056daa1-30f0-4dc1-9f9b-12c4ad9f7311	90b3cae4-e222-4463-aa5a-2bdfdbee08e8	0e7eb525-b5e0-443d-81e9-1e8a0c59ca11	5	\N	\N
4b1b7da0-a995-4253-ac84-cc0d0c7332f9	90b3cae4-e222-4463-aa5a-2bdfdbee08e8	0db8a4ea-09fa-4f1f-99f4-b17a3b2e24ad	3	\N	\N
a40e7bed-4671-4051-8b2f-9c8724c726c2	90b3cae4-e222-4463-aa5a-2bdfdbee08e8	ac5b9720-e600-41ec-b0ce-e7108feb387d	2	\N	\N
04679e1f-ce69-4e42-8b14-c242ab80016b	90b3cae4-e222-4463-aa5a-2bdfdbee08e8	1fe347d2-0396-4f21-89e0-5a7bb19f3756	4	\N	\N
1c02cd31-ee11-49be-860c-d9565193b66f	90b3cae4-e222-4463-aa5a-2bdfdbee08e8	427d7f32-a75f-440e-adf0-f96201d0bc5b	2	\N	\N
82cdfb47-8d1a-4519-a3a5-449f8f0a8bda	90b3cae4-e222-4463-aa5a-2bdfdbee08e8	93b1106e-24ce-4df3-8df8-ba4d21013a0a	4	\N	\N
249b189f-c8e3-49bb-a98f-f41dca104d3c	90b3cae4-e222-4463-aa5a-2bdfdbee08e8	43487f82-6bad-489c-b0a4-dc03cd5a5e8d	3	\N	\N
fa3fc14f-77a4-4dc4-bc0e-86361f346c03	90b3cae4-e222-4463-aa5a-2bdfdbee08e8	9993ceda-cbff-467e-ba33-c9ec45cc4545	2	\N	\N
b1b14cbf-d2d6-47d8-9202-9014814b7d72	90b3cae4-e222-4463-aa5a-2bdfdbee08e8	9014815a-340b-4092-88ea-208e3c3a5e49	4	\N	\N
ada16ae1-91db-4ef1-985a-b00aaa02c9b2	90b3cae4-e222-4463-aa5a-2bdfdbee08e8	8d75a2da-c502-444e-a242-297fe3497d10	2	\N	\N
2ae5492b-c5bc-402e-8f51-63115b28fdce	90b3cae4-e222-4463-aa5a-2bdfdbee08e8	be2a2b08-621e-41b8-8d55-0d68cc8d4445	4	\N	\N
e8362bcd-85bc-48c9-b101-a8285ca70c1f	90b3cae4-e222-4463-aa5a-2bdfdbee08e8	fd6d75ec-ec9d-45b2-a7d8-e61240070374	4	\N	\N
d75ff7c8-a0d8-4bfe-a60b-74d1032d55fa	90b3cae4-e222-4463-aa5a-2bdfdbee08e8	cc9be182-5d90-4abf-9976-823b4e61cd33	4	\N	\N
20f78645-85c7-42d7-b367-d6f10f9401e4	90b3cae4-e222-4463-aa5a-2bdfdbee08e8	bb855a25-83cd-4164-a896-0c417609d1a0	2	\N	\N
3bfe5d94-3f54-4cda-b172-bf582607c290	90b3cae4-e222-4463-aa5a-2bdfdbee08e8	0bbc5bd9-7485-4ca7-90bc-98b4fc4a7d43	3	\N	\N
5b210a4f-cebd-4b36-b33e-264de552ef8c	90b3cae4-e222-4463-aa5a-2bdfdbee08e8	e69c6728-01d9-4d07-8561-3d967b0f3594	3	\N	\N
756dd112-da8e-496c-89ba-336f9c7df331	90b3cae4-e222-4463-aa5a-2bdfdbee08e8	7d469886-3b4c-4ac7-8062-d42330c9c8d7	2	\N	\N
b1ca8d36-0a94-4a78-97be-e36144e653af	90b3cae4-e222-4463-aa5a-2bdfdbee08e8	09473aa4-91ba-4ac6-b421-0131b27668f4	3	\N	\N
909a61b4-2341-41dc-9fb6-926cae656e40	90b3cae4-e222-4463-aa5a-2bdfdbee08e8	92864630-c64f-4863-8a36-c2b51ea035e8	2	\N	\N
2a76e05b-40f6-4ce0-b628-152810e52415	90b3cae4-e222-4463-aa5a-2bdfdbee08e8	80d5432b-878d-4b40-abef-ca31f83db88c	2	\N	\N
445bd513-2743-4f4d-be4a-e734f86edae4	158bf47a-1079-4ecb-b58d-0e5c88e05588	c54f156c-8483-4b77-9745-04661d47e82f	1	\N	\N
b8a4d9ce-c26d-4c12-ac02-f75ff7e05806	158bf47a-1079-4ecb-b58d-0e5c88e05588	85e801eb-c962-423d-a7ce-02bf518a18ed	3	\N	\N
4f4a70e2-a812-499d-9899-063e1ec93fdf	158bf47a-1079-4ecb-b58d-0e5c88e05588	57121c57-0f01-4c92-afe3-26ae0d30c968	2	\N	\N
eced363f-df0c-4d38-85d0-6ea073ffa6fc	158bf47a-1079-4ecb-b58d-0e5c88e05588	fe9db831-2d58-4511-af1f-926092ba02e2	1	\N	\N
f785bcae-1d5d-4389-8b63-b9a4c32ae690	158bf47a-1079-4ecb-b58d-0e5c88e05588	8fdc320a-d74d-4760-8743-31ae9ddba850	1	\N	\N
bcae2f25-b72f-4179-90fb-dbfe919042d5	158bf47a-1079-4ecb-b58d-0e5c88e05588	6ba14854-edaa-4b99-bbfe-8ab18842cfd7	2	\N	\N
97b49ca1-773a-4ed8-a68f-8674c19507b1	158bf47a-1079-4ecb-b58d-0e5c88e05588	a2f70fa6-9483-4535-ad27-fd9c0864098e	2	\N	\N
fd0a321f-9331-40ef-93ee-c5aedaa6bf40	158bf47a-1079-4ecb-b58d-0e5c88e05588	7b85853e-d909-413e-8c27-9003ca34f047	2	\N	\N
f2b7ef35-d403-4a4f-b0c1-7a779a6694c4	158bf47a-1079-4ecb-b58d-0e5c88e05588	f030fd91-27fd-442b-8853-d7fd2e926f5a	3	\N	\N
ae4fedf7-4c83-47f5-95ab-f77885b4d9df	158bf47a-1079-4ecb-b58d-0e5c88e05588	c24fab55-98f3-4bc3-85af-1b820fd61bdb	4	\N	\N
09bfa534-2122-47ad-9bba-a5fed76b82a6	158bf47a-1079-4ecb-b58d-0e5c88e05588	42acfe5b-87a9-4ec5-a5ee-6ed12b788a99	2	\N	\N
43e352c0-b7c5-437c-8d33-f1a1b850e4d1	158bf47a-1079-4ecb-b58d-0e5c88e05588	ab733dec-baaa-479e-9583-2cf13c7131ec	2	\N	\N
221fa9b5-e85c-4ab3-a7eb-b40d1d791b80	158bf47a-1079-4ecb-b58d-0e5c88e05588	83f830e9-5f80-4dce-a5ce-254247e5d736	3	\N	\N
3c0d823b-fc08-4858-a37c-bee1f4b6a530	158bf47a-1079-4ecb-b58d-0e5c88e05588	99b64b5b-93e5-4ae1-bbd0-f02b709c82b6	4	\N	\N
76725cda-5d0b-4af4-9deb-c91729b0c50b	158bf47a-1079-4ecb-b58d-0e5c88e05588	d376a251-cfa6-4aee-af3d-3c14f5098704	4	\N	\N
69d9646f-7808-41b5-a741-cc0f4095122a	158bf47a-1079-4ecb-b58d-0e5c88e05588	ae504b55-4776-4560-b106-febe842d47b7	2	\N	\N
28c29025-98b7-451d-9ada-a401be36f266	158bf47a-1079-4ecb-b58d-0e5c88e05588	56ace9b9-6f96-4d5e-bba7-70f04c7c2681	3	\N	\N
c9259470-a254-43f4-8ec3-c6c303c6e2e1	158bf47a-1079-4ecb-b58d-0e5c88e05588	109d7a24-8924-4c07-9e00-f83363fc21d3	5	\N	\N
c4ddbc23-36f8-44e2-a926-d7906d03937f	158bf47a-1079-4ecb-b58d-0e5c88e05588	deee6c6c-b5d4-47ee-b253-86beaa0ff763	3	\N	\N
a784fd5b-d53d-47c5-86b6-8649ff277797	158bf47a-1079-4ecb-b58d-0e5c88e05588	1af30ab3-53c1-4a69-9649-4e5f8935087b	4	\N	\N
5e23e9fd-100c-4949-981a-966ac4a1a27a	158bf47a-1079-4ecb-b58d-0e5c88e05588	9dca60ee-f6a5-4910-84f2-9b504dc7601d	2	\N	\N
9fc0535f-89a9-47b3-9e9f-e63ec428b3d4	158bf47a-1079-4ecb-b58d-0e5c88e05588	aee4c76b-b63e-4f5b-89f2-04a1111de40d	2	\N	\N
75f194fc-4702-46ee-b801-a625976297b6	158bf47a-1079-4ecb-b58d-0e5c88e05588	fd2ecaf7-e2ad-4906-9571-0820eaf39fd4	0	\N	\N
25da77b2-ef59-4e77-b15c-aa85f92c2fc9	158bf47a-1079-4ecb-b58d-0e5c88e05588	5f983a66-48aa-4419-8951-33bc52217916	2	\N	\N
1ec3fb1e-5cd1-474f-a793-d7519b5c08d3	158bf47a-1079-4ecb-b58d-0e5c88e05588	32935f08-2ba8-4ed0-9a52-e5cb55848f78	3	\N	\N
f2690d96-eb8e-4746-869f-ee476b7b2c37	158bf47a-1079-4ecb-b58d-0e5c88e05588	00bceb45-abcb-4fef-9851-591f6f7e601d	3	\N	\N
c01e3727-f183-43b3-810f-c180b9cacd49	158bf47a-1079-4ecb-b58d-0e5c88e05588	3a563d70-1d3b-44ea-aafa-c849430bd9d2	2	\N	\N
acc444a4-6961-463f-85a7-2729b6ddd910	158bf47a-1079-4ecb-b58d-0e5c88e05588	83347115-152a-4229-ab10-1a54f258bef1	2	\N	\N
fb0345fd-1408-460a-b95d-6c8a6bab2f63	158bf47a-1079-4ecb-b58d-0e5c88e05588	86d79e90-029d-4fdf-96a0-84dc8d5f000a	4	\N	\N
b178888e-4e89-4b6e-a137-3240be1038e5	158bf47a-1079-4ecb-b58d-0e5c88e05588	4caa71b4-3266-4796-bb04-6f1474b67288	4	\N	\N
d7669047-3317-426c-887e-3d64e7239a9b	158bf47a-1079-4ecb-b58d-0e5c88e05588	023384be-4b4b-4b70-9105-b34a33b303a7	3	\N	\N
643c907f-04e3-4c8f-8775-8b013d6655a5	158bf47a-1079-4ecb-b58d-0e5c88e05588	b8c7adc6-a08b-43cf-8caa-7c29c42f9f1a	2	\N	\N
b3333e77-6184-47b7-a12e-2e68aadefaf3	48ddc9fc-b2da-4efa-a1ab-89b261ed4c22	2b052187-883e-43a4-bed1-523771b663e0	6	\N	\N
7aded947-b129-4c46-bf29-abcdabc9e03d	158bf47a-1079-4ecb-b58d-0e5c88e05588	ba3b4d18-4a3a-42ff-ba3a-f4e64e162978	2	\N	\N
657e1310-7449-450a-952f-07f2851f32cb	158bf47a-1079-4ecb-b58d-0e5c88e05588	17fa3d84-4419-40ef-b7a7-f144387d913c	1	\N	\N
ab15d6c7-8741-4fec-a5e3-6bc8e6ad6fef	158bf47a-1079-4ecb-b58d-0e5c88e05588	53ea0278-453f-4df0-9272-7e55da9b5ecb	2	\N	\N
e04a270c-bfb4-4867-91de-5d0107a387a6	158bf47a-1079-4ecb-b58d-0e5c88e05588	c6eacdb6-5f77-49a6-b3f7-3befef4e9881	1	\N	\N
29883e4d-220b-408e-8c7c-2be983936f13	90b3cae4-e222-4463-aa5a-2bdfdbee08e8	a8707b5a-a41c-4bc8-a0fe-c823c45ab014	3	\N	\N
88e7701a-c9f5-4e86-bb5b-002a5a2327ae	90b3cae4-e222-4463-aa5a-2bdfdbee08e8	57090686-76e3-4ef8-83fb-e9f27c159566	1	\N	\N
d3a54c67-ef0e-4f07-89cc-4d9b0268ee00	90b3cae4-e222-4463-aa5a-2bdfdbee08e8	c17ea773-f608-4bb6-a71f-d41ee7ea3882	4	\N	\N
ca4b3f62-50c8-40d0-84db-9199bc32a622	90b3cae4-e222-4463-aa5a-2bdfdbee08e8	294ca3f1-937d-4efa-aa8c-864c644fe24b	3	\N	\N
fe7acdf8-6f39-42c5-af3e-9bcaee499cc1	90b3cae4-e222-4463-aa5a-2bdfdbee08e8	4edfafe5-16d2-4b03-b375-f771eec43ebe	2	\N	\N
5c03fb28-2428-4eac-a8ef-10de54eda258	90b3cae4-e222-4463-aa5a-2bdfdbee08e8	8def029f-c4b6-4e44-bbd8-24a3798eaf46	4	\N	\N
489538ac-157d-4726-8892-db959c170c4e	90b3cae4-e222-4463-aa5a-2bdfdbee08e8	d0e59e48-079d-442a-920d-ca5b5741b66f	2	\N	\N
566be3a2-34e8-4eb3-b43c-d21c19d0bd32	90b3cae4-e222-4463-aa5a-2bdfdbee08e8	8c5d3590-8de1-49eb-852b-5b00a2d95d65	2	\N	\N
d49ec1b3-ae97-4938-a7b6-ef753f14f5e2	90b3cae4-e222-4463-aa5a-2bdfdbee08e8	06e735dc-80bf-40c6-ac32-f8e8235350a4	3	\N	\N
cbee8e84-fbc9-41a3-8753-b6b82522d85d	90b3cae4-e222-4463-aa5a-2bdfdbee08e8	9e5e6bce-ec92-4ed8-ba16-b8c2e3b60fe4	4	\N	\N
03a52e54-bd67-42f7-b3d7-f469f20e0690	90b3cae4-e222-4463-aa5a-2bdfdbee08e8	4ee3536c-5f11-49e4-aa4c-f8a786a7b990	4	\N	\N
3a34b65c-3226-4b46-9e0d-5575ed882661	90b3cae4-e222-4463-aa5a-2bdfdbee08e8	eb2a677a-a7d0-41a4-b985-ff96a3788362	4	\N	\N
1c0b86f0-3e4c-4bb4-9a72-4e7b18b9b156	90b3cae4-e222-4463-aa5a-2bdfdbee08e8	3c47788d-21bc-4263-a1f0-a062a6e51a9b	3	\N	\N
99d956a5-2474-45f2-8ab9-a4fe00475cf4	2f25fae7-08eb-4216-824c-c89be08bbd88	1e27b1c6-6ac2-4396-ab9f-748c0d1d87da	3	\N	\N
93316045-82e9-4030-a2b0-a031a52af86b	2f25fae7-08eb-4216-824c-c89be08bbd88	8ec7d2c3-8387-40a5-9d8d-3884689d4591	3	\N	\N
50b0abe7-7574-4522-b5aa-ed74d6f55d52	2f25fae7-08eb-4216-824c-c89be08bbd88	4eb84e04-a7d4-4632-b48d-37f155aefbe9	3	\N	\N
fe9f597e-d2cf-4d36-9d17-a518ac9a45eb	2f25fae7-08eb-4216-824c-c89be08bbd88	cb879680-3df9-42ab-a917-5866bfa7b144	3	\N	\N
ae07405a-eccd-4c5f-8a6f-cc08916600b6	2f25fae7-08eb-4216-824c-c89be08bbd88	5681cff4-0d71-4661-941a-4df86ccc102d	3	\N	\N
f568ca87-1a0e-4da0-90eb-42a276d42b4a	2f25fae7-08eb-4216-824c-c89be08bbd88	260618d9-421c-4801-a453-b38f601b95c7	3	\N	\N
1bc985a3-c898-4fdd-a4e1-a82ee0dbb043	2f25fae7-08eb-4216-824c-c89be08bbd88	1902bd89-bcaf-4e25-9b56-cffaad95854a	6	\N	\N
bf0d38f5-0291-4715-b7b3-ac6f4d71be57	2f25fae7-08eb-4216-824c-c89be08bbd88	d44958b7-6c19-4427-a771-3e9eb86a9f48	2	\N	\N
fbed1562-e27e-4a0d-8fba-e3a4cb18fc2c	2f25fae7-08eb-4216-824c-c89be08bbd88	ce2807b1-b439-49be-9789-78e2124aee22	2	\N	\N
25ec53f1-848b-4aa2-ba19-47ae5456ace0	2f25fae7-08eb-4216-824c-c89be08bbd88	4ccd9168-98ae-4077-a18e-8d9d034698fb	9	\N	\N
4ccdf98c-5b99-4f62-9212-380372f9df09	2f25fae7-08eb-4216-824c-c89be08bbd88	fd6d75ec-ec9d-45b2-a7d8-e61240070374	3	\N	\N
24eaea65-dbdd-4356-9b9e-d29bfe4872dc	2f25fae7-08eb-4216-824c-c89be08bbd88	afc437a4-c6e9-48db-91c5-a5d8d34538dd	6	\N	\N
a66389e7-5600-4d2a-b326-241651401f0b	2f25fae7-08eb-4216-824c-c89be08bbd88	3c29b236-58cf-4201-a171-4750ee76a5c5	3	\N	\N
2bb530d2-5e89-4baa-9104-995f1eb79e7a	2f25fae7-08eb-4216-824c-c89be08bbd88	1cea990b-852a-41cc-9216-fa3e3006f2d6	3	\N	\N
8ef4084f-00b7-4c67-9901-2abc798a0edc	2f25fae7-08eb-4216-824c-c89be08bbd88	f25aea89-8505-4835-83a4-a302758e84a2	3	\N	\N
8f52bed5-bdba-44a3-93e5-f5c3d4e588d0	2f25fae7-08eb-4216-824c-c89be08bbd88	3aa7200b-4758-4416-b145-66cc8bfc51a2	3	\N	\N
b8a7c70c-e08c-43ec-8726-605879802652	2f25fae7-08eb-4216-824c-c89be08bbd88	3d61be70-f89f-4d27-8b49-1ae3ab2a802c	1	\N	\N
dfe5e01b-0b0d-409c-a06f-c09943913816	2f25fae7-08eb-4216-824c-c89be08bbd88	0dccea72-e417-4381-b430-0854dc98fd2b	2	\N	\N
6eddb61c-b014-48f4-a1ff-c1dff4cdcd85	2f25fae7-08eb-4216-824c-c89be08bbd88	4ff4bc90-9ec6-4ef8-b00b-0ea0346642f3	2	\N	\N
6cab0550-3f6a-4f07-b59a-75edb0eea750	2f25fae7-08eb-4216-824c-c89be08bbd88	f62e9a15-d8a7-4781-a2fc-6df46b37e381	2	\N	\N
29213333-b317-4a2e-b4e2-7aa818fe399b	2f25fae7-08eb-4216-824c-c89be08bbd88	805955bc-5dde-4b98-85a4-a12e4b72f3bd	3	\N	\N
4272b95f-252e-43dd-9478-d81bff73dddd	2f25fae7-08eb-4216-824c-c89be08bbd88	fe55be2a-4c99-4d7a-9694-0ca8304b2809	3	\N	\N
44877ec1-ddac-44e5-8685-7390c1b0cf6d	2f25fae7-08eb-4216-824c-c89be08bbd88	080e1bc6-2e5b-485b-a369-99b53586eda3	3	\N	\N
5e7a4f19-eaf4-4419-b9e8-3f5b8247b66d	2f25fae7-08eb-4216-824c-c89be08bbd88	806b7339-7303-414d-8966-d49f02fa804f	1	\N	\N
453932a8-b7b6-4f84-ad67-4000ccce56ea	2f25fae7-08eb-4216-824c-c89be08bbd88	fab4c8b8-6e83-431c-b784-ad3346759365	3	\N	\N
fd06a752-b2a4-4e37-8199-f2da66a5ae9d	2f25fae7-08eb-4216-824c-c89be08bbd88	add2d27e-1dd1-4f88-a897-897b0761003e	4	\N	\N
7689077c-6a48-4fc2-914b-995fc3344b5e	2f25fae7-08eb-4216-824c-c89be08bbd88	cc9be182-5d90-4abf-9976-823b4e61cd33	8	\N	\N
b15b0c4f-689f-4902-b807-f5989d327489	2f25fae7-08eb-4216-824c-c89be08bbd88	9fdde592-74f0-466a-b65b-51c73a356c4f	4	\N	\N
0dbe5447-e76b-45cc-bdb4-e82ea1d102d9	2f25fae7-08eb-4216-824c-c89be08bbd88	51c5fbd4-d14c-4297-8ee6-32da2fbf65de	4	\N	\N
6fa29711-a85d-4ba0-b85f-b8d6c8043676	2f25fae7-08eb-4216-824c-c89be08bbd88	ce996f1c-5704-4f6a-8e6b-b407b3bd60c1	3	\N	\N
f36999a7-e25c-4e40-af95-4ff69eb8f49f	2f25fae7-08eb-4216-824c-c89be08bbd88	f25f15a5-b640-4243-9209-7caf329754ff	3	\N	\N
86f8d2a1-64a8-431b-a161-f30767875234	2f25fae7-08eb-4216-824c-c89be08bbd88	b47b5b58-6aa2-46d4-a375-7f7a794f762c	3	\N	\N
54a65768-b000-4c68-8212-13ea9d50ed18	2f25fae7-08eb-4216-824c-c89be08bbd88	788e8ee6-cd6e-4d45-87a1-c62dbec2bd3c	3	\N	\N
71ff23d4-72fe-4a52-8db4-aa070c1c6d9b	2f25fae7-08eb-4216-824c-c89be08bbd88	35803093-ba4c-4427-988c-d7fa8b6787e1	2	\N	\N
28d3f393-1c2f-4730-9182-486ba951d04d	2f25fae7-08eb-4216-824c-c89be08bbd88	0cf6ae53-d9ae-4269-ac96-f19b8dbdbcb2	4	\N	\N
6dbf6a0b-b7c3-4da2-89d3-0f1b20618075	2f25fae7-08eb-4216-824c-c89be08bbd88	93b1106e-24ce-4df3-8df8-ba4d21013a0a	2	\N	\N
dbb508d2-34a3-4192-8b48-646bed9dfe4f	2f25fae7-08eb-4216-824c-c89be08bbd88	32c3ef69-d57b-469b-ac2a-bbf3dec443b5	2	\N	\N
b33e2e39-4022-4e75-8a78-d904acd12cde	4f976fe5-ee51-4942-a437-a8e5d27fcee5	1e27b1c6-6ac2-4396-ab9f-748c0d1d87da	3	\N	\N
45dcd26b-4906-4794-a848-dbd10f1a4594	4f976fe5-ee51-4942-a437-a8e5d27fcee5	8ec7d2c3-8387-40a5-9d8d-3884689d4591	3	\N	\N
6f626977-7dc6-4485-b50e-69eabb4a6c4b	4f976fe5-ee51-4942-a437-a8e5d27fcee5	4eb84e04-a7d4-4632-b48d-37f155aefbe9	3	\N	\N
00cb9e59-6a83-4c8b-9ebc-c561d470922b	4f976fe5-ee51-4942-a437-a8e5d27fcee5	cb879680-3df9-42ab-a917-5866bfa7b144	3	\N	\N
41e09343-a96b-4427-a328-310e8885cb5a	4f976fe5-ee51-4942-a437-a8e5d27fcee5	5681cff4-0d71-4661-941a-4df86ccc102d	3	\N	\N
cf81bb0a-40c1-4756-a625-23d5a0a44c0e	4f976fe5-ee51-4942-a437-a8e5d27fcee5	260618d9-421c-4801-a453-b38f601b95c7	3	\N	\N
a93de169-1317-4bf1-a6db-286fd114971f	4f976fe5-ee51-4942-a437-a8e5d27fcee5	1902bd89-bcaf-4e25-9b56-cffaad95854a	6	\N	\N
059986cb-89f1-4ae1-9c58-a962d4a69b51	4f976fe5-ee51-4942-a437-a8e5d27fcee5	d44958b7-6c19-4427-a771-3e9eb86a9f48	2	\N	\N
00760ab9-de1b-4ddf-847f-4672efd428f4	4f976fe5-ee51-4942-a437-a8e5d27fcee5	ce2807b1-b439-49be-9789-78e2124aee22	2	\N	\N
1221118f-5d56-4b9c-a2f2-08b1f881cac5	4f976fe5-ee51-4942-a437-a8e5d27fcee5	4ccd9168-98ae-4077-a18e-8d9d034698fb	9	\N	\N
378f8548-06a2-42a9-8ab6-61feda272794	4f976fe5-ee51-4942-a437-a8e5d27fcee5	fd6d75ec-ec9d-45b2-a7d8-e61240070374	3	\N	\N
9c915220-229b-42f3-8c74-44211212cf45	4f976fe5-ee51-4942-a437-a8e5d27fcee5	afc437a4-c6e9-48db-91c5-a5d8d34538dd	6	\N	\N
68bd369b-c33e-4bd7-8ba5-27872bdfa6bd	4f976fe5-ee51-4942-a437-a8e5d27fcee5	3c29b236-58cf-4201-a171-4750ee76a5c5	6	\N	\N
fa14447a-1ddd-432e-939c-eed2416cf3c4	4f976fe5-ee51-4942-a437-a8e5d27fcee5	f25aea89-8505-4835-83a4-a302758e84a2	6	\N	\N
3be114b1-e166-4ff9-b7f0-de60e82bcf64	4f976fe5-ee51-4942-a437-a8e5d27fcee5	3d61be70-f89f-4d27-8b49-1ae3ab2a802c	1	\N	\N
cea9deaf-730a-4c35-9c55-c5259607b5f0	4f976fe5-ee51-4942-a437-a8e5d27fcee5	0dccea72-e417-4381-b430-0854dc98fd2b	2	\N	\N
4fdd7e7e-736b-4b46-9ed5-f6acc104523f	4f976fe5-ee51-4942-a437-a8e5d27fcee5	4ff4bc90-9ec6-4ef8-b00b-0ea0346642f3	2	\N	\N
8449a102-884d-479c-8fcb-af957b522f31	4f976fe5-ee51-4942-a437-a8e5d27fcee5	f62e9a15-d8a7-4781-a2fc-6df46b37e381	2	\N	\N
98bf5b7f-2f42-4423-a3f9-fe66495463b9	4f976fe5-ee51-4942-a437-a8e5d27fcee5	805955bc-5dde-4b98-85a4-a12e4b72f3bd	3	\N	\N
4085b89e-8482-4d25-8ab2-6e57e08d52ce	4f976fe5-ee51-4942-a437-a8e5d27fcee5	fe55be2a-4c99-4d7a-9694-0ca8304b2809	3	\N	\N
d87a358c-dfcc-47d9-814c-611029e0399f	4f976fe5-ee51-4942-a437-a8e5d27fcee5	080e1bc6-2e5b-485b-a369-99b53586eda3	3	\N	\N
0843ef96-e409-4a27-9170-5419d5b1d96b	4f976fe5-ee51-4942-a437-a8e5d27fcee5	806b7339-7303-414d-8966-d49f02fa804f	1	\N	\N
a5253c6d-4037-4a70-a0bd-84d4edda5cc3	4f976fe5-ee51-4942-a437-a8e5d27fcee5	fab4c8b8-6e83-431c-b784-ad3346759365	3	\N	\N
67ba7998-0444-421b-b679-bbc9b35fd781	4f976fe5-ee51-4942-a437-a8e5d27fcee5	add2d27e-1dd1-4f88-a897-897b0761003e	4	\N	\N
bca0a555-bed3-4eeb-af98-27aa7a7eee45	4f976fe5-ee51-4942-a437-a8e5d27fcee5	cc9be182-5d90-4abf-9976-823b4e61cd33	8	\N	\N
958341dc-d33b-4102-97af-70d822fafe15	4f976fe5-ee51-4942-a437-a8e5d27fcee5	9fdde592-74f0-466a-b65b-51c73a356c4f	4	\N	\N
95e1929e-f21e-46c5-abc4-c697fbb08fa4	4f976fe5-ee51-4942-a437-a8e5d27fcee5	51c5fbd4-d14c-4297-8ee6-32da2fbf65de	4	\N	\N
6e56e97c-56ab-490d-b639-75f7c85f1bd7	4f976fe5-ee51-4942-a437-a8e5d27fcee5	ce996f1c-5704-4f6a-8e6b-b407b3bd60c1	3	\N	\N
63a840b8-d67a-49a2-a1f8-5dfb76259980	4f976fe5-ee51-4942-a437-a8e5d27fcee5	f25f15a5-b640-4243-9209-7caf329754ff	3	\N	\N
bb69face-a6a8-4926-9614-c58957f93eb6	4f976fe5-ee51-4942-a437-a8e5d27fcee5	b47b5b58-6aa2-46d4-a375-7f7a794f762c	3	\N	\N
43e94df5-6524-4887-8ef6-1de23e3b4344	4f976fe5-ee51-4942-a437-a8e5d27fcee5	788e8ee6-cd6e-4d45-87a1-c62dbec2bd3c	3	\N	\N
b3f584ee-afe7-4a0e-a78a-b62f775e0c77	4f976fe5-ee51-4942-a437-a8e5d27fcee5	35803093-ba4c-4427-988c-d7fa8b6787e1	2	\N	\N
a2071e0f-3d4f-40c1-b4a7-713e52de566c	4f976fe5-ee51-4942-a437-a8e5d27fcee5	0cf6ae53-d9ae-4269-ac96-f19b8dbdbcb2	4	\N	\N
a0c1b316-9829-45b8-92c1-322166b6b783	4f976fe5-ee51-4942-a437-a8e5d27fcee5	93b1106e-24ce-4df3-8df8-ba4d21013a0a	2	\N	\N
87428452-cccc-49cc-91f5-0acfaef6e244	4f976fe5-ee51-4942-a437-a8e5d27fcee5	32c3ef69-d57b-469b-ac2a-bbf3dec443b5	2	\N	\N
5d72695b-1975-4e49-9270-9df971abce3b	0e6710a8-51ef-40c1-aedb-b39eff5db3ff	1e27b1c6-6ac2-4396-ab9f-748c0d1d87da	3	\N	\N
f094a150-f692-4d3a-a2d4-617c105df1fe	0e6710a8-51ef-40c1-aedb-b39eff5db3ff	8ec7d2c3-8387-40a5-9d8d-3884689d4591	3	\N	\N
c200698b-d46d-43ff-a449-e507267e7772	0e6710a8-51ef-40c1-aedb-b39eff5db3ff	4eb84e04-a7d4-4632-b48d-37f155aefbe9	3	\N	\N
38e640e2-f55a-4a63-b74d-021e65ac261b	0e6710a8-51ef-40c1-aedb-b39eff5db3ff	cb879680-3df9-42ab-a917-5866bfa7b144	3	\N	\N
8f92a079-1a07-49ce-bf39-87e41639f0e2	0e6710a8-51ef-40c1-aedb-b39eff5db3ff	5681cff4-0d71-4661-941a-4df86ccc102d	3	\N	\N
81ae16d4-22f6-47d5-8946-f385f5372d89	0e6710a8-51ef-40c1-aedb-b39eff5db3ff	260618d9-421c-4801-a453-b38f601b95c7	3	\N	\N
c46ae56e-8e70-4a53-8dd6-8c04c9b6ed65	0e6710a8-51ef-40c1-aedb-b39eff5db3ff	1902bd89-bcaf-4e25-9b56-cffaad95854a	6	\N	\N
edd921c4-886f-48ab-878e-bbab50988a96	0e6710a8-51ef-40c1-aedb-b39eff5db3ff	d44958b7-6c19-4427-a771-3e9eb86a9f48	2	\N	\N
d27d6a2c-2f06-40ff-8e0d-73087b5b027d	0e6710a8-51ef-40c1-aedb-b39eff5db3ff	ce2807b1-b439-49be-9789-78e2124aee22	2	\N	\N
741a6b86-d0c8-42d4-a197-20c0c0969fce	0e6710a8-51ef-40c1-aedb-b39eff5db3ff	4ccd9168-98ae-4077-a18e-8d9d034698fb	9	\N	\N
22045c31-b15c-4158-8a7a-34e0e4848d0b	0e6710a8-51ef-40c1-aedb-b39eff5db3ff	fd6d75ec-ec9d-45b2-a7d8-e61240070374	3	\N	\N
15bf1029-0de1-4710-8470-7c5ccaa5868b	0e6710a8-51ef-40c1-aedb-b39eff5db3ff	afc437a4-c6e9-48db-91c5-a5d8d34538dd	6	\N	\N
455087ff-03f0-47c4-b1f2-93fd9cef53ad	0e6710a8-51ef-40c1-aedb-b39eff5db3ff	3c29b236-58cf-4201-a171-4750ee76a5c5	6	\N	\N
079479e5-b0bd-48a5-88e0-1e2c6d7f6e48	0e6710a8-51ef-40c1-aedb-b39eff5db3ff	f25aea89-8505-4835-83a4-a302758e84a2	6	\N	\N
aa5ef6cc-b32a-4844-9f41-5d0d753c67f4	0e6710a8-51ef-40c1-aedb-b39eff5db3ff	3d61be70-f89f-4d27-8b49-1ae3ab2a802c	1	\N	\N
da5b401d-7fd0-4f63-8217-018d1aa70a4b	0e6710a8-51ef-40c1-aedb-b39eff5db3ff	0dccea72-e417-4381-b430-0854dc98fd2b	2	\N	\N
e6763f4c-ad67-4ef8-b0f3-402385236480	0e6710a8-51ef-40c1-aedb-b39eff5db3ff	4ff4bc90-9ec6-4ef8-b00b-0ea0346642f3	2	\N	\N
15b9f058-1a4d-448d-a0f3-833b9d2d78fc	0e6710a8-51ef-40c1-aedb-b39eff5db3ff	f62e9a15-d8a7-4781-a2fc-6df46b37e381	2	\N	\N
c641c0a7-1896-42ac-807e-4dce3aa46631	0e6710a8-51ef-40c1-aedb-b39eff5db3ff	805955bc-5dde-4b98-85a4-a12e4b72f3bd	3	\N	\N
258de58e-57b1-4920-9a13-6bd85fc97a2f	0e6710a8-51ef-40c1-aedb-b39eff5db3ff	fe55be2a-4c99-4d7a-9694-0ca8304b2809	3	\N	\N
45ec91dc-28a5-4468-9ab9-ab4589703812	0e6710a8-51ef-40c1-aedb-b39eff5db3ff	080e1bc6-2e5b-485b-a369-99b53586eda3	3	\N	\N
75beab1a-aa49-4ab7-80c1-05d6978f6d09	0e6710a8-51ef-40c1-aedb-b39eff5db3ff	806b7339-7303-414d-8966-d49f02fa804f	1	\N	\N
27e681dc-049f-4465-b9dd-394200634c62	0e6710a8-51ef-40c1-aedb-b39eff5db3ff	fab4c8b8-6e83-431c-b784-ad3346759365	3	\N	\N
a98b1b0c-fe75-4cb5-9409-fa0272d3deec	0e6710a8-51ef-40c1-aedb-b39eff5db3ff	add2d27e-1dd1-4f88-a897-897b0761003e	4	\N	\N
635d9aa9-4350-40a3-9363-28e6c230eb8d	0e6710a8-51ef-40c1-aedb-b39eff5db3ff	cc9be182-5d90-4abf-9976-823b4e61cd33	8	\N	\N
43072dc2-adcd-46fd-aecd-dc06eb87ee96	0e6710a8-51ef-40c1-aedb-b39eff5db3ff	9fdde592-74f0-466a-b65b-51c73a356c4f	4	\N	\N
4231a38a-00e1-4b00-9245-e2e7aebbcaf8	0e6710a8-51ef-40c1-aedb-b39eff5db3ff	51c5fbd4-d14c-4297-8ee6-32da2fbf65de	4	\N	\N
dc4b5ffd-0dce-4f46-a096-d84b62160535	0e6710a8-51ef-40c1-aedb-b39eff5db3ff	ce996f1c-5704-4f6a-8e6b-b407b3bd60c1	3	\N	\N
1f0c809b-6e0a-4dd6-9961-14d6b0461e40	0e6710a8-51ef-40c1-aedb-b39eff5db3ff	f25f15a5-b640-4243-9209-7caf329754ff	3	\N	\N
6bb02579-7e0b-4404-9f13-ff3b645198fd	0e6710a8-51ef-40c1-aedb-b39eff5db3ff	b47b5b58-6aa2-46d4-a375-7f7a794f762c	3	\N	\N
33a68133-4f59-4d7a-ba31-8dd50ad39553	0e6710a8-51ef-40c1-aedb-b39eff5db3ff	788e8ee6-cd6e-4d45-87a1-c62dbec2bd3c	3	\N	\N
332b32c9-c2bf-4967-b6f0-8a6316ef90d5	0e6710a8-51ef-40c1-aedb-b39eff5db3ff	35803093-ba4c-4427-988c-d7fa8b6787e1	2	\N	\N
384136fe-4a3a-4bb5-a134-02a12b636bb8	0e6710a8-51ef-40c1-aedb-b39eff5db3ff	0cf6ae53-d9ae-4269-ac96-f19b8dbdbcb2	4	\N	\N
583a88f3-8d69-4f18-af54-e274a20f7158	0e6710a8-51ef-40c1-aedb-b39eff5db3ff	93b1106e-24ce-4df3-8df8-ba4d21013a0a	2	\N	\N
89131f99-55bc-4ca4-8878-2ac8ba9b6fdc	0e6710a8-51ef-40c1-aedb-b39eff5db3ff	32c3ef69-d57b-469b-ac2a-bbf3dec443b5	2	\N	\N
1739178f-b1c2-4056-ac05-6ae8ecea163b	48ddc9fc-b2da-4efa-a1ab-89b261ed4c22	fd6d75ec-ec9d-45b2-a7d8-e61240070374	6	\N	\N
57dd9144-95d4-4320-acf7-2c11b9c0efb0	48ddc9fc-b2da-4efa-a1ab-89b261ed4c22	e00843fb-fedb-434a-ae73-f9d8e554151e	8	\N	\N
6cd3d4b7-d6ef-48f1-a354-35fd120c63e7	48ddc9fc-b2da-4efa-a1ab-89b261ed4c22	3c29b236-58cf-4201-a171-4750ee76a5c5	6	\N	\N
0beeeed4-5235-4926-9173-f69c6c68cc9a	48ddc9fc-b2da-4efa-a1ab-89b261ed4c22	1cea990b-852a-41cc-9216-fa3e3006f2d6	6	\N	\N
af24d28d-9c1d-4435-a4a0-3febda487f59	48ddc9fc-b2da-4efa-a1ab-89b261ed4c22	51c9a455-1506-4887-ae1d-0f775899174d	9	\N	\N
ecc77496-3bd1-40e6-b31e-2817b25f1426	48ddc9fc-b2da-4efa-a1ab-89b261ed4c22	fab4c8b8-6e83-431c-b784-ad3346759365	7	\N	\N
5ddbe3be-fb27-46d7-ba9d-9a156d2680ed	48ddc9fc-b2da-4efa-a1ab-89b261ed4c22	cc9be182-5d90-4abf-9976-823b4e61cd33	8	\N	\N
9cb0b7bd-57d6-45a0-8c11-a8600498ea13	48ddc9fc-b2da-4efa-a1ab-89b261ed4c22	51c5fbd4-d14c-4297-8ee6-32da2fbf65de	4	\N	\N
fe4d5aec-b6a3-4bf1-bf76-ecb0fa7b7461	48ddc9fc-b2da-4efa-a1ab-89b261ed4c22	9fdde592-74f0-466a-b65b-51c73a356c4f	4	\N	\N
4546d0ff-d595-4a82-a3e4-0bb4b3514019	48ddc9fc-b2da-4efa-a1ab-89b261ed4c22	2b5872eb-4998-4d04-a96d-338e6e4d9165	3	\N	\N
25f5447c-639e-4f68-baac-0beb54fec9ee	48ddc9fc-b2da-4efa-a1ab-89b261ed4c22	5b685926-58cb-49cb-a629-c5238a00740a	3	\N	\N
ae04a55e-e672-42eb-a250-e347f2736404	48ddc9fc-b2da-4efa-a1ab-89b261ed4c22	9e5e6bce-ec92-4ed8-ba16-b8c2e3b60fe4	4	\N	\N
174697ca-6f97-4be7-82d1-e13a0c8a7d8b	48ddc9fc-b2da-4efa-a1ab-89b261ed4c22	e3685b83-25e1-4679-a9d0-5fcaa8be1b29	4	\N	\N
e868a9d9-8844-4f27-aead-a750d6426dea	48ddc9fc-b2da-4efa-a1ab-89b261ed4c22	0cf6ae53-d9ae-4269-ac96-f19b8dbdbcb2	4	\N	\N
0cad0879-7d52-40a5-abd7-f08a580d421c	48ddc9fc-b2da-4efa-a1ab-89b261ed4c22	4ff4bc90-9ec6-4ef8-b00b-0ea0346642f3	2	\N	\N
4e6b9a6c-043e-4654-a911-d68e17b8a5cc	024c0bb9-769a-4ba3-8a6b-adf8eadb9886	3c29b236-58cf-4201-a171-4750ee76a5c5	6	\N	\N
f30848a3-2551-423f-bff3-b9d1264f9640	024c0bb9-769a-4ba3-8a6b-adf8eadb9886	9fac21e5-a8bc-4204-bb35-7dde2cc211e9	6	\N	\N
3f1ca76f-516f-4370-b98a-7bdc729c4a1a	024c0bb9-769a-4ba3-8a6b-adf8eadb9886	fd6d75ec-ec9d-45b2-a7d8-e61240070374	6	\N	\N
ea80c8e3-1ec1-42e3-ae8b-011ff993c776	024c0bb9-769a-4ba3-8a6b-adf8eadb9886	e00843fb-fedb-434a-ae73-f9d8e554151e	8	\N	\N
2a59bb76-d079-4b3f-85b3-7a65f28638c8	024c0bb9-769a-4ba3-8a6b-adf8eadb9886	2b052187-883e-43a4-bed1-523771b663e0	6	\N	\N
664cd292-a485-439f-9040-ab7d82121d3f	024c0bb9-769a-4ba3-8a6b-adf8eadb9886	1cea990b-852a-41cc-9216-fa3e3006f2d6	6	\N	\N
4bc872f7-7cfe-43b1-8189-f81468952b01	024c0bb9-769a-4ba3-8a6b-adf8eadb9886	3d61be70-f89f-4d27-8b49-1ae3ab2a802c	1	\N	\N
6d0714f8-7246-46e6-bc16-139d99e110e8	024c0bb9-769a-4ba3-8a6b-adf8eadb9886	0dccea72-e417-4381-b430-0854dc98fd2b	2	\N	\N
1fca7e6f-bdcc-48d7-a27a-872318e40c82	024c0bb9-769a-4ba3-8a6b-adf8eadb9886	c747c326-8331-4ec4-b19a-ee3912f4bbec	3	\N	\N
e612cd41-bb28-4421-8b44-31cb12c94526	024c0bb9-769a-4ba3-8a6b-adf8eadb9886	2b5872eb-4998-4d04-a96d-338e6e4d9165	3	\N	\N
8bb1e192-f658-4a7a-96a4-fa2bfc6e71d6	024c0bb9-769a-4ba3-8a6b-adf8eadb9886	806b7339-7303-414d-8966-d49f02fa804f	1	\N	\N
6ae04da4-bfd5-457b-8cec-ddfbc7834027	024c0bb9-769a-4ba3-8a6b-adf8eadb9886	9e5e6bce-ec92-4ed8-ba16-b8c2e3b60fe4	4	\N	\N
707c8435-60db-4201-a6ed-53ac9acc9353	024c0bb9-769a-4ba3-8a6b-adf8eadb9886	e3685b83-25e1-4679-a9d0-5fcaa8be1b29	4	\N	\N
7b8119ff-ca97-454b-8409-4bef43ba9c87	024c0bb9-769a-4ba3-8a6b-adf8eadb9886	8890477e-792f-4ccc-bfa4-efa5d19cbba3	2	\N	\N
14ef71c6-27f9-42c4-b17f-5bd352499dbb	024c0bb9-769a-4ba3-8a6b-adf8eadb9886	cc9be182-5d90-4abf-9976-823b4e61cd33	5	\N	\N
0633af39-0f9a-4a45-a18e-3c16cddc455f	b2355503-10ba-4b46-9e64-1f8ed51a6012	bad109cb-d782-461d-8e7a-323df5b02c78	17	\N	\N
78d4d5e0-06b8-46e7-b9d8-92e618c10744	b2355503-10ba-4b46-9e64-1f8ed51a6012	c7a6c45e-4a7a-4f2e-92da-1855938f9ffd	10	\N	\N
cd6c0533-fe86-4dcd-a4dc-7b50bdd91815	b2355503-10ba-4b46-9e64-1f8ed51a6012	92457660-b3be-4cd7-bfec-9bcc6c014972	10	\N	\N
aaa1b782-44c0-46f9-8f6e-f5e112a30de7	b2355503-10ba-4b46-9e64-1f8ed51a6012	2c6940a2-09a5-4dc0-b333-32e55797a54e	26	\N	\N
cf7d4d2d-728d-4d45-be31-c53ebd9d5e0e	b2355503-10ba-4b46-9e64-1f8ed51a6012	ae377a03-a318-482a-8fda-c11e579ae794	15	\N	\N
b7110ea2-94de-4002-affc-ca02337ffc55	b2355503-10ba-4b46-9e64-1f8ed51a6012	f5241d62-3222-456c-8ebf-1df6a42a0936	12	\N	\N
173d3eb8-531e-4d2a-9858-477dbe883597	024c0bb9-769a-4ba3-8a6b-adf8eadb9886	5b685926-58cb-49cb-a629-c5238a00740a	3	\N	\N
7ca34d69-f4b8-4eba-b80b-4983bc2ccd78	024c0bb9-769a-4ba3-8a6b-adf8eadb9886	4ff4bc90-9ec6-4ef8-b00b-0ea0346642f3	2	\N	\N
474f86ac-463b-4367-8e96-fa4e288beeb5	024c0bb9-769a-4ba3-8a6b-adf8eadb9886	f62e9a15-d8a7-4781-a2fc-6df46b37e381	2	\N	\N
1fd30435-7392-4eeb-9af2-a5a20fc3d6f8	024c0bb9-769a-4ba3-8a6b-adf8eadb9886	6c2bd3f8-a725-4c6a-bc96-487b8512f477	3	\N	\N
f2f65690-9e01-45dc-bdca-987f2fad622d	024c0bb9-769a-4ba3-8a6b-adf8eadb9886	080e1bc6-2e5b-485b-a369-99b53586eda3	3	\N	\N
e98aa2af-1b82-4a83-b629-09b5e55a32e3	024c0bb9-769a-4ba3-8a6b-adf8eadb9886	fab4c8b8-6e83-431c-b784-ad3346759365	9	\N	\N
3b971aa1-93c1-49d7-abe3-3129fd07f2d6	024c0bb9-769a-4ba3-8a6b-adf8eadb9886	51c9a455-1506-4887-ae1d-0f775899174d	9	\N	\N
7d1cd3f8-45bd-46b7-9ab4-5f38ea7a1127	024c0bb9-769a-4ba3-8a6b-adf8eadb9886	294ca3f1-937d-4efa-aa8c-864c644fe24b	4	\N	\N
e9be6061-47d4-41ff-a890-1d5196c80950	024c0bb9-769a-4ba3-8a6b-adf8eadb9886	1fe347d2-0396-4f21-89e0-5a7bb19f3756	3	\N	\N
47a895b7-b58e-4dff-82ef-ab9155716f5f	024c0bb9-769a-4ba3-8a6b-adf8eadb9886	9fdde592-74f0-466a-b65b-51c73a356c4f	4	\N	\N
45819f7f-3c60-47dd-8eed-40d500484e98	024c0bb9-769a-4ba3-8a6b-adf8eadb9886	51c5fbd4-d14c-4297-8ee6-32da2fbf65de	4	\N	\N
d588a442-2b83-4d8f-9def-0b7dbd5a6069	024c0bb9-769a-4ba3-8a6b-adf8eadb9886	9f2beabc-2da0-4a15-9a98-5192ddbe714b	2	\N	\N
dc02e599-2b86-45b6-8380-dbf3ea7c126f	024c0bb9-769a-4ba3-8a6b-adf8eadb9886	0cf6ae53-d9ae-4269-ac96-f19b8dbdbcb2	4	\N	\N
6c6b657d-8706-4cc1-b534-beafb1493b66	024c0bb9-769a-4ba3-8a6b-adf8eadb9886	4bee824c-e816-4b4a-9027-7c6cb4e495da	4	\N	\N
\.


--
-- TOC entry 3630 (class 0 OID 38011)
-- Dependencies: 226
-- Data for Name: Storage; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Storage" (id, name, "createdAt") FROM stdin;
ab9a3b7d-5cfd-4d1e-94f3-f1ce655854b4	Мобилен Склад	2025-07-23 06:26:59.897
6b5f66af-bd69-492f-8ee3-5ca726b5b8cc	Основен склад	2025-07-24 08:59:27.521
\.


--
-- TOC entry 3631 (class 0 OID 38019)
-- Dependencies: 227
-- Data for Name: StorageProduct; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."StorageProduct" (id, "storageId", "productId", quantity) FROM stdin;
b0f7178c-2a06-4900-8cb6-a8c156e7c369	ab9a3b7d-5cfd-4d1e-94f3-f1ce655854b4	8890477e-792f-4ccc-bfa4-efa5d19cbba3	4
bb1b86c3-a62f-4ba1-a37e-645fc868e1fd	6b5f66af-bd69-492f-8ee3-5ca726b5b8cc	c17ea773-f608-4bb6-a71f-d41ee7ea3882	0
d4ff35b9-9dfe-4d6a-992a-ff73e8985e2a	6b5f66af-bd69-492f-8ee3-5ca726b5b8cc	2b052187-883e-43a4-bed1-523771b663e0	0
0f1733f9-aa4a-4556-8806-a7324a92d001	6b5f66af-bd69-492f-8ee3-5ca726b5b8cc	c6eacdb6-5f77-49a6-b3f7-3befef4e9881	1
d9dfa367-2eb8-4ab7-920f-79acb4bb28e6	6b5f66af-bd69-492f-8ee3-5ca726b5b8cc	06e735dc-80bf-40c6-ac32-f8e8235350a4	0
de7b3237-89e8-4b04-9888-38ca874c58ed	6b5f66af-bd69-492f-8ee3-5ca726b5b8cc	8c5d3590-8de1-49eb-852b-5b00a2d95d65	0
d8dd0514-3e49-4830-ade1-3d596c48e7eb	6b5f66af-bd69-492f-8ee3-5ca726b5b8cc	3c47788d-21bc-4263-a1f0-a062a6e51a9b	0
340180b2-82e7-41a3-816a-54ac4d612524	6b5f66af-bd69-492f-8ee3-5ca726b5b8cc	57090686-76e3-4ef8-83fb-e9f27c159566	0
6d8d68ca-791e-4984-93e8-e151b9f8148e	6b5f66af-bd69-492f-8ee3-5ca726b5b8cc	a8707b5a-a41c-4bc8-a0fe-c823c45ab014	0
4c086556-dcb3-45a4-871f-f1bdb4593a47	6b5f66af-bd69-492f-8ee3-5ca726b5b8cc	d0e59e48-079d-442a-920d-ca5b5741b66f	0
cce41361-3f1e-4c65-8254-8a97df9832dc	6b5f66af-bd69-492f-8ee3-5ca726b5b8cc	294ca3f1-937d-4efa-aa8c-864c644fe24b	0
3d62ce1a-774a-44bf-b4ec-c93d1c92dc8f	6b5f66af-bd69-492f-8ee3-5ca726b5b8cc	4edfafe5-16d2-4b03-b375-f771eec43ebe	0
72165bca-c13e-41e6-a403-01cc78acc82b	6b5f66af-bd69-492f-8ee3-5ca726b5b8cc	8def029f-c4b6-4e44-bbd8-24a3798eaf46	0
dd191c00-1f48-4b07-b72b-4cfdc0df0d17	6b5f66af-bd69-492f-8ee3-5ca726b5b8cc	9e5e6bce-ec92-4ed8-ba16-b8c2e3b60fe4	0
7105dfac-fc27-4f30-a02b-55a0bb607478	6b5f66af-bd69-492f-8ee3-5ca726b5b8cc	eb2a677a-a7d0-41a4-b985-ff96a3788362	0
2a577c61-7800-47c8-9908-c1babcf2feba	ab9a3b7d-5cfd-4d1e-94f3-f1ce655854b4	5681cff4-0d71-4661-941a-4df86ccc102d	5
ea2a0af9-5d0e-4140-bd95-786b7e7def1a	ab9a3b7d-5cfd-4d1e-94f3-f1ce655854b4	260618d9-421c-4801-a453-b38f601b95c7	5
044a72cb-a0f3-48fd-bfdb-2f44a2bb944e	ab9a3b7d-5cfd-4d1e-94f3-f1ce655854b4	1902bd89-bcaf-4e25-9b56-cffaad95854a	5
fcde3af8-ca4e-4498-b0cc-3101d582e147	ab9a3b7d-5cfd-4d1e-94f3-f1ce655854b4	d44958b7-6c19-4427-a771-3e9eb86a9f48	2
a08c887c-f289-482a-baff-f95428bcc9d9	ab9a3b7d-5cfd-4d1e-94f3-f1ce655854b4	ce2807b1-b439-49be-9789-78e2124aee22	2
5faebe3c-1150-4222-a50a-c5e0dfc976b9	ab9a3b7d-5cfd-4d1e-94f3-f1ce655854b4	afc437a4-c6e9-48db-91c5-a5d8d34538dd	6
d9702969-737e-4a5a-ac0a-23489863fa4e	ab9a3b7d-5cfd-4d1e-94f3-f1ce655854b4	4bee824c-e816-4b4a-9027-7c6cb4e495da	7
a50f9d45-b578-4dfd-aa39-4f291c66d582	ab9a3b7d-5cfd-4d1e-94f3-f1ce655854b4	0cf6ae53-d9ae-4269-ac96-f19b8dbdbcb2	6
def27573-f8e3-49f6-a902-3ff2f09126b4	ab9a3b7d-5cfd-4d1e-94f3-f1ce655854b4	3d61be70-f89f-4d27-8b49-1ae3ab2a802c	2
ab2c0418-168a-4b2f-a6eb-60ce54c07596	ab9a3b7d-5cfd-4d1e-94f3-f1ce655854b4	0dccea72-e417-4381-b430-0854dc98fd2b	4
33a921d9-6de9-4d15-b0e6-ee1093454c73	ab9a3b7d-5cfd-4d1e-94f3-f1ce655854b4	9f2beabc-2da0-4a15-9a98-5192ddbe714b	3
c8ba66d6-8007-4b73-9f69-97098e8f92f4	ab9a3b7d-5cfd-4d1e-94f3-f1ce655854b4	c747c326-8331-4ec4-b19a-ee3912f4bbec	5
6548e41a-0d1f-41a8-be65-3d83a8d4fa94	ab9a3b7d-5cfd-4d1e-94f3-f1ce655854b4	294ca3f1-937d-4efa-aa8c-864c644fe24b	11
1f8ed99f-e119-4ded-9ff4-94dae70b0a0a	ab9a3b7d-5cfd-4d1e-94f3-f1ce655854b4	806b7339-7303-414d-8966-d49f02fa804f	7
6b83a022-ec48-4be6-8f4e-0bf470c89dc5	ab9a3b7d-5cfd-4d1e-94f3-f1ce655854b4	51c9a455-1506-4887-ae1d-0f775899174d	14
85c93b81-2b74-4da8-ba32-14ea33574705	ab9a3b7d-5cfd-4d1e-94f3-f1ce655854b4	fab4c8b8-6e83-431c-b784-ad3346759365	15
4e9be253-a99b-4cd1-b87a-c3725aff6d18	ab9a3b7d-5cfd-4d1e-94f3-f1ce655854b4	080e1bc6-2e5b-485b-a369-99b53586eda3	4
db9ccbb8-9762-4b28-8ccc-697df4da42d3	ab9a3b7d-5cfd-4d1e-94f3-f1ce655854b4	6c2bd3f8-a725-4c6a-bc96-487b8512f477	4
7231f97b-0560-4fbf-9eef-8a75ece700a9	ab9a3b7d-5cfd-4d1e-94f3-f1ce655854b4	2b052187-883e-43a4-bed1-523771b663e0	11
f1352415-2082-44a7-8d14-453f3c4b3b67	ab9a3b7d-5cfd-4d1e-94f3-f1ce655854b4	fd6d75ec-ec9d-45b2-a7d8-e61240070374	8
3575d452-fe46-42d0-8afb-882ee32300e6	ab9a3b7d-5cfd-4d1e-94f3-f1ce655854b4	9fac21e5-a8bc-4204-bb35-7dde2cc211e9	7
76b2abd6-c49c-4ac7-bd19-58d6956a2979	ab9a3b7d-5cfd-4d1e-94f3-f1ce655854b4	e3685b83-25e1-4679-a9d0-5fcaa8be1b29	7
4cb70057-055a-4dbf-a1c4-473381c7d4c0	ab9a3b7d-5cfd-4d1e-94f3-f1ce655854b4	f62e9a15-d8a7-4781-a2fc-6df46b37e381	2
71affe13-2481-47bc-b32e-6c926fc96c93	ab9a3b7d-5cfd-4d1e-94f3-f1ce655854b4	4ff4bc90-9ec6-4ef8-b00b-0ea0346642f3	0
2cb658fb-a8c4-4d98-982c-903c1e181e75	ab9a3b7d-5cfd-4d1e-94f3-f1ce655854b4	9e5e6bce-ec92-4ed8-ba16-b8c2e3b60fe4	6
d8fea9d6-d44d-4ede-a31b-e6d0a17a1057	ab9a3b7d-5cfd-4d1e-94f3-f1ce655854b4	2b5872eb-4998-4d04-a96d-338e6e4d9165	5
a91c31dd-3ced-473d-9319-500922e1e041	ab9a3b7d-5cfd-4d1e-94f3-f1ce655854b4	3c29b236-58cf-4201-a171-4750ee76a5c5	11
5e1f39e2-3fe3-468d-9cf1-410c156f13d9	ab9a3b7d-5cfd-4d1e-94f3-f1ce655854b4	51c5fbd4-d14c-4297-8ee6-32da2fbf65de	5
905dc883-b6e1-496b-a384-85a350c5ef9c	ab9a3b7d-5cfd-4d1e-94f3-f1ce655854b4	9fdde592-74f0-466a-b65b-51c73a356c4f	1
5593b8d8-9f49-4e21-a36a-1536311bdba3	ab9a3b7d-5cfd-4d1e-94f3-f1ce655854b4	5b685926-58cb-49cb-a629-c5238a00740a	3
f473370e-540f-47f0-8743-544a4dfa058a	ab9a3b7d-5cfd-4d1e-94f3-f1ce655854b4	1cea990b-852a-41cc-9216-fa3e3006f2d6	8
d72e9e5b-d564-4a74-afe1-9de09dde372f	ab9a3b7d-5cfd-4d1e-94f3-f1ce655854b4	e00843fb-fedb-434a-ae73-f9d8e554151e	7
cf11b90b-2b68-439d-ab4b-3577828cdc24	ab9a3b7d-5cfd-4d1e-94f3-f1ce655854b4	cc9be182-5d90-4abf-9976-823b4e61cd33	12
0e650fd2-1c65-4061-b71b-61d8d9923864	6b5f66af-bd69-492f-8ee3-5ca726b5b8cc	8890477e-792f-4ccc-bfa4-efa5d19cbba3	5
\.


--
-- TOC entry 3627 (class 0 OID 37987)
-- Dependencies: 223
-- Data for Name: Store; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Store" (id, name, address, contact, phone, "createdAt", "partnerId") FROM stdin;
fad641c4-1637-40ec-b67d-85ae99e94f15	Хаско Маркет	Хасково	Никол	0898464020	2025-07-21 09:41:43.548	1513
6fad594c-13db-4423-b2d7-a67a7c3c8027	Верде Маркет	Гълъбово	Росица	0894001392	2025-07-21 09:48:22.873	1613
f5888faf-d7b5-4654-89ba-e0802a9b0048	Килера Лебеда	Хасково			2025-07-21 10:05:24.834	1616
2fde0c13-f123-4ec5-a1cd-a70afa7a580d	ЕНЕВ БД ЕООД	Раднево	Боряна Енева	0894863555	2025-07-23 07:27:25.774	1628
f6f7de18-4b51-496c-bc59-db90579f2254	Смесен Магазин	с. Стамболово	Жечка Николова Колева		2025-08-07 10:25:16.21	1644
2b13b5e2-ec19-4a41-a5e6-2592ec28ddcd	ХИТ-МАРКЕТ "КАЛИНА"	Любимец			2025-08-07 10:50:35.523	1645
f4b59bd3-3a8b-46f7-b8ec-6aa61c88997a	Славея Минерални Бани	Минерални Бани			2025-08-07 13:07:14.977	1646
\.


--
-- TOC entry 3646 (class 0 OID 45539)
-- Dependencies: 242
-- Data for Name: StoreSchedule; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."StoreSchedule" (id, "storeId", date, type, notes, "createdAt") FROM stdin;
\.


--
-- TOC entry 3639 (class 0 OID 38080)
-- Dependencies: 235
-- Data for Name: Transfer; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."Transfer" (id, "createdAt", "sourceStorageId", "destinationStorageId", "userId", status, "confirmedById", "confirmedAt") FROM stdin;
c8b12ef5-9716-4464-9e57-0f9e3dcc9b2b	2025-08-05 07:51:10.061	6b5f66af-bd69-492f-8ee3-5ca726b5b8cc	48ddc9fc-b2da-4efa-a1ab-89b261ed4c22	74a1cd5c-8ae8-40c4-b117-c7530a461026	COMPLETED	74a1cd5c-8ae8-40c4-b117-c7530a461026	2025-08-05 07:51:28.341
f57b93d5-5229-4750-ab69-3d5860f882c3	2025-08-11 11:10:36.875	ab9a3b7d-5cfd-4d1e-94f3-f1ce655854b4	024c0bb9-769a-4ba3-8a6b-adf8eadb9886	74a1cd5c-8ae8-40c4-b117-c7530a461026	COMPLETED	74a1cd5c-8ae8-40c4-b117-c7530a461026	2025-08-11 11:14:13.084
\.


--
-- TOC entry 3640 (class 0 OID 38089)
-- Dependencies: 236
-- Data for Name: TransferProduct; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."TransferProduct" (id, "transferId", "productId", quantity) FROM stdin;
35e0589f-a149-442f-be22-b718d8b6d731	c8b12ef5-9716-4464-9e57-0f9e3dcc9b2b	2b052187-883e-43a4-bed1-523771b663e0	6
a0b2de91-aede-409d-ab64-37d416c28d1e	f57b93d5-5229-4750-ab69-3d5860f882c3	cc9be182-5d90-4abf-9976-823b4e61cd33	1
\.


--
-- TOC entry 3636 (class 0 OID 38059)
-- Dependencies: 232
-- Data for Name: UserPartner; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."UserPartner" (id, "userId", "partnerId") FROM stdin;
230528ce-d54a-4e77-95a1-00a7cc805d17	68b9923d-7800-4662-905e-a906d131314b	1322
e7f0c687-455a-428e-9122-32a144551bd3	68b9923d-7800-4662-905e-a906d131314b	1628
5a0d9cc7-2875-42e9-975f-ca5bf852595c	68b9923d-7800-4662-905e-a906d131314b	1616
dc67a153-1eac-47ef-b3ef-500bc4bf632b	68b9923d-7800-4662-905e-a906d131314b	1613
be32ddcc-bfa0-4e37-9de5-682a5f6f125b	68b9923d-7800-4662-905e-a906d131314b	1513
dd94d529-345a-430a-ae32-2aef289f501d	68b9923d-7800-4662-905e-a906d131314b	1645
8f469963-ad1e-41fb-ad32-ecca29221bfe	68b9923d-7800-4662-905e-a906d131314b	1644
45e45c90-54fe-45ac-9a19-91b60b1549b9	68b9923d-7800-4662-905e-a906d131314b	1646
\.


--
-- TOC entry 3637 (class 0 OID 38066)
-- Dependencies: 233
-- Data for Name: UserStand; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."UserStand" (id, "userId", "standId") FROM stdin;
c0c1dba4-fe4a-4a8a-b99d-a06a572aeec9	68b9923d-7800-4662-905e-a906d131314b	73e62de1-16b3-4025-aa1c-d08eb91e0b54
b649d80f-4846-4c1b-9920-3ebfcfde90f1	68b9923d-7800-4662-905e-a906d131314b	48ddc9fc-b2da-4efa-a1ab-89b261ed4c22
00db040f-ffcb-482a-ab9f-6b45f635a841	68b9923d-7800-4662-905e-a906d131314b	722957e4-24b4-4fef-a9de-eb3dfddadb3f
9d03e6e0-c8e1-4482-afa2-f455e3fb3505	68b9923d-7800-4662-905e-a906d131314b	90b3cae4-e222-4463-aa5a-2bdfdbee08e8
24b63278-3db3-4c03-bedb-43742abdeb90	68b9923d-7800-4662-905e-a906d131314b	158bf47a-1079-4ecb-b58d-0e5c88e05588
b93bd921-58e6-4df5-943d-c4d5cf8a7d86	68b9923d-7800-4662-905e-a906d131314b	0e6710a8-51ef-40c1-aedb-b39eff5db3ff
2ce4da08-c8f3-4743-bbec-03d251647d18	68b9923d-7800-4662-905e-a906d131314b	2f25fae7-08eb-4216-824c-c89be08bbd88
db640eca-180b-49c4-ab68-e65b35b8ec94	68b9923d-7800-4662-905e-a906d131314b	4f976fe5-ee51-4942-a437-a8e5d27fcee5
\.


--
-- TOC entry 3638 (class 0 OID 38073)
-- Dependencies: 234
-- Data for Name: UserStorage; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public."UserStorage" (id, "userId", "storageId") FROM stdin;
19a02949-e396-4a03-ab93-f20e85b12929	68b9923d-7800-4662-905e-a906d131314b	ab9a3b7d-5cfd-4d1e-94f3-f1ce655854b4
\.


--
-- TOC entry 3619 (class 0 OID 37902)
-- Dependencies: 215
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
903e6633-6528-4917-96de-c60e2049b8d2	05873c67d20fb2b8358d05aba8ee01abd192d45fecb3328eb050101dbbdebf0e	2025-07-11 13:55:19.122594+00	20250710142402_add_revision_status	\N	\N	2025-07-11 13:55:18.839751+00	1
03abe579-5d65-4e78-b0c9-3d7fb086c575	81ede862a5211327954327612612ccda34a17238054119cf5f6387a7e34f3619	2025-07-07 13:30:54.135061+00	20250707133052_add_import_table	\N	\N	2025-07-07 13:30:52.835183+00	1
ebace499-3c1b-49a1-ab8a-2d8e919d617a	217b1b071ee500e8fd4bb0048021f0b8ebc0f0a17ed5e2ed385b8406d2da0a90	2025-07-07 13:35:44.15147+00	20250707133543_add_import_product_table	\N	\N	2025-07-07 13:35:43.828086+00	1
29bf1627-1f3b-48cd-9193-6b1778e0b700	8ba6b08d915a2268ce95dd56a10747f9b4c1d8b93648f6ec99c56ee033f1a650	2025-07-08 06:59:14.483639+00	20250708065913_add_partner_country_city	\N	\N	2025-07-08 06:59:14.074409+00	1
2bb0c3f4-375a-4374-9ba1-ef3b179f3096	feacd5c0241336f80df3a9be0d15312cc3feddfdbc671669ee8eb6154908e429	2025-07-11 13:55:19.665838+00	20250711105602_fix_revision_status_trigger	\N	\N	2025-07-11 13:55:19.264949+00	1
37a90818-4148-440d-b70e-efa214ecbf6e	c4c679ccf961c600da1ba20dba87a93ea2b3983d6cd88b8254bf8e9f35b46573	2025-07-08 09:19:41.375407+00	20250708091940_add_refund_id_to_credit_note	\N	\N	2025-07-08 09:19:40.918334+00	1
3de65623-01d7-43d7-93ec-5eedc35780c2	b921586fb7d426574f18990452156d12f858d401747a43c28cbdf56a288d6555	2025-07-08 14:37:16.757118+00	20250708143715_import_unique_per_stand	\N	\N	2025-07-08 14:37:16.360597+00	1
d2da473f-243d-4375-aa64-0a26744ae3bf	8495b308d30a3d314a279d965aec3b33530d59691995310811af2aada86b44ed	2025-07-08 14:44:17.344321+00	20250708144416_import_global_unique	\N	\N	2025-07-08 14:44:16.753075+00	1
c3b0375d-6ca0-4c4c-b859-2aab171c556e	ed8b208c7fdcba8ffb9b8b7988b9b6b0127121f56bb69472798ee94143c4fa23	2025-07-17 08:49:05.307417+00	20250715123839_add_check_table	\N	\N	2025-07-17 08:49:04.98844+00	1
b99b1562-7178-49e0-9598-7d2810fba2b5	91950fd6a86358ca439c878fc202df5c7f03bb71c41cbd2ce5bec17aa8e1404f	2025-07-11 13:55:16.084132+00	20250709115941_add_delivery_price	\N	\N	2025-07-11 13:55:15.782634+00	1
3b42beb9-0eea-4174-954a-cd0f9fc5a570	3ff33e47743c98c62572022fbacaf8e03833f192a576a4737182bb99137efbb7	2025-07-11 13:55:16.488421+00	20250709124555_add_partner_percentage_discount	\N	\N	2025-07-11 13:55:16.192118+00	1
0ddb60d6-2ac6-49e6-a99b-b52174908d56	50ac096b42d6e4b6ab356aa909b1e2f8c073e29ae926bacf3fc8b4706e154db7	2025-07-11 13:55:16.882876+00	20250709131729_add_historical_price_fields	\N	\N	2025-07-11 13:55:16.597916+00	1
37321c13-ff93-4451-a071-0acfeb871337	3057920408a03652c07723b00f1b7b547213139bbd873c6abda371d5327fca8d	2025-07-22 11:22:41.55215+00	20250722104931_add_product_images	\N	\N	2025-07-22 11:22:41.231697+00	1
87876568-97ca-4fb8-b56e-96e21a08ee88	b777ebc4012cab64725019411c9536eff3d3bd65ecc783ff5d0879235b244891	2025-07-11 13:55:17.502934+00	20250710130543_cash_registers_and_payments	\N	\N	2025-07-11 13:55:17.000051+00	1
025f1a39-32be-4ed0-a454-158537ce456c	b7d28009e68a6fb4bcba333745873e8171fd8a29fcdb1868a4fd36fcce1edd87	2025-07-11 13:55:18.328542+00	20250710131125_add_cash_register_payments_user_link	\N	\N	2025-07-11 13:55:17.629128+00	1
04b7a084-6c39-407f-9f96-ad87ebdc2dfd	af59423a1eb1a586f758a1311e796df2cc8cc101e1e857b84e21691d421b8dd8	2025-07-11 13:55:18.730717+00	20250710135335_add_reason_to_cash_movement	\N	\N	2025-07-11 13:55:18.453785+00	1
bb0dd821-a39f-4bd9-abc2-ec3587557c3c	39e12971723aa6223b26a8ff02d073968788144b34f19e63cf0b0464f4168878	2025-07-25 13:06:08.39784+00	20250723131724_store_schedule	\N	\N	2025-07-25 13:06:08.096999+00	1
02a0f7aa-689d-4a9e-a188-8383ff2b6fe0	0f9cf62d683e218c1981b735ffc61616c4294cef6cc74464bb16d0181284befd	2025-07-25 13:06:08.801556+00	20250724142540_add_given_quantity_to_missing_products	\N	\N	2025-07-25 13:06:08.511339+00	1
84f7dbbb-99eb-4317-b78d-8c1a6715727f	a6cc2f8625a74d6459fe92ae07a1438ae20ad6bf5067288f80c36120102df17d	2025-07-25 13:06:09.240355+00	20250724144922_add_original_quantity_to_checked_product	\N	\N	2025-07-25 13:06:08.911382+00	1
9f97ea1b-c0c3-4f7b-90e7-365a6511dcf7	e4dfa2ad64aec78f1599f72b6b1b143e7c23fa361b55c6083c9499ddc59f44ef	2025-07-25 13:06:09.682083+00	20250724145801_add_check_id_to_revision	\N	\N	2025-07-25 13:06:09.351717+00	1
\.


--
-- TOC entry 3625 (class 0 OID 37971)
-- Dependencies: 221
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, name, email, password, role, "emailVerified", "createdAt", "updatedAt") FROM stdin;
fbf6e56e-8542-40a5-926e-3021f55f9e82	Калоян Ангелов	kallnoob11@gmail.com	$2b$10$4IXQlsY1vP6n50kzDeX9iehJYO8j/3/b0.VLEX9pBoCGBI7OiJGZ.	ADMIN	\N	2025-07-08 14:14:51.063	2025-07-08 14:14:51.063
74a1cd5c-8ae8-40c4-b117-c7530a461026	Мирослава Цикалова	miroslava.tsikalova@gmail.com	$2b$10$I16fQUt0Yr3YumUZERS7ce69XvX2d5BIFMbM29Ig0LQQzQHery.F6	ADMIN	\N	2025-07-08 14:14:38.215	2025-07-14 06:07:30.629
bd1dbc60-a4ac-4824-959a-28a25dca77b3	Тестов	hui@gmail.com	$2b$10$2bA9fN/D.kQMx5MfsjAAX.du5/VfKS01u07CU6DXKx1cFyxYjtChC	USER	\N	2025-07-17 13:46:06.542	2025-07-17 13:46:06.542
68c49e88-dabd-47ae-a92d-dc83fa36cd43	Мирослава Цикалова	mirosslava.tsikalova@gmail.com	$2b$10$vSvqkZ2qLwv9CTsnOjuZVexxnnMjoJSEFIoYckOSTjgdXG2JuatRC	USER	\N	2025-07-11 10:35:58.061	2025-07-23 09:04:12.393
68b9923d-7800-4662-905e-a906d131314b	Асен Хаджиев	ahadjieb@gmail.com	$2b$10$p6f16ZJ/PYoZs/m.r2V8Ie1JAwMd4yEbL00bdPSEw38xqumAdGFWm	ADMIN	\N	2025-07-15 12:00:05.993	2025-08-11 09:42:58.954
af207ba8-617d-4f7f-a0fa-ee044c93017d	turg	turg@gmail.com	$2b$10$QeN59PMajCCpE3MX5RjsE.LxJ7z9agaP9XXkTy48FYnuuu1aCVLP2	USER	\N	2025-08-12 09:15:58.64	2025-08-12 09:15:58.64
\.


--
-- TOC entry 3426 (class 2606 OID 43849)
-- Name: CashMovement CashMovement_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CashMovement"
    ADD CONSTRAINT "CashMovement_pkey" PRIMARY KEY (id);


--
-- TOC entry 3421 (class 2606 OID 43833)
-- Name: CashRegister CashRegister_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CashRegister"
    ADD CONSTRAINT "CashRegister_pkey" PRIMARY KEY (id);


--
-- TOC entry 3367 (class 2606 OID 37963)
-- Name: Check Check_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Check"
    ADD CONSTRAINT "Check_pkey" PRIMARY KEY (id);


--
-- TOC entry 3369 (class 2606 OID 37970)
-- Name: CheckedProduct CheckedProduct_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CheckedProduct"
    ADD CONSTRAINT "CheckedProduct_pkey" PRIMARY KEY (id);


--
-- TOC entry 3393 (class 2606 OID 38043)
-- Name: CreditNote CreditNote_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CreditNote"
    ADD CONSTRAINT "CreditNote_pkey" PRIMARY KEY (id);


--
-- TOC entry 3419 (class 2606 OID 39007)
-- Name: ImportProduct ImportProduct_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ImportProduct"
    ADD CONSTRAINT "ImportProduct_pkey" PRIMARY KEY (id);


--
-- TOC entry 3417 (class 2606 OID 38103)
-- Name: Import Import_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Import"
    ADD CONSTRAINT "Import_pkey" PRIMARY KEY (id);


--
-- TOC entry 3390 (class 2606 OID 38034)
-- Name: Invoice Invoice_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Invoice"
    ADD CONSTRAINT "Invoice_pkey" PRIMARY KEY (id);


--
-- TOC entry 3381 (class 2606 OID 38010)
-- Name: MissingProduct MissingProduct_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MissingProduct"
    ADD CONSTRAINT "MissingProduct_pkey" PRIMARY KEY (id);


--
-- TOC entry 3374 (class 2606 OID 37986)
-- Name: Partner Partner_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Partner"
    ADD CONSTRAINT "Partner_pkey" PRIMARY KEY (id);


--
-- TOC entry 3424 (class 2606 OID 43841)
-- Name: Payment Payment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_pkey" PRIMARY KEY (id);


--
-- TOC entry 3362 (class 2606 OID 37948)
-- Name: Product Product_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_pkey" PRIMARY KEY (id);


--
-- TOC entry 3397 (class 2606 OID 38058)
-- Name: RefundProduct RefundProduct_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RefundProduct"
    ADD CONSTRAINT "RefundProduct_pkey" PRIMARY KEY (id);


--
-- TOC entry 3395 (class 2606 OID 38051)
-- Name: Refund Refund_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Refund"
    ADD CONSTRAINT "Refund_pkey" PRIMARY KEY (id);


--
-- TOC entry 3379 (class 2606 OID 38003)
-- Name: Revision Revision_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Revision"
    ADD CONSTRAINT "Revision_pkey" PRIMARY KEY (id);


--
-- TOC entry 3364 (class 2606 OID 37955)
-- Name: StandProduct StandProduct_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StandProduct"
    ADD CONSTRAINT "StandProduct_pkey" PRIMARY KEY (id);


--
-- TOC entry 3359 (class 2606 OID 37938)
-- Name: Stand Stand_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Stand"
    ADD CONSTRAINT "Stand_pkey" PRIMARY KEY (id);


--
-- TOC entry 3386 (class 2606 OID 38025)
-- Name: StorageProduct StorageProduct_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StorageProduct"
    ADD CONSTRAINT "StorageProduct_pkey" PRIMARY KEY (id);


--
-- TOC entry 3384 (class 2606 OID 38018)
-- Name: Storage Storage_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Storage"
    ADD CONSTRAINT "Storage_pkey" PRIMARY KEY (id);


--
-- TOC entry 3428 (class 2606 OID 45546)
-- Name: StoreSchedule StoreSchedule_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StoreSchedule"
    ADD CONSTRAINT "StoreSchedule_pkey" PRIMARY KEY (id);


--
-- TOC entry 3376 (class 2606 OID 37994)
-- Name: Store Store_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Store"
    ADD CONSTRAINT "Store_pkey" PRIMARY KEY (id);


--
-- TOC entry 3413 (class 2606 OID 38095)
-- Name: TransferProduct TransferProduct_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TransferProduct"
    ADD CONSTRAINT "TransferProduct_pkey" PRIMARY KEY (id);


--
-- TOC entry 3409 (class 2606 OID 38088)
-- Name: Transfer Transfer_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Transfer"
    ADD CONSTRAINT "Transfer_pkey" PRIMARY KEY (id);


--
-- TOC entry 3399 (class 2606 OID 38065)
-- Name: UserPartner UserPartner_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserPartner"
    ADD CONSTRAINT "UserPartner_pkey" PRIMARY KEY (id);


--
-- TOC entry 3402 (class 2606 OID 38072)
-- Name: UserStand UserStand_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserStand"
    ADD CONSTRAINT "UserStand_pkey" PRIMARY KEY (id);


--
-- TOC entry 3405 (class 2606 OID 38079)
-- Name: UserStorage UserStorage_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserStorage"
    ADD CONSTRAINT "UserStorage_pkey" PRIMARY KEY (id);


--
-- TOC entry 3356 (class 2606 OID 37910)
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 3372 (class 2606 OID 37979)
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- TOC entry 3422 (class 1259 OID 43850)
-- Name: CashRegister_storageId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "CashRegister_storageId_key" ON public."CashRegister" USING btree ("storageId");


--
-- TOC entry 3391 (class 1259 OID 38112)
-- Name: CreditNote_creditNoteNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "CreditNote_creditNoteNumber_key" ON public."CreditNote" USING btree ("creditNoteNumber");


--
-- TOC entry 3415 (class 1259 OID 42882)
-- Name: Import_fileName_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Import_fileName_key" ON public."Import" USING btree ("fileName");


--
-- TOC entry 3388 (class 1259 OID 38111)
-- Name: Invoice_invoiceNumber_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Invoice_invoiceNumber_key" ON public."Invoice" USING btree ("invoiceNumber");


--
-- TOC entry 3360 (class 1259 OID 38105)
-- Name: Product_barcode_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Product_barcode_key" ON public."Product" USING btree (barcode);


--
-- TOC entry 3377 (class 1259 OID 38108)
-- Name: Revision_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Revision_number_key" ON public."Revision" USING btree (number);


--
-- TOC entry 3365 (class 1259 OID 38106)
-- Name: StandProduct_standId_productId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "StandProduct_standId_productId_key" ON public."StandProduct" USING btree ("standId", "productId");


--
-- TOC entry 3357 (class 1259 OID 38104)
-- Name: Stand_barcode_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Stand_barcode_key" ON public."Stand" USING btree (barcode);


--
-- TOC entry 3387 (class 1259 OID 38110)
-- Name: StorageProduct_storageId_productId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "StorageProduct_storageId_productId_key" ON public."StorageProduct" USING btree ("storageId", "productId");


--
-- TOC entry 3382 (class 1259 OID 38109)
-- Name: Storage_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "Storage_name_key" ON public."Storage" USING btree (name);


--
-- TOC entry 3429 (class 1259 OID 45547)
-- Name: StoreSchedule_storeId_date_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "StoreSchedule_storeId_date_key" ON public."StoreSchedule" USING btree ("storeId", date);


--
-- TOC entry 3414 (class 1259 OID 38119)
-- Name: TransferProduct_transferId_productId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "TransferProduct_transferId_productId_key" ON public."TransferProduct" USING btree ("transferId", "productId");


--
-- TOC entry 3407 (class 1259 OID 38117)
-- Name: Transfer_destinationStorageId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Transfer_destinationStorageId_idx" ON public."Transfer" USING btree ("destinationStorageId");


--
-- TOC entry 3410 (class 1259 OID 38116)
-- Name: Transfer_sourceStorageId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Transfer_sourceStorageId_idx" ON public."Transfer" USING btree ("sourceStorageId");


--
-- TOC entry 3411 (class 1259 OID 38118)
-- Name: Transfer_userId_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "Transfer_userId_idx" ON public."Transfer" USING btree ("userId");


--
-- TOC entry 3400 (class 1259 OID 38113)
-- Name: UserPartner_userId_partnerId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "UserPartner_userId_partnerId_key" ON public."UserPartner" USING btree ("userId", "partnerId");


--
-- TOC entry 3403 (class 1259 OID 38114)
-- Name: UserStand_userId_standId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "UserStand_userId_standId_key" ON public."UserStand" USING btree ("userId", "standId");


--
-- TOC entry 3406 (class 1259 OID 38115)
-- Name: UserStorage_userId_storageId_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "UserStorage_userId_storageId_key" ON public."UserStorage" USING btree ("userId", "storageId");


--
-- TOC entry 3370 (class 1259 OID 38107)
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- TOC entry 3475 (class 2620 OID 43935)
-- Name: Payment payment_revision_status_update; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER payment_revision_status_update AFTER INSERT OR DELETE OR UPDATE ON public."Payment" FOR EACH ROW EXECUTE FUNCTION public.update_revision_status();


--
-- TOC entry 3474 (class 2620 OID 43816)
-- Name: Product trg_update_active_on_client_price; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_update_active_on_client_price BEFORE INSERT OR UPDATE ON public."Product" FOR EACH ROW EXECUTE FUNCTION public.update_active_based_on_client_price();


--
-- TOC entry 3471 (class 2606 OID 43876)
-- Name: CashMovement CashMovement_cashRegisterId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CashMovement"
    ADD CONSTRAINT "CashMovement_cashRegisterId_fkey" FOREIGN KEY ("cashRegisterId") REFERENCES public."CashRegister"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3472 (class 2606 OID 43881)
-- Name: CashMovement CashMovement_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CashMovement"
    ADD CONSTRAINT "CashMovement_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3466 (class 2606 OID 43851)
-- Name: CashRegister CashRegister_storageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CashRegister"
    ADD CONSTRAINT "CashRegister_storageId_fkey" FOREIGN KEY ("storageId") REFERENCES public."Storage"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3433 (class 2606 OID 38135)
-- Name: Check Check_standId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Check"
    ADD CONSTRAINT "Check_standId_fkey" FOREIGN KEY ("standId") REFERENCES public."Stand"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3434 (class 2606 OID 44460)
-- Name: Check Check_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Check"
    ADD CONSTRAINT "Check_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3435 (class 2606 OID 38140)
-- Name: CheckedProduct CheckedProduct_checkId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CheckedProduct"
    ADD CONSTRAINT "CheckedProduct_checkId_fkey" FOREIGN KEY ("checkId") REFERENCES public."Check"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3436 (class 2606 OID 38145)
-- Name: CheckedProduct CheckedProduct_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CheckedProduct"
    ADD CONSTRAINT "CheckedProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3447 (class 2606 OID 38195)
-- Name: CreditNote CreditNote_invoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CreditNote"
    ADD CONSTRAINT "CreditNote_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES public."Invoice"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3448 (class 2606 OID 41316)
-- Name: CreditNote CreditNote_refundId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."CreditNote"
    ADD CONSTRAINT "CreditNote_refundId_fkey" FOREIGN KEY ("refundId") REFERENCES public."Refund"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3464 (class 2606 OID 39008)
-- Name: ImportProduct ImportProduct_importId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ImportProduct"
    ADD CONSTRAINT "ImportProduct_importId_fkey" FOREIGN KEY ("importId") REFERENCES public."Import"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3465 (class 2606 OID 39013)
-- Name: ImportProduct ImportProduct_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."ImportProduct"
    ADD CONSTRAINT "ImportProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3461 (class 2606 OID 38265)
-- Name: Import Import_standId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Import"
    ADD CONSTRAINT "Import_standId_fkey" FOREIGN KEY ("standId") REFERENCES public."Stand"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3462 (class 2606 OID 38270)
-- Name: Import Import_storageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Import"
    ADD CONSTRAINT "Import_storageId_fkey" FOREIGN KEY ("storageId") REFERENCES public."Storage"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3463 (class 2606 OID 38260)
-- Name: Import Import_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Import"
    ADD CONSTRAINT "Import_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3443 (class 2606 OID 38180)
-- Name: MissingProduct MissingProduct_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MissingProduct"
    ADD CONSTRAINT "MissingProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3444 (class 2606 OID 38175)
-- Name: MissingProduct MissingProduct_revisionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."MissingProduct"
    ADD CONSTRAINT "MissingProduct_revisionId_fkey" FOREIGN KEY ("revisionId") REFERENCES public."Revision"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3467 (class 2606 OID 43856)
-- Name: Payment Payment_cashRegisterId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_cashRegisterId_fkey" FOREIGN KEY ("cashRegisterId") REFERENCES public."CashRegister"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3468 (class 2606 OID 43866)
-- Name: Payment Payment_invoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES public."Invoice"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3469 (class 2606 OID 43861)
-- Name: Payment Payment_revisionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_revisionId_fkey" FOREIGN KEY ("revisionId") REFERENCES public."Revision"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3470 (class 2606 OID 43871)
-- Name: Payment Payment_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3450 (class 2606 OID 38210)
-- Name: RefundProduct RefundProduct_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RefundProduct"
    ADD CONSTRAINT "RefundProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3451 (class 2606 OID 38205)
-- Name: RefundProduct RefundProduct_refundId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."RefundProduct"
    ADD CONSTRAINT "RefundProduct_refundId_fkey" FOREIGN KEY ("refundId") REFERENCES public."Refund"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3449 (class 2606 OID 38200)
-- Name: Refund Refund_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Refund"
    ADD CONSTRAINT "Refund_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3438 (class 2606 OID 45553)
-- Name: Revision Revision_checkId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Revision"
    ADD CONSTRAINT "Revision_checkId_fkey" FOREIGN KEY ("checkId") REFERENCES public."Check"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3439 (class 2606 OID 38165)
-- Name: Revision Revision_partnerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Revision"
    ADD CONSTRAINT "Revision_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES public."Partner"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3440 (class 2606 OID 38155)
-- Name: Revision Revision_standId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Revision"
    ADD CONSTRAINT "Revision_standId_fkey" FOREIGN KEY ("standId") REFERENCES public."Stand"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3441 (class 2606 OID 38160)
-- Name: Revision Revision_storageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Revision"
    ADD CONSTRAINT "Revision_storageId_fkey" FOREIGN KEY ("storageId") REFERENCES public."Storage"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- TOC entry 3442 (class 2606 OID 38170)
-- Name: Revision Revision_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Revision"
    ADD CONSTRAINT "Revision_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3431 (class 2606 OID 38130)
-- Name: StandProduct StandProduct_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StandProduct"
    ADD CONSTRAINT "StandProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3432 (class 2606 OID 38125)
-- Name: StandProduct StandProduct_standId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StandProduct"
    ADD CONSTRAINT "StandProduct_standId_fkey" FOREIGN KEY ("standId") REFERENCES public."Stand"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3430 (class 2606 OID 38120)
-- Name: Stand Stand_storeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Stand"
    ADD CONSTRAINT "Stand_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES public."Store"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3445 (class 2606 OID 38190)
-- Name: StorageProduct StorageProduct_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StorageProduct"
    ADD CONSTRAINT "StorageProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3446 (class 2606 OID 38185)
-- Name: StorageProduct StorageProduct_storageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StorageProduct"
    ADD CONSTRAINT "StorageProduct_storageId_fkey" FOREIGN KEY ("storageId") REFERENCES public."Storage"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3473 (class 2606 OID 45548)
-- Name: StoreSchedule StoreSchedule_storeId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."StoreSchedule"
    ADD CONSTRAINT "StoreSchedule_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES public."Store"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3437 (class 2606 OID 38150)
-- Name: Store Store_partnerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Store"
    ADD CONSTRAINT "Store_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES public."Partner"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3459 (class 2606 OID 38255)
-- Name: TransferProduct TransferProduct_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TransferProduct"
    ADD CONSTRAINT "TransferProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3460 (class 2606 OID 38250)
-- Name: TransferProduct TransferProduct_transferId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."TransferProduct"
    ADD CONSTRAINT "TransferProduct_transferId_fkey" FOREIGN KEY ("transferId") REFERENCES public."Transfer"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3458 (class 2606 OID 38245)
-- Name: Transfer Transfer_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."Transfer"
    ADD CONSTRAINT "Transfer_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3452 (class 2606 OID 38220)
-- Name: UserPartner UserPartner_partnerId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserPartner"
    ADD CONSTRAINT "UserPartner_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES public."Partner"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3453 (class 2606 OID 38215)
-- Name: UserPartner UserPartner_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserPartner"
    ADD CONSTRAINT "UserPartner_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3454 (class 2606 OID 38230)
-- Name: UserStand UserStand_standId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserStand"
    ADD CONSTRAINT "UserStand_standId_fkey" FOREIGN KEY ("standId") REFERENCES public."Stand"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3455 (class 2606 OID 38225)
-- Name: UserStand UserStand_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserStand"
    ADD CONSTRAINT "UserStand_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3456 (class 2606 OID 38240)
-- Name: UserStorage UserStorage_storageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserStorage"
    ADD CONSTRAINT "UserStorage_storageId_fkey" FOREIGN KEY ("storageId") REFERENCES public."Storage"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- TOC entry 3457 (class 2606 OID 38235)
-- Name: UserStorage UserStorage_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."UserStorage"
    ADD CONSTRAINT "UserStorage_userId_fkey" FOREIGN KEY ("userId") REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


-- Completed on 2025-08-13 13:08:32 EEST

--
-- PostgreSQL database dump complete
--

