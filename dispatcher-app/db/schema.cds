namespace dispatcher;

entity Drivers {
  key driverId  : String(10);
  name          : String(100);
  van           : String(20);
  route         : String(20);
  status        : String(20);  // on-route | idle | late | break | depot
  stops         : Integer;
  done          : Integer;
  lat           : Decimal(10, 4);
  lng           : Decimal(10, 4);
  phone         : String(30);
  stockPct      : Integer;
  sales         : Decimal(12, 2);
  lastPing      : String(10);
  initials      : String(5);
  shift         : String(20);
}

entity Orders {
  key orderId   : String(20);
  customer      : String(100);
  code          : String(20);
  priority      : String(5);   // P-A | P-B | P-C
  items         : Integer;
  value         : Decimal(12, 2);
  window        : String(20);
  km            : Decimal(8, 1);
  city          : String(50);
  status        : String(20);  // open | assigned
  lat           : Decimal(10, 4);
  lng           : Decimal(10, 4);
}

entity Assignments {
  key assignmentId : UUID;
  orderId          : String(20);
  driverId         : String(10);
  assignedAt       : Timestamp;
  pushedAt         : Timestamp;
  pushedBy         : String(50);
  status           : String(20);  // assigned | pushed | delivered
}

entity Alerts {
  key alertId   : Integer;
  severity      : String(10);  // high | med | low
  text          : String(500);
  time          : String(20);
  actor         : String(50);
  createdAt     : Timestamp;
  resolved      : Boolean;
}

entity OrderItems {
  key itemId    : Integer;
  orderId       : String(20);
  sku           : String(20);
  name          : String(100);
  qty           : Integer;
  unitPrice     : Decimal(10, 2);
  lineTotal     : Decimal(10, 2);
}
