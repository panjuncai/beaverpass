drop table message_read_by cascade;
drop table messages cascade;
drop table posts cascade;
drop table post_images cascade;
drop table chat_room_participants cascade;
drop table chat_rooms cascade;
drop table users cascade;
drop table orders cascade;

drop type message_type_enum;
drop type post_category_enum;
drop type post_condition_enum;
drop type delivery_type_enum;
drop type post_status_enum;
drop type order_status_enum;


CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  avatar TEXT,
  address TEXT,
  phone TEXT,
  school_email TEXT,
  school_email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL CHECK (char_length(description) <= 500),
  condition TEXT NOT NULL,
  
  amount numeric(12,2) NOT NULL DEFAULT 0,
  is_negotiable BOOLEAN DEFAULT FALSE,

  delivery_type TEXT NOT NULL,
  poster_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- 如果想保留约束，限制价格至少>=0，可以这样：
  CHECK (amount >= 0)
);
CREATE INDEX idx_posts_poster_id ON posts(poster_id);

CREATE TABLE post_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_type TEXT,  -- 可选，比如 'front', 'side', 'back', 'damage'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_post_images_post_id ON post_images(post_id);


CREATE TABLE chat_rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chat_room_participants (
  chat_room_id UUID NOT NULL,
  user_id UUID NOT NULL,
  is_online BOOLEAN DEFAULT FALSE,
  is_typing BOOLEAN DEFAULT FALSE,
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (chat_room_id,user_id),
  FOREIGN KEY (chat_room_id) REFERENCES chat_rooms(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  temporary_id UUID,
  chat_room_id UUID NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'SENT',
  content TEXT,
  post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
  message_type TEXT NOT NULL DEFAULT 'TEXT',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  CHECK (
    (message_type != 'POST' AND content IS NOT NULL AND post_id IS NULL)
    OR
    (message_type = 'POST' AND post_id IS NOT NULL AND content IS NULL)
  )
);
CREATE INDEX idx_messages_chat_room_id ON messages(chat_room_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);

CREATE TABLE message_read_by (
  message_id UUID NOT NULL,
  user_id UUID NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (message_id, user_id),
  FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE ON UPDATE NO ACTION,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE NO ACTION
);

CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  buyer_id UUID NOT NULL REFERENCES users(id),
  seller_id UUID NOT NULL REFERENCES users(id),

  post_id UUID NOT NULL REFERENCES posts(id),

  -- 收货信息
  shipping_address TEXT NOT NULL,
  shipping_receiver TEXT NOT NULL,
  shipping_phone TEXT NOT NULL,

  -- 支付信息
  payment_method TEXT NOT NULL,
  payment_transaction_id TEXT,

  -- 金额计算相关
  payment_fee NUMERIC(12,2) DEFAULT 0,
  delivery_fee NUMERIC(12,2) DEFAULT 0,
  service_fee NUMERIC(12,2) DEFAULT 0,
  tax NUMERIC(12,2) DEFAULT 0,
  total NUMERIC(12,2) NOT NULL,

  -- 订单状态
  status TEXT NOT NULL DEFAULT 'PENDING_PAYMENT',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX idx_orders_seller_id ON orders(seller_id);

-- 在 Supabase SQL 编辑器中执行
alter publication supabase_realtime add table messages, chat_room_participants, message_read_by;

-- 为messages表启用RLS
--ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- 创建允许读取消息的策略
-- CREATE POLICY "允许查看聊天室消息" ON messages
--   FOR SELECT 
--   USING (
--     chat_room_id IN (
--       SELECT chat_room_id 
--       FROM chat_room_participants 
--       WHERE user_id = auth.uid()
--     )
--   );

-- 创建允许创建消息的策略
-- CREATE POLICY "允许发送消息" ON messages
--   FOR INSERT 
--   WITH CHECK (
--     sender_id = auth.uid() AND
--     chat_room_id IN (
--       SELECT chat_room_id 
--       FROM chat_room_participants 
--       WHERE user_id = auth.uid()
--     )
--   );

-- 用户创建触发器函数
-- CREATE OR REPLACE FUNCTION public.handle_user_create()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   INSERT INTO public.users (
--     id,
--     first_name,
--     last_name,
--     phone,
--     address,
--     avatar,
--     email,
--     created_at,
--     updated_at
--   ) VALUES (
--     NEW.id,
--     (NEW.raw_user_meta_data->>'firstName'),
--     (NEW.raw_user_meta_data->>'lastName'),
--     (NEW.raw_user_meta_data->>'phone'),
--     (NEW.raw_user_meta_data->>'address'),
--     (NEW.raw_user_meta_data->>'avatar'),
--     NEW.email,
--     NOW(),
--     NOW()
--   );
  
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql SECURITY DEFINER;

-- -- 创建触发器
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW
--   EXECUTE FUNCTION public.handle_user_create();

-- 首先创建触发器函数
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
  -- 更新 public.users 表中对应的记录
  UPDATE public.users
  SET 
    first_name = (NEW.raw_user_meta_data->>'firstName'),
    last_name = (NEW.raw_user_meta_data->>'lastName'),
    phone = (NEW.raw_user_meta_data->>'phone'),
    address = (NEW.raw_user_meta_data->>'address'),
    avatar = (NEW.raw_user_meta_data->>'avatar'),
    school_email = (NEW.raw_user_meta_data->>'schoolEmail'),
    updated_at = NOW()
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 然后创建触发器
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_user_update();


-- 用户创建触发器函数
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  first_name_val TEXT;
  last_name_val TEXT;
  avatar_url_val TEXT;
BEGIN
  -- 调试信息，可以在生产环境中移除
  RAISE NOTICE 'Raw user meta data: %', NEW.raw_user_meta_data;

  -- 尝试从不同来源获取名字
  first_name_val := 
    COALESCE(
      -- 邮件注册时的自定义字段
      NEW.raw_user_meta_data->>'firstName',
      NEW.raw_user_meta_data->>'first_name',
      
      -- 社交登录时的字段
      split_part(NEW.raw_user_meta_data->>'full_name', ' ', 1),
      split_part(NEW.raw_user_meta_data->>'name', ' ', 1),
      
      -- 默认值
      ''
    );
    
  -- 尝试从不同来源获取姓氏
  last_name_val := 
    COALESCE(
      -- 邮件注册时的自定义字段
      NEW.raw_user_meta_data->>'lastName',
      NEW.raw_user_meta_data->>'last_name',
      
      -- 社交登录时的字段
      split_part(NEW.raw_user_meta_data->>'full_name', ' ', 2),
      split_part(NEW.raw_user_meta_data->>'name', ' ', 2),
      
      -- 默认值
      ''
    );
    
  -- 尝试从不同来源获取头像
  avatar_url_val := 
    COALESCE(
      -- 不同提供商可能使用的字段
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture',
      NEW.raw_user_meta_data->>'avatar',
      
      -- 默认值
      ''
    );

  -- 插入到 public.users 表
  INSERT INTO public.users (
    id,
    email,
    first_name,
    last_name,
    avatar,
    created_at
  ) VALUES (
    NEW.id,
    NEW.email,
    first_name_val,
    last_name_val,
    avatar_url_val,
    NEW.created_at
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 用户创建触发器
CREATE TRIGGER on_auth_user_created 
AFTER INSERT ON auth.users 
FOR EACH ROW EXECUTE FUNCTION handle_new_user()