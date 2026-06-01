using dispatcher from '../db/schema';

service DispatcherService @(path: '/dispatcher') {

  entity Drivers    as projection on dispatcher.Drivers;
  entity Orders     as projection on dispatcher.Orders;
  entity Assignments as projection on dispatcher.Assignments;
  entity Alerts     as projection on dispatcher.Alerts;
  entity OrderItems as projection on dispatcher.OrderItems;

  action AutoAssign()                        returns array of Assignments;
  action PushRoute(driverId : String)        returns Boolean;
  action MarkDelivered(assignmentId : UUID)  returns Boolean;
  action UpdatePositions()                   returns array of {
    driverId : String;
    lat      : Decimal;
    lng      : Decimal;
    lastPing : String;
    speed    : Decimal;
  };
}
