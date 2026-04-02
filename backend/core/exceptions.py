from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    """
    Wraps DRF's default exception handler so all errors return a consistent
    JSON shape. Prevents raw tracebacks from leaking in production.
    """
    response = exception_handler(exc, context)

    if response is not None:
        return response

    # Unhandled exception — return generic 500 without traceback details
    return Response(
        {'detail': 'A server error occurred. The team has been notified.'},
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
