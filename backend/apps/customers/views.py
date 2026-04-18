from rest_framework import filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.viewsets import ModelViewSet

from .models import Customer
from .serializers import CustomerSerializer


class CustomerViewSet(ModelViewSet):
    """
    /api/customers/        — list / create
    /api/customers/{id}/   — retrieve / partial_update
    """
    queryset = Customer.objects.all().order_by('name')
    serializer_class = CustomerSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'phone', 'email']
    ordering_fields = ['name', 'total_spent', 'last_order_date']
    ordering = ['name']
    http_method_names = ['get', 'post', 'patch', 'head', 'options']

    def get_queryset(self):
        qs = super().get_queryset()
        is_gold = self.request.query_params.get('is_gold')
        if is_gold is not None:
            qs = qs.filter(is_gold=is_gold.lower() in ('true', '1'))
        return qs
