CREATE TABLE canary_sensor_data (
  input_timestamp timestamp,
  sensor_id varchar(20),
  sensor_color char(7),
  canary_message JSONB
);
