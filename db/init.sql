CREATE TABLE canary_sensor_data (
  input_timestamp timestamp NOT NULL,
  sensor_id varchar(20) NOT NULL,
  canary_message JSONB NOT NULL
);

CREATE TABLE canary_sensor_colors (
  sensor_id varchar(20) PRIMARY KEY,
  sensor_color char(7) NOT NULL
);

CREATE TABLE canary_recent_data (
  input_timestamp timestamp UNIQUE,
  sensor_id varchar(20) PRIMARY KEY,
  canary_message JSONB NOT NULL
);

CREATE OR REPLACE FUNCTION canary_update_recent() RETURNS TRIGGER 
AS $canary_update_recent$
  BEGIN
    IF (NOT (SELECT EXISTS(SELECT 1 FROM canary_recent_data WHERE sensor_id=NEW.sensor_id))) THEN
      INSERT INTO canary_recent_data(input_timestamp, sensor_id, canary_message)
      VALUES (current_timestamp, NEW.sensor_id, NEW.canary_message);
    ELSE
      UPDATE canary_recent_data
      SET canary_message = NEW.canary_message, input_timestamp=current_timestamp
      WHERE sensor_id = NEW.sensor_id;
    END IF;
    RETURN NULL;
  END; 
$canary_update_recent$ LANGUAGE plpgsql;

CREATE TRIGGER canary_update_recent 
  AFTER INSERT ON canary_sensor_data 
  FOR EACH ROW EXECUTE PROCEDURE canary_update_recent();