from django.utils import timezone
from .models import FinancialTransaction, TransactionDirection, TransactionType


class FinanceService:
    """Creates FinancialTransaction rows as side-effects of money events."""

    @staticmethod
    def record_order_payment(order, amount: float, method: str, recorded_by) -> FinancialTransaction:
        return FinancialTransaction.objects.create(
            date=timezone.now().date(),
            amount=amount,
            direction=TransactionDirection.IN,
            type=TransactionType.ORDER_PAYMENT,
            payment_method=method,
            description=f'Payment for order {order.id}',
            recorded_by=recorded_by,
            order=order,
        )

    @staticmethod
    def record_sale(sale, recorded_by) -> FinancialTransaction:
        customer_label = f' — {sale.customer_name}' if sale.customer_name else ''
        return FinancialTransaction.objects.create(
            date=timezone.now().date(),
            amount=sale.total_price,
            direction=TransactionDirection.IN,
            type=TransactionType.SALE,
            payment_method=sale.payment_method,
            description=f'Walk-in sale{customer_label}',
            recorded_by=recorded_by,
            sale=sale,
        )
