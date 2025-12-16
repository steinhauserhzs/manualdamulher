-- Adicionar role 'admin' para haira@3pontos.com (user_id: c42ceeca-50f4-461a-aa27-ef414dbf309f)
INSERT INTO public.user_roles (user_id, role)
VALUES ('c42ceeca-50f4-461a-aa27-ef414dbf309f', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;