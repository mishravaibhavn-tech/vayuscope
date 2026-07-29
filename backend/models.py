from sqlalchemy import Column, Integer, String, Float, DateTime
from database import Base


class WeatherLog(Base):
    """A record of every location the user looked up."""
    __tablename__ = "weather_logs"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    latitude = Column(Float)
    longitude = Column(Float)
    temperature = Column(Float, nullable=True)
    weather_code = Column(Integer, nullable=True)
    wind_speed = Column(Float, nullable=True)
    queried_at = Column(DateTime, nullable=True)
