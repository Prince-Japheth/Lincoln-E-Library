

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


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE OR REPLACE FUNCTION "public"."get_book_status"("is_public_value" boolean) RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    IF is_public_value IS NULL THEN
        RETURN 'draft';
    ELSIF is_public_value = true THEN
        RETURN 'public';
    ELSE
        RETURN 'private';
    END IF;
END;
$$;


ALTER FUNCTION "public"."get_book_status"("is_public_value" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  insert into public.user_profiles (
    id,
    user_id,
    full_name,
    email,
    role,
    created_at,
    updated_at
  )
  values (
    gen_random_uuid(), -- id
    new.id, -- user_id
    coalesce(new.raw_user_meta_data->>'full_name', new.email), -- full_name
    new.email, -- email
    'user', -- default role
    now(), -- created_at
    now()  -- updated_at
  );
  return new;
end;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."run_sql"("sql" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql"
    AS $$
declare
  result jsonb;
begin
  execute format('select jsonb_agg(t) from (%s) t', sql) into result;
  return coalesce(result, '[]'::jsonb);
end;
$$;


ALTER FUNCTION "public"."run_sql"("sql" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_auth_users_to_user_profiles"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
begin
  insert into public.user_profiles (
    id,
    user_id,
    full_name,
    email,
    role,
    created_at,
    updated_at
  )
  select
    gen_random_uuid(),
    u.id,
    coalesce(u.raw_user_meta_data->>'full_name', u.email),
    u.email,
    'student',  -- <-- use 'student' or 'admin' as allowed by your constraint
    now(),
    now()
  from auth.users u
  left join public.user_profiles p on p.user_id = u.id
  where p.user_id is null;
end;
$$;


ALTER FUNCTION "public"."sync_auth_users_to_user_profiles"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."ai_chat_messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "session_id" "uuid",
    "role" "text" NOT NULL,
    "content" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "ai_chat_messages_role_check" CHECK (("role" = ANY (ARRAY['user'::"text", 'assistant'::"text"])))
);


ALTER TABLE "public"."ai_chat_messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."ai_chat_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "title" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."ai_chat_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."audit_logs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "action" "text" NOT NULL,
    "table_name" "text",
    "record_id" "uuid",
    "old_values" "jsonb",
    "new_values" "jsonb",
    "ip_address" "inet",
    "user_agent" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."audit_logs" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."book_requests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "title" "text" NOT NULL,
    "author" "text" NOT NULL,
    "description" "text",
    "status" "text" DEFAULT 'pending'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "book_requests_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'approved'::"text", 'denied'::"text"])))
);


ALTER TABLE "public"."book_requests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."books" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "author" "text" NOT NULL,
    "genre" "text" NOT NULL,
    "description" "text",
    "cover_image_url" "text",
    "file_url" "text" NOT NULL,
    "is_public" boolean,
    "course_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."books" OWNER TO "postgres";


COMMENT ON COLUMN "public"."books"."is_public" IS 'Book publication status: true = public, false = private, NULL = draft';



CREATE TABLE IF NOT EXISTS "public"."courses" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."courses" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."books_with_status" AS
 SELECT "b"."id",
    "b"."title",
    "b"."author",
    "b"."genre",
    "b"."description",
    "b"."cover_image_url",
    "b"."file_url",
    "b"."is_public",
    "b"."course_id",
    "b"."created_at",
    "b"."updated_at",
        CASE
            WHEN ("b"."is_public" IS NULL) THEN 'draft'::"text"
            WHEN ("b"."is_public" = true) THEN 'public'::"text"
            ELSE 'private'::"text"
        END AS "status_text",
    "c"."name" AS "course_name"
   FROM ("public"."books" "b"
     LEFT JOIN "public"."courses" "c" ON (("b"."course_id" = "c"."id")));


ALTER VIEW "public"."books_with_status" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."notifications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "title" "text" NOT NULL,
    "message" "text" NOT NULL,
    "type" "text" DEFAULT 'info'::"text",
    "read" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "notifications_type_check" CHECK (("type" = ANY (ARRAY['info'::"text", 'success'::"text", 'warning'::"text", 'error'::"text"])))
);


ALTER TABLE "public"."notifications" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."rate_limits" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "endpoint" "text" NOT NULL,
    "request_count" integer DEFAULT 1,
    "window_start" timestamp with time zone DEFAULT "now"(),
    "window_end" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."rate_limits" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."reading_progress" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "book_id" "uuid",
    "current_page" integer DEFAULT 1,
    "total_pages" integer,
    "progress_percentage" numeric(5,2) DEFAULT 0,
    "last_read_at" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "reading_time_minutes" integer DEFAULT 0,
    "session_start_time" timestamp with time zone,
    "session_end_time" timestamp with time zone
);


ALTER TABLE "public"."reading_progress" OWNER TO "postgres";


COMMENT ON TABLE "public"."reading_progress" IS 'Tracks user reading progress for books';



COMMENT ON COLUMN "public"."reading_progress"."user_id" IS 'Reference to auth.users';



COMMENT ON COLUMN "public"."reading_progress"."book_id" IS 'Reference to books table';



COMMENT ON COLUMN "public"."reading_progress"."current_page" IS 'Current page the user is reading';



COMMENT ON COLUMN "public"."reading_progress"."total_pages" IS 'Total pages in the book';



COMMENT ON COLUMN "public"."reading_progress"."progress_percentage" IS 'Percentage of book completed (0-100)';



COMMENT ON COLUMN "public"."reading_progress"."last_read_at" IS 'Timestamp of last reading activity';



COMMENT ON COLUMN "public"."reading_progress"."reading_time_minutes" IS 'Actual reading time in minutes';



COMMENT ON COLUMN "public"."reading_progress"."session_start_time" IS 'When the reading session started';



COMMENT ON COLUMN "public"."reading_progress"."session_end_time" IS 'When the reading session ended';



CREATE TABLE IF NOT EXISTS "public"."user_profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid",
    "full_name" "text",
    "email" "text",
    "role" "text" DEFAULT 'student'::"text",
    "profile_picture_url" "text",
    "bio" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "user_profiles_role_check" CHECK (("role" = ANY (ARRAY['student'::"text", 'admin'::"text"])))
);


ALTER TABLE "public"."user_profiles" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."user_roles" AS
 SELECT "user_id",
    "role"
   FROM "public"."user_profiles";


ALTER VIEW "public"."user_roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."videos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "title" "text" NOT NULL,
    "link" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "course_id" "uuid"
);


ALTER TABLE "public"."videos" OWNER TO "postgres";


ALTER TABLE ONLY "public"."ai_chat_messages"
    ADD CONSTRAINT "ai_chat_messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."ai_chat_sessions"
    ADD CONSTRAINT "ai_chat_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."book_requests"
    ADD CONSTRAINT "book_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."books"
    ADD CONSTRAINT "books_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."courses"
    ADD CONSTRAINT "courses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."rate_limits"
    ADD CONSTRAINT "rate_limits_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."rate_limits"
    ADD CONSTRAINT "rate_limits_user_id_endpoint_window_start_key" UNIQUE ("user_id", "endpoint", "window_start");



ALTER TABLE ONLY "public"."reading_progress"
    ADD CONSTRAINT "reading_progress_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."reading_progress"
    ADD CONSTRAINT "reading_progress_user_id_book_id_key" UNIQUE ("user_id", "book_id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_user_id_unique" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."videos"
    ADD CONSTRAINT "videos_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_books_is_public" ON "public"."books" USING "btree" ("is_public");



CREATE INDEX "idx_reading_progress_book_id" ON "public"."reading_progress" USING "btree" ("book_id");



CREATE INDEX "idx_reading_progress_last_read_at" ON "public"."reading_progress" USING "btree" ("last_read_at");



CREATE INDEX "idx_reading_progress_user_id" ON "public"."reading_progress" USING "btree" ("user_id");



CREATE OR REPLACE TRIGGER "update_books_updated_at" BEFORE UPDATE ON "public"."books" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."ai_chat_messages"
    ADD CONSTRAINT "ai_chat_messages_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "public"."ai_chat_sessions"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."ai_chat_sessions"
    ADD CONSTRAINT "ai_chat_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."audit_logs"
    ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."user_profiles"("user_id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."book_requests"
    ADD CONSTRAINT "book_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."books"
    ADD CONSTRAINT "books_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."notifications"
    ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."rate_limits"
    ADD CONSTRAINT "rate_limits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reading_progress"
    ADD CONSTRAINT "reading_progress_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."reading_progress"
    ADD CONSTRAINT "reading_progress_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."videos"
    ADD CONSTRAINT "videos_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE SET NULL;



CREATE POLICY "Admins can manage all notifications" ON "public"."notifications" USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles"
  WHERE (("user_profiles"."user_id" = "auth"."uid"()) AND ("user_profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can update all requests" ON "public"."book_requests" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles"
  WHERE (("user_profiles"."user_id" = "auth"."uid"()) AND ("user_profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can update any user profile" ON "public"."user_profiles" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles" "up"
  WHERE (("up"."user_id" = "auth"."uid"()) AND ("up"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can view all books including drafts" ON "public"."books" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles"
  WHERE (("user_profiles"."user_id" = "auth"."uid"()) AND ("user_profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can view all reading progress" ON "public"."reading_progress" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles"
  WHERE (("user_profiles"."user_id" = "auth"."uid"()) AND ("user_profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Admins can view all requests" ON "public"."book_requests" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles"
  WHERE (("user_profiles"."user_id" = "auth"."uid"()) AND ("user_profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Allow all authenticated users to read all profiles" ON "public"."user_profiles" FOR SELECT USING (true);



CREATE POLICY "Allow all users to read role column" ON "public"."user_profiles" FOR SELECT USING (true);



CREATE POLICY "Allow service role to read all profiles" ON "public"."user_profiles" FOR SELECT TO "service_role" USING (true);



CREATE POLICY "Allow users to read their own profile" ON "public"."user_profiles" FOR SELECT USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Anyone can view courses" ON "public"."courses" FOR SELECT USING (true);



CREATE POLICY "Anyone can view public books" ON "public"."books" FOR SELECT USING (("is_public" = true));



CREATE POLICY "Authenticated users can manage books" ON "public"."books" USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Authenticated users can manage courses" ON "public"."courses" USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Authenticated users can manage notifications" ON "public"."notifications" USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Authenticated users can update requests" ON "public"."book_requests" FOR UPDATE USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Authenticated users can view all books" ON "public"."books" FOR SELECT USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Authenticated users can view all profiles" ON "public"."user_profiles" FOR SELECT USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Authenticated users can view all requests" ON "public"."book_requests" FOR SELECT USING (("auth"."uid"() IS NOT NULL));



CREATE POLICY "Authenticated users can view private books" ON "public"."books" FOR SELECT USING ((("is_public" = false) AND ("auth"."uid"() IS NOT NULL)));



CREATE POLICY "Insert own profile" ON "public"."user_profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Only admins can manage books" ON "public"."books" USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles"
  WHERE (("user_profiles"."user_id" = "auth"."uid"()) AND ("user_profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Only admins can manage courses" ON "public"."courses" USING ((EXISTS ( SELECT 1
   FROM "public"."user_profiles"
  WHERE (("user_profiles"."user_id" = "auth"."uid"()) AND ("user_profiles"."role" = 'admin'::"text")))));



CREATE POLICY "Public can read public books" ON "public"."books" FOR SELECT USING (("is_public" = true));



CREATE POLICY "Users can create their own requests" ON "public"."book_requests" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own profile" ON "public"."user_profiles" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own chat messages" ON "public"."ai_chat_messages" USING ((EXISTS ( SELECT 1
   FROM "public"."ai_chat_sessions"
  WHERE (("ai_chat_sessions"."id" = "ai_chat_messages"."session_id") AND ("ai_chat_sessions"."user_id" = "auth"."uid"())))));



CREATE POLICY "Users can manage their own chat sessions" ON "public"."ai_chat_sessions" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own rate limits" ON "public"."rate_limits" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can manage their own reading progress" ON "public"."reading_progress" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update own profile" ON "public"."user_profiles" FOR UPDATE USING (("user_id" = "auth"."uid"()));



CREATE POLICY "Users can update their own notifications" ON "public"."notifications" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can update their own profile" ON "public"."user_profiles" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own notifications" ON "public"."notifications" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own profile" ON "public"."user_profiles" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own rate limits" ON "public"."rate_limits" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own requests" ON "public"."book_requests" FOR SELECT USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."ai_chat_messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."ai_chat_sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."book_requests" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."books" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."courses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notifications" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."rate_limits" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."reading_progress" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_profiles" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."get_book_status"("is_public_value" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."get_book_status"("is_public_value" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_book_status"("is_public_value" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."run_sql"("sql" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."run_sql"("sql" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."run_sql"("sql" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."sync_auth_users_to_user_profiles"() TO "anon";
GRANT ALL ON FUNCTION "public"."sync_auth_users_to_user_profiles"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."sync_auth_users_to_user_profiles"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."ai_chat_messages" TO "anon";
GRANT ALL ON TABLE "public"."ai_chat_messages" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_chat_messages" TO "service_role";



GRANT ALL ON TABLE "public"."ai_chat_sessions" TO "anon";
GRANT ALL ON TABLE "public"."ai_chat_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."ai_chat_sessions" TO "service_role";



GRANT ALL ON TABLE "public"."audit_logs" TO "anon";
GRANT ALL ON TABLE "public"."audit_logs" TO "authenticated";
GRANT ALL ON TABLE "public"."audit_logs" TO "service_role";



GRANT ALL ON TABLE "public"."book_requests" TO "anon";
GRANT ALL ON TABLE "public"."book_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."book_requests" TO "service_role";



GRANT ALL ON TABLE "public"."books" TO "anon";
GRANT ALL ON TABLE "public"."books" TO "authenticated";
GRANT ALL ON TABLE "public"."books" TO "service_role";



GRANT ALL ON TABLE "public"."courses" TO "anon";
GRANT ALL ON TABLE "public"."courses" TO "authenticated";
GRANT ALL ON TABLE "public"."courses" TO "service_role";



GRANT ALL ON TABLE "public"."books_with_status" TO "anon";
GRANT ALL ON TABLE "public"."books_with_status" TO "authenticated";
GRANT ALL ON TABLE "public"."books_with_status" TO "service_role";



GRANT ALL ON TABLE "public"."notifications" TO "anon";
GRANT ALL ON TABLE "public"."notifications" TO "authenticated";
GRANT ALL ON TABLE "public"."notifications" TO "service_role";



GRANT ALL ON TABLE "public"."rate_limits" TO "anon";
GRANT ALL ON TABLE "public"."rate_limits" TO "authenticated";
GRANT ALL ON TABLE "public"."rate_limits" TO "service_role";



GRANT ALL ON TABLE "public"."reading_progress" TO "anon";
GRANT ALL ON TABLE "public"."reading_progress" TO "authenticated";
GRANT ALL ON TABLE "public"."reading_progress" TO "service_role";



GRANT ALL ON TABLE "public"."user_profiles" TO "anon";
GRANT ALL ON TABLE "public"."user_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_profiles" TO "service_role";



GRANT ALL ON TABLE "public"."user_roles" TO "anon";
GRANT ALL ON TABLE "public"."user_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_roles" TO "service_role";



GRANT ALL ON TABLE "public"."videos" TO "anon";
GRANT ALL ON TABLE "public"."videos" TO "authenticated";
GRANT ALL ON TABLE "public"."videos" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























RESET ALL;
