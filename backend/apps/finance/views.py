from rest_framework import viewsets, status
from rest_framework.response import Response
from core.permissions import IsManager, IsManagerOrInventory
from .models import FinancialTransaction
from .serializers import FinancialTransactionSerializer, ExpenseCreateSerializer


class FinancialTransactionViewSet(viewsets.GenericViewSet):
    """
    GET  /api/transactions/  — list with optional filters
    POST /api/transactions/  — create an expense row (direction='out' only)

    Query params for GET:
        direction   in | out
        type        order_payment | sale | stock_expense | business_expense
        start       YYYY-MM-DD
        end         YYYY-MM-DD
    """

    def get_queryset(self):
        qs = FinancialTransaction.objects.select_related('recorded_by', 'order', 'sale')
        params = self.request.query_params

        if direction := params.get('direction'):
            qs = qs.filter(direction=direction)
        if tx_type := params.get('type'):
            qs = qs.filter(type=tx_type)
        if start := params.get('start'):
            qs = qs.filter(date__gte=start)
        if end := params.get('end'):
            qs = qs.filter(date__lte=end)

        return qs

    def get_permissions(self):
        if self.action == 'create':
            return [IsManagerOrInventory()]
        return [IsManager()]

    def list(self, request):
        qs = self.get_queryset()
        page = self.paginate_queryset(qs)
        if page is not None:
            return self.get_paginated_response(FinancialTransactionSerializer(page, many=True).data)
        return Response(FinancialTransactionSerializer(qs, many=True).data)

    def create(self, request):
        serializer = ExpenseCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        tx = serializer.save(recorded_by=request.user)
        return Response(FinancialTransactionSerializer(tx).data, status=status.HTTP_201_CREATED)
