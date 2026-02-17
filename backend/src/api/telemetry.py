# azure opentelemetry integration
import os
import logging
from azure.monitor.opentelemetry import configure_azure_monitor


logger = logging.getLogger("brand-guardian-telemetry")

def setup_telemetry():
    """
    Initializes Azure Monitor OpenTelemetry.

    What is OpenTelemetry?
    - Industry-standard observability framework
    - Tracks: HTTP requests, database queries, errors, performance metrics
    - Sends this data to Azure Monitor(like a "flight data recorder" for your app)

    What does "hooks into FastAPI automatically" mean?
    - Once configured, it auto-captures every API request/response
    - No need to manuallu log each endpoint
    - Tracks response times, error rates, dependencies (like Azure Search calls)
    """

    connection_string = os.getenv("APPLICATIONINSIGHTS_CONNECTION_STRING")
    # ========== STEP 2: CHECK IF CONFIGURED ==========
    if not connection_string:
        # If the environment variable is missing/empty, telemetry won't work
        # 
        logger.warning("No Instrumentation Key found. Telemetry is DISABLED.")
        return
    
    try:
        configure_azure_monitor(
            connection_string=connection_string,
            logger_name = "brand-guardian-tracer"
        )

        logger.info("Azure Monitor Tracking Enabled & Connected!")

    except Exception as e:
        logger.error(f"Failed to initialize Azure Monitor: {e} ")