schema "public" {}

table "users" {
  schema = schema.public

  column "id" {
    type = serial
  }
  column "email" {
    type = varchar(255)
  }
  column "name" {
    type = varchar(255)
  }
  column "password_hash" {
    type = varchar(255)
  }
  column "created_at" {
    type    = timestamp
    default = sql("CURRENT_TIMESTAMP")
  }

  primary_key {
    columns = [column.id]
  }

  index "idx_users_email" {
    columns = [column.email]
    unique  = true
  }
}

table "properties" {
  schema = schema.public

  column "id" {
    type = serial
  }
  column "title" {
    type = varchar(255)
  }
  column "location" {
    type = varchar(255)
  }
  column "price_per_night" {
    type = decimal(10, 2)
  }
  column "rating" {
    type    = decimal(2, 1)
    default = 0
  }
  column "reviews" {
    type    = integer
    default = 0
  }
  column "guests" {
    type = integer
  }
  column "bedrooms" {
    type = integer
  }
  column "bathrooms" {
    type = integer
  }
  column "type" {
    type = varchar(50)
  }
  column "amenities" {
    type    = sql("text[]")
    default = sql("'{}'")
  }
  column "image" {
    type = varchar(500)
    null = true
  }
  column "owner_id" {
    type = integer
    null = true
  }
  column "created_at" {
    type    = timestamp
    default = sql("CURRENT_TIMESTAMP")
  }

  primary_key {
    columns = [column.id]
  }

  foreign_key "fk_properties_owner" {
    columns     = [column.owner_id]
    ref_columns = [table.users.column.id]
    on_delete   = SET_NULL
  }

  index "idx_properties_location" {
    columns = [column.location]
  }

  index "idx_properties_type" {
    columns = [column.type]
  }
}

table "bookings" {
  schema = schema.public

  column "id" {
    type = serial
  }
  column "user_id" {
    type = integer
  }
  column "property_id" {
    type = integer
  }
  column "start_date" {
    type = date
  }
  column "end_date" {
    type = date
  }
  column "guests" {
    type = integer
  }
  column "status" {
    type    = varchar(50)
    default = "pending"
  }
  column "created_at" {
    type    = timestamp
    default = sql("CURRENT_TIMESTAMP")
  }

  primary_key {
    columns = [column.id]
  }

  foreign_key "fk_bookings_user" {
    columns     = [column.user_id]
    ref_columns = [table.users.column.id]
    on_delete   = CASCADE
  }

  foreign_key "fk_bookings_property" {
    columns     = [column.property_id]
    ref_columns = [table.properties.column.id]
    on_delete   = CASCADE
  }

  index "idx_bookings_user_id" {
    columns = [column.user_id]
  }

  index "idx_bookings_property_id" {
    columns = [column.property_id]
  }
}

table "favourites" {
  schema = schema.public

  column "id" {
    type = serial
  }
  column "user_id" {
    type = integer
  }
  column "property_id" {
    type = integer
  }
  column "created_at" {
    type    = timestamp
    default = sql("CURRENT_TIMESTAMP")
  }

  primary_key {
    columns = [column.id]
  }

  foreign_key "fk_favourites_user" {
    columns     = [column.user_id]
    ref_columns = [table.users.column.id]
    on_delete   = CASCADE
  }

  foreign_key "fk_favourites_property" {
    columns     = [column.property_id]
    ref_columns = [table.properties.column.id]
    on_delete   = CASCADE
  }

  index "idx_favourites_unique" {
    columns = [column.user_id, column.property_id]
    unique  = true
  }
}

table "conversations" {
  schema = schema.public

  column "id" {
    type = serial
  }
  column "user_id" {
    type = integer
  }
  column "contact_name" {
    type = varchar(255)
  }
  column "contact_type" {
    type = varchar(50)
  }
  column "property_name" {
    type = varchar(255)
    null = true
  }
  column "created_at" {
    type    = timestamp
    default = sql("CURRENT_TIMESTAMP")
  }

  primary_key {
    columns = [column.id]
  }

  foreign_key "fk_conversations_user" {
    columns     = [column.user_id]
    ref_columns = [table.users.column.id]
    on_delete   = CASCADE
  }
}

table "messages" {
  schema = schema.public

  column "id" {
    type = serial
  }
  column "conversation_id" {
    type = integer
  }
  column "sender_id" {
    type = integer
    null = true
  }
  column "text" {
    type = text
  }
  column "read" {
    type    = boolean
    default = false
  }
  column "created_at" {
    type    = timestamp
    default = sql("CURRENT_TIMESTAMP")
  }

  primary_key {
    columns = [column.id]
  }

  foreign_key "fk_messages_conversation" {
    columns     = [column.conversation_id]
    ref_columns = [table.conversations.column.id]
    on_delete   = CASCADE
  }

  foreign_key "fk_messages_sender" {
    columns     = [column.sender_id]
    ref_columns = [table.users.column.id]
    on_delete   = SET_NULL
  }

  index "idx_messages_conversation_id" {
    columns = [column.conversation_id]
  }
}
