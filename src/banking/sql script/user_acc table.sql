-- Table: public.user_acc

-- DROP TABLE IF EXISTS public.user_acc;

CREATE TABLE IF NOT EXISTS public.user_acc
(
    uuid uuid NOT NULL,
    account_num bigint NOT NULL,
    account_created timestamp without time zone NOT NULL DEFAULT now(),
    ava_bal numeric(10,2) NOT NULL DEFAULT 0,
    deposit numeric(10,2) NOT NULL DEFAULT 0,
    withdraw numeric(10,2) NOT NULL DEFAULT 0,
    CONSTRAINT user_acc_pkey PRIMARY KEY (account_num),
    CONSTRAINT fk_uuid FOREIGN KEY (uuid)
        REFERENCES public.customer (id) MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.user_acc
    OWNER to postgres;