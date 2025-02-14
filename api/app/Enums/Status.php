<?php

namespace App\Enums;

enum Status: string
{
  case SUCCESS = 'SUCCESS';
  case FAILURE = 'FAILURE';
  case PENDING = 'PENDING';
}
