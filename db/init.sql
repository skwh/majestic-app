CREATE TABLE canary_sensor_data (
  input_timestamp timestamp NOT NULL,
  sensor_id varchar(20) NOT NULL,
  canary_message JSONB NOT NULL
);

CREATE TABLE canary_recent_data (
  input_timestamp timestamp UNIQUE,
  sensor_id varchar(20) PRIMARY KEY,
  canary_message JSONB NOT NULL,
  sensor_color char(7) NOT NULL
);

CREATE OR REPLACE FUNCTION canary_make_sensor_color() RETURNS char(7)
AS $canary_make_sensor_color$
  DECLARE
  colors char(7)[];
  idx int;
  BEGIN
    colors := ARRAY[
      '#F44336', -- Red 500
      '#00BCD4', -- Cyan 500
      '#4CAF50', -- Green 500
      '#E91E63', -- Pink 500
      '#9C27B0', -- Purple 500
      '#CDDC39', -- Lime 500
      '#607D8B', -- Blue Gray 500
      '#FF9800', -- Orange 500
      '#2196F3', -- Blue 500
      '#3F51B5', -- Indigo 500
      '#FF5722', -- Deep Orange 500
      '#03A9F4', -- Light Blue 500
      '#009688', -- Teal 500
      '#8BC34A', -- Light Green 500
      '#9E9E9E', -- Gray 500
      '#FFEB3B', -- Yellow 500
      '#673AB7', -- Deep Purple 500
      '#FFC107', -- Amber 500
      '#795548'  -- Brown 500
    ];
    idx := (SELECT COUNT(*) FROM canary_recent_data) + 1;
    RETURN colors[MOD(idx, cardinality(colors))];
  END;
$canary_make_sensor_color$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION canary_update_recent() RETURNS TRIGGER 
AS $canary_update_recent$
  BEGIN
    IF (NOT (SELECT EXISTS(SELECT 1 FROM canary_recent_data WHERE sensor_id=NEW.sensor_id))) THEN
        INSERT INTO canary_recent_data(input_timestamp, sensor_id, canary_message, sensor_color)
        VALUES (current_timestamp, NEW.sensor_id, NEW.canary_message, canary_make_sensor_color());
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