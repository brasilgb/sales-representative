import { maskMoney } from '@/Utils/mask';
import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import moment from 'moment';

const styles = StyleSheet.create({
    page: { padding: 28, fontSize: 8, color: '#111827' },
    title: { fontSize: 17, fontWeight: 'bold', textAlign: 'center' },
    subtitle: { marginTop: 5, fontSize: 9, textAlign: 'center', color: '#4b5563' },
    summary: { flexDirection: 'row', gap: 6, marginVertical: 16 },
    card: { flex: 1, borderWidth: 1, borderColor: '#d1d5db', padding: 7 },
    cardLabel: { color: '#6b7280' },
    cardValue: { marginTop: 4, fontSize: 10, fontWeight: 'bold' },
    row: { flexDirection: 'row', borderBottom: '1 solid #d1d5db', minHeight: 24, alignItems: 'center' },
    header: { backgroundColor: '#f3f4f6', fontWeight: 'bold' },
    order: { width: '12%', padding: 4 },
    date: { width: '13%', padding: 4 },
    customer: { width: '25%', padding: 4 },
    seller: { width: '20%', padding: 4 },
    sale: { width: '15%', padding: 4, textAlign: 'right' },
    commission: { width: '15%', padding: 4, textAlign: 'right' },
});

const labels: Record<string, string> = { all: 'Todas', pending: 'Previstas', realized: 'Realizadas', canceled: 'Canceladas' };

export default function CommissionReportPDF({ orders, summary, filters, sellerName }: any) {
    return (
        <Document>
            <Page size="A4" orientation="landscape" style={styles.page}>
                <Text style={styles.title}>Relatório de vendas e comissões</Text>
                <Text style={styles.subtitle}>
                    {moment(filters.start_date).format('DD/MM/YYYY')} a {moment(filters.end_date).format('DD/MM/YYYY')}
                    {' | '}{sellerName ?? 'Toda a equipe'}{' | '}{labels[filters.status] ?? filters.status}
                </Text>
                <View style={styles.summary}>
                    <Card label="Pedidos" value={String(summary.orders_count)} />
                    <Card label="Vendas válidas" value={`R$ ${maskMoney(summary.sales_total)}`} />
                    <Card label="Comissão prevista" value={`R$ ${maskMoney(summary.predicted)}`} />
                    <Card label="Comissão realizada" value={`R$ ${maskMoney(summary.realized)}`} />
                    <Card label="Comissão cancelada" value={`R$ ${maskMoney(summary.canceled)}`} />
                </View>
                <View style={[styles.row, styles.header]}>
                    <Text style={styles.order}>Pedido</Text><Text style={styles.date}>Emissão</Text><Text style={styles.customer}>Cliente</Text>
                    <Text style={styles.seller}>Vendedor</Text><Text style={styles.sale}>Venda</Text><Text style={styles.commission}>Comissão</Text>
                </View>
                {orders.map((order: any) => (
                    <View key={order.id} style={styles.row} wrap={false}>
                        <Text style={styles.order}>#{order.order_number}</Text>
                        <Text style={styles.date}>{moment(order.created_at).format('DD/MM/YYYY')}</Text>
                        <Text style={styles.customer}>{order.customer?.name ?? '-'}</Text>
                        <Text style={styles.seller}>{order.user?.name ?? '-'}</Text>
                        <Text style={styles.sale}>R$ {maskMoney(order.total)}</Text>
                        <Text style={styles.commission}>R$ {maskMoney(order.commission_amount)} ({Number(order.commission_percentage).toFixed(2)}%)</Text>
                    </View>
                ))}
            </Page>
        </Document>
    );
}

function Card({ label, value }: { label: string; value: string }) {
    return <View style={styles.card}><Text style={styles.cardLabel}>{label}</Text><Text style={styles.cardValue}>{value}</Text></View>;
}
