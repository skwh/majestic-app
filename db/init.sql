CREATE TABLE canary_sensor_data (
  input_timestamp timestamp NOT NULL,
  sensor_id varchar(20) NOT NULL,
  canary_message JSONB NOT NULL
);

CREATE TABLE canary_sensor_colors (
  sensor_id varchar(20) PRIMARY KEY,
  sensor_color char(7) NOT NULL
)