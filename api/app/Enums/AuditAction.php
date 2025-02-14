<?php

namespace App\Enums;

enum AuditAction: string
{
  case CREATED = 'CREATED';
  case UPDATED = 'UPDATED';
  case DELETED = 'DELETED';
}
