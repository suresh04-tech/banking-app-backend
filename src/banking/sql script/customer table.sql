-- Table: public.customer

-- DROP TABLE IF EXISTS public.customer;

CREATE TABLE IF NOT EXISTS public.customer
(
    username character varying(255) COLLATE pg_catalog."default" NOT NULL,
    phonenum character varying(15) COLLATE pg_catalog."default" NOT NULL,
    password character varying(255) COLLATE pg_catalog."default" NOT NULL,
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    CONSTRAINT customer_pkey PRIMARY KEY (id),
    CONSTRAINT customer_phonenum_key UNIQUE (phonenum),
    CONSTRAINT unique_uuid UNIQUE (id)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.customer
    OWNER to postgres;